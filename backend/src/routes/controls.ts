import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

async function generateControlCode(): Promise<string> {
  const { count } = await supabaseAdmin.from('controls').select('*', { count: 'exact', head: true });
  return `CTL-${String((count || 0) + 1).padStart(4, '0')}`;
}

// GET /
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const sort_by = (req.query.sort_by as string) || 'created_at';
    const sort_order = (req.query.sort_order as string) === 'asc';

    let query = supabaseAdmin.from('controls').select('*', { count: 'exact' });

    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    if (type) query = query.eq('type', type);
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query
      .order(sort_by, { ascending: sort_order })
      .range(offset, offset + limit - 1);

    if (error) return res.status(500).json({ success: false, error: error.message });

    const total = count || 0;
    return res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { data: control, error } = await supabaseAdmin
      .from('controls')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ success: false, error: 'Control not found' });

    const { data: riskControls } = await supabaseAdmin
      .from('risk_controls')
      .select('risk_id')
      .eq('control_id', control.id);

    let risks: any[] = [];
    if (riskControls && riskControls.length > 0) {
      const riskIds = riskControls.map((rc) => rc.risk_id);
      const { data } = await supabaseAdmin.from('risks').select('*').in('id', riskIds);
      risks = data || [];
    }

    return res.json({ success: true, data: { ...control, risks } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /
router.post('/', authenticate, authorize('admin', 'analyst'), async (req: Request, res: Response) => {
  try {
    const control_code = await generateControlCode();

    const { data, error } = await supabaseAdmin
      .from('controls')
      .insert({ ...req.body, control_code, created_by: req.userId })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'create',
      entity_type: 'controls',
      entity_id: data.id,
      details: { control_code, title: data.title },
      ip_address: req.ip,
    });

    return res.status(201).json({ success: true, data, message: 'Control created' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id
router.put('/:id', authenticate, authorize('admin', 'analyst'), async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('controls')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'update',
      entity_type: 'controls',
      entity_id: req.params.id,
      details: req.body,
      ip_address: req.ip,
    });

    return res.json({ success: true, data, message: 'Control updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id
router.delete('/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('controls').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'delete',
      entity_type: 'controls',
      entity_id: req.params.id,
      ip_address: req.ip,
    });

    return res.json({ success: true, message: 'Control deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/risks — link risk to control
router.post('/:id/risks', authenticate, authorize('admin', 'analyst'), async (req: Request, res: Response) => {
  try {
    const { risk_id } = req.body;
    if (!risk_id) return res.status(400).json({ success: false, error: 'risk_id is required' });

    const { data, error } = await supabaseAdmin
      .from('risk_controls')
      .insert({ risk_id, control_id: req.params.id })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'link_risk',
      entity_type: 'risk_controls',
      entity_id: data.id,
      details: { risk_id, control_id: req.params.id },
      ip_address: req.ip,
    });

    return res.status(201).json({ success: true, data, message: 'Risk linked to control' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id/risks/:riskId — unlink risk
router.delete('/:id/risks/:riskId', authenticate, authorize('admin', 'analyst'), async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin
      .from('risk_controls')
      .delete()
      .eq('control_id', req.params.id)
      .eq('risk_id', req.params.riskId);

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'unlink_risk',
      entity_type: 'risk_controls',
      details: { risk_id: req.params.riskId, control_id: req.params.id },
      ip_address: req.ip,
    });

    return res.json({ success: true, message: 'Risk unlinked from control' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
