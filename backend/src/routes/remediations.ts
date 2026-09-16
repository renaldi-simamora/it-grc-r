import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// GET /
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const finding_id = req.query.finding_id as string;
    const status = req.query.status as string;
    const priority = req.query.priority as string;

    let query = supabaseAdmin.from('remediation_plans').select('*', { count: 'exact' });
    if (finding_id) query = query.eq('finding_id', finding_id);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
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
    const { data, error } = await supabaseAdmin
      .from('remediation_plans')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ success: false, error: 'Remediation plan not found' });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /
router.post('/', authenticate, authorize('admin', 'analyst'), async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('remediation_plans')
      .insert({ ...req.body, created_by: req.userId })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'create',
      entity_type: 'remediation_plans',
      entity_id: data.id,
      details: { title: data.title, finding_id: data.finding_id },
      ip_address: req.ip,
    });

    return res.status(201).json({ success: true, data, message: 'Remediation plan created' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id
router.put('/:id', authenticate, authorize('admin', 'analyst'), async (req: Request, res: Response) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    if (updates.status === 'completed') {
      updates.completion_date = updates.completion_date || new Date().toISOString().split('T')[0];
      updates.progress_pct = 100;
    }

    const { data, error } = await supabaseAdmin
      .from('remediation_plans')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'update',
      entity_type: 'remediation_plans',
      entity_id: req.params.id,
      details: req.body,
      ip_address: req.ip,
    });

    return res.json({ success: true, data, message: 'Remediation plan updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id
router.delete('/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('remediation_plans').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'delete',
      entity_type: 'remediation_plans',
      entity_id: req.params.id,
      ip_address: req.ip,
    });

    return res.json({ success: true, message: 'Remediation plan deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
