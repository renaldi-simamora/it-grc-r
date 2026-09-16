import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

function getRiskLevel(score: number): string {
  if (score >= 16) return 'critical';
  if (score >= 10) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

async function generateRiskCode(): Promise<string> {
  const { count } = await supabaseAdmin.from('risks').select('*', { count: 'exact', head: true });
  return `RSK-${String((count || 0) + 1).padStart(4, '0')}`;
}

// GET /register/summary — risk register summary (must be before /:id)
router.get('/register/summary', authenticate, async (_req: Request, res: Response) => {
  try {
    const { data: risks, error } = await supabaseAdmin.from('risks').select('risk_level, status, category');
    if (error) return res.status(500).json({ success: false, error: error.message });

    const summary = {
      total: risks.length,
      by_level: { critical: 0, high: 0, medium: 0, low: 0 } as Record<string, number>,
      by_status: {} as Record<string, number>,
      by_category: {} as Record<string, number>,
    };

    for (const r of risks) {
      summary.by_level[r.risk_level] = (summary.by_level[r.risk_level] || 0) + 1;
      summary.by_status[r.status] = (summary.by_status[r.status] || 0) + 1;
      summary.by_category[r.category] = (summary.by_category[r.category] || 0) + 1;
    }

    return res.json({ success: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET / — list risks
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const risk_level = req.query.risk_level as string;
    const sort_by = (req.query.sort_by as string) || 'created_at';
    const sort_order = (req.query.sort_order as string) === 'asc';

    let query = supabaseAdmin.from('risks').select('*', { count: 'exact' });

    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (risk_level) query = query.eq('risk_level', risk_level);

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
    const { data: risk, error } = await supabaseAdmin
      .from('risks')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ success: false, error: 'Risk not found' });

    // Fetch linked asset
    let asset = null;
    if (risk.asset_id) {
      const { data } = await supabaseAdmin.from('assets').select('*').eq('id', risk.asset_id).single();
      asset = data;
    }

    // Fetch linked controls
    const { data: riskControls } = await supabaseAdmin
      .from('risk_controls')
      .select('control_id')
      .eq('risk_id', risk.id);

    let controls: any[] = [];
    if (riskControls && riskControls.length > 0) {
      const controlIds = riskControls.map((rc) => rc.control_id);
      const { data } = await supabaseAdmin.from('controls').select('*').in('id', controlIds);
      controls = data || [];
    }

    return res.json({ success: true, data: { ...risk, asset, controls } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /
router.post('/', authenticate, authorize('admin', 'analyst'), async (req: Request, res: Response) => {
  try {
    const { likelihood, impact } = req.body;
    if (!likelihood || !impact) {
      return res.status(400).json({ success: false, error: 'likelihood and impact are required' });
    }

    const risk_score = likelihood * impact;
    const risk_level = getRiskLevel(risk_score);
    const risk_code = await generateRiskCode();

    const { data, error } = await supabaseAdmin
      .from('risks')
      .insert({
        ...req.body,
        risk_code,
        risk_score,
        risk_level,
        created_by: req.userId,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'create',
      entity_type: 'risks',
      entity_id: data.id,
      details: { risk_code, title: data.title },
      ip_address: req.ip,
    });

    return res.status(201).json({ success: true, data, message: 'Risk created' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id
router.put('/:id', authenticate, authorize('admin', 'analyst'), async (req: Request, res: Response) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    if (updates.likelihood && updates.impact) {
      updates.risk_score = updates.likelihood * updates.impact;
      updates.risk_level = getRiskLevel(updates.risk_score);
    }

    if (updates.residual_likelihood && updates.residual_impact) {
      updates.residual_score = updates.residual_likelihood * updates.residual_impact;
      updates.residual_level = getRiskLevel(updates.residual_score);
    }

    const { data, error } = await supabaseAdmin
      .from('risks')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'update',
      entity_type: 'risks',
      entity_id: req.params.id,
      details: req.body,
      ip_address: req.ip,
    });

    return res.json({ success: true, data, message: 'Risk updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id
router.delete('/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('risks').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'delete',
      entity_type: 'risks',
      entity_id: req.params.id,
      ip_address: req.ip,
    });

    return res.json({ success: true, message: 'Risk deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
