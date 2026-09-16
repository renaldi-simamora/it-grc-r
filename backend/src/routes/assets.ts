import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// GET / — list assets
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const status = req.query.status as string;
    const criticality = req.query.criticality as string;
    const sort_by = (req.query.sort_by as string) || 'created_at';
    const sort_order = (req.query.sort_order as string) === 'asc' ? true : false;

    let query = supabaseAdmin.from('assets').select('*', { count: 'exact' });

    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (criticality) query = query.eq('criticality', criticality);

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
    const { data, error } = await supabaseAdmin
      .from('assets')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ success: false, error: 'Asset not found' });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /
router.post('/', authenticate, authorize('admin', 'analyst'), async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('assets')
      .insert({ ...req.body, created_by: req.userId })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'create',
      entity_type: 'assets',
      entity_id: data.id,
      details: { name: data.name },
      ip_address: req.ip,
    });

    return res.status(201).json({ success: true, data, message: 'Asset created' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id
router.put('/:id', authenticate, authorize('admin', 'analyst'), async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('assets')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'update',
      entity_type: 'assets',
      entity_id: req.params.id,
      details: req.body,
      ip_address: req.ip,
    });

    return res.json({ success: true, data, message: 'Asset updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id
router.delete('/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('assets').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'delete',
      entity_type: 'assets',
      entity_id: req.params.id,
      ip_address: req.ip,
    });

    return res.json({ success: true, message: 'Asset deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
