import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

async function generateFindingCode(): Promise<string> {
  const { count } = await supabaseAdmin.from('findings').select('*', { count: 'exact', head: true });
  return `FND-${String((count || 0) + 1).padStart(4, '0')}`;
}

// GET /
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const severity = req.query.severity as string;
    const status = req.query.status as string;
    const source = req.query.source as string;
    const sort_by = (req.query.sort_by as string) || 'created_at';
    const sort_order = (req.query.sort_order as string) === 'asc';

    let query = supabaseAdmin.from('findings').select('*', { count: 'exact' });

    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    if (type) query = query.eq('type', type);
    if (severity) query = query.eq('severity', severity);
    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);

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
    const { data: finding, error } = await supabaseAdmin
      .from('findings')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ success: false, error: 'Finding not found' });

    const { data: remediations } = await supabaseAdmin
      .from('remediation_plans')
      .select('*')
      .eq('finding_id', finding.id);

    return res.json({ success: true, data: { ...finding, remediation_plans: remediations || [] } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /
router.post('/', authenticate, authorize('admin', 'analyst', 'auditor'), async (req: Request, res: Response) => {
  try {
    const finding_code = await generateFindingCode();

    const { data, error } = await supabaseAdmin
      .from('findings')
      .insert({
        ...req.body,
        finding_code,
        identified_by: req.userId,
        identified_date: req.body.identified_date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'create',
      entity_type: 'findings',
      entity_id: data.id,
      details: { finding_code, title: data.title },
      ip_address: req.ip,
    });

    return res.status(201).json({ success: true, data, message: 'Finding created' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id
router.put('/:id', authenticate, authorize('admin', 'analyst', 'auditor'), async (req: Request, res: Response) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    if (updates.status === 'closed' && !updates.closed_date) {
      updates.closed_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabaseAdmin
      .from('findings')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'update',
      entity_type: 'findings',
      entity_id: req.params.id,
      details: req.body,
      ip_address: req.ip,
    });

    return res.json({ success: true, data, message: 'Finding updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id
router.delete('/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('findings').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'delete',
      entity_type: 'findings',
      entity_id: req.params.id,
      ip_address: req.ip,
    });

    return res.json({ success: true, message: 'Finding deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
