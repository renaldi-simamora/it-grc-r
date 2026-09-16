import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

function calcOverallEffectiveness(design: string, operating: string): string {
  if (design === 'ineffective' || operating === 'ineffective') return 'ineffective';
  if (design === 'partially_effective' || operating === 'partially_effective') return 'partially_effective';
  return 'effective';
}

// GET /
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const control_id = req.query.control_id as string;

    let query = supabaseAdmin.from('control_assessments').select('*', { count: 'exact' });
    if (control_id) query = query.eq('control_id', control_id);

    const { data, error, count } = await query
      .order('assessment_date', { ascending: false })
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
    const { data: assessment, error } = await supabaseAdmin
      .from('control_assessments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ success: false, error: 'Assessment not found' });

    const { data: evidence } = await supabaseAdmin
      .from('evidence')
      .select('*')
      .eq('control_assessment_id', assessment.id);

    return res.json({ success: true, data: { ...assessment, evidence: evidence || [] } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /
router.post('/', authenticate, authorize('admin', 'analyst', 'auditor'), async (req: Request, res: Response) => {
  try {
    const { design_effectiveness, operating_effectiveness } = req.body;
    const overall_effectiveness = calcOverallEffectiveness(design_effectiveness, operating_effectiveness);

    const { data, error } = await supabaseAdmin
      .from('control_assessments')
      .insert({
        ...req.body,
        overall_effectiveness,
        assessor_id: req.userId,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'create',
      entity_type: 'control_assessments',
      entity_id: data.id,
      details: { control_id: data.control_id },
      ip_address: req.ip,
    });

    return res.status(201).json({ success: true, data, message: 'Assessment created' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id
router.put('/:id', authenticate, authorize('admin', 'analyst', 'auditor'), async (req: Request, res: Response) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    if (updates.design_effectiveness && updates.operating_effectiveness) {
      updates.overall_effectiveness = calcOverallEffectiveness(
        updates.design_effectiveness,
        updates.operating_effectiveness,
      );
    }

    const { data, error } = await supabaseAdmin
      .from('control_assessments')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'update',
      entity_type: 'control_assessments',
      entity_id: req.params.id,
      details: req.body,
      ip_address: req.ip,
    });

    return res.json({ success: true, data, message: 'Assessment updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id
router.delete('/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('control_assessments').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'delete',
      entity_type: 'control_assessments',
      entity_id: req.params.id,
      ip_address: req.ip,
    });

    return res.json({ success: true, message: 'Assessment deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
