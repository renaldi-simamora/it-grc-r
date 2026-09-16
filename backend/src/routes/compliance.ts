import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// ─── Frameworks ───

// GET /frameworks
router.get('/frameworks', authenticate, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('compliance_frameworks').select('*').order('name');
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /frameworks
router.post('/frameworks', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('compliance_frameworks')
      .insert(req.body)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'create',
      entity_type: 'compliance_frameworks',
      entity_id: data.id,
      details: { name: data.name },
      ip_address: req.ip,
    });

    return res.status(201).json({ success: true, data, message: 'Framework created' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /frameworks/:id
router.get('/frameworks/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { data: framework, error } = await supabaseAdmin
      .from('compliance_frameworks')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ success: false, error: 'Framework not found' });

    const { data: requirements } = await supabaseAdmin
      .from('compliance_requirements')
      .select('*')
      .eq('framework_id', framework.id)
      .order('requirement_code');

    // Get assessment stats for this framework
    const reqIds = (requirements || []).map((r: any) => r.id);
    let assessmentStats = { total: 0, compliant: 0, partially_compliant: 0, non_compliant: 0, not_assessed: 0, not_applicable: 0 };

    if (reqIds.length > 0) {
      const { data: assessments } = await supabaseAdmin
        .from('compliance_assessments')
        .select('status')
        .in('requirement_id', reqIds);

      if (assessments) {
        assessmentStats.total = assessments.length;
        for (const a of assessments) {
          const key = a.status as keyof typeof assessmentStats;
          if (key in assessmentStats && key !== 'total') {
            assessmentStats[key]++;
          }
        }
      }
    }

    return res.json({
      success: true,
      data: { ...framework, requirements: requirements || [], assessment_stats: assessmentStats },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /frameworks/:id
router.put('/frameworks/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('compliance_frameworks')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'update',
      entity_type: 'compliance_frameworks',
      entity_id: req.params.id,
      details: req.body,
      ip_address: req.ip,
    });

    return res.json({ success: true, data, message: 'Framework updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /frameworks/:id
router.delete('/frameworks/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('compliance_frameworks').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'delete',
      entity_type: 'compliance_frameworks',
      entity_id: req.params.id,
      ip_address: req.ip,
    });

    return res.json({ success: true, message: 'Framework deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Requirements ───

// GET /frameworks/:id/requirements
router.get('/frameworks/:id/requirements', authenticate, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('compliance_requirements')
      .select('*')
      .eq('framework_id', req.params.id)
      .order('requirement_code');

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /frameworks/:id/requirements
router.post('/frameworks/:id/requirements', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('compliance_requirements')
      .insert({ ...req.body, framework_id: req.params.id })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'create',
      entity_type: 'compliance_requirements',
      entity_id: data.id,
      details: { framework_id: req.params.id, requirement_code: data.requirement_code },
      ip_address: req.ip,
    });

    return res.status(201).json({ success: true, data, message: 'Requirement created' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /requirements/:id
router.put('/requirements/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('compliance_requirements')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'update',
      entity_type: 'compliance_requirements',
      entity_id: req.params.id,
      details: req.body,
      ip_address: req.ip,
    });

    return res.json({ success: true, data, message: 'Requirement updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /requirements/:id
router.delete('/requirements/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('compliance_requirements').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'delete',
      entity_type: 'compliance_requirements',
      entity_id: req.params.id,
      ip_address: req.ip,
    });

    return res.json({ success: true, message: 'Requirement deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Assessments ───

// GET /assessments
router.get('/assessments', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const requirement_id = req.query.requirement_id as string;
    const framework_id = req.query.framework_id as string;

    let query = supabaseAdmin.from('compliance_assessments').select('*', { count: 'exact' });
    if (requirement_id) query = query.eq('requirement_id', requirement_id);

    if (framework_id) {
      // Get requirement IDs for this framework first
      const { data: reqs } = await supabaseAdmin
        .from('compliance_requirements')
        .select('id')
        .eq('framework_id', framework_id);
      if (reqs && reqs.length > 0) {
        query = query.in('requirement_id', reqs.map((r: any) => r.id));
      } else {
        return res.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }
    }

    const { data, error, count } = await query
      .order('assessed_date', { ascending: false })
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

// POST /assessments
router.post('/assessments', authenticate, authorize('admin', 'analyst', 'auditor'), async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('compliance_assessments')
      .insert({
        ...req.body,
        assessed_by: req.userId,
        assessed_date: req.body.assessed_date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'create',
      entity_type: 'compliance_assessments',
      entity_id: data.id,
      details: { requirement_id: data.requirement_id, status: data.status },
      ip_address: req.ip,
    });

    return res.status(201).json({ success: true, data, message: 'Assessment created' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /assessments/:id
router.put('/assessments/:id', authenticate, authorize('admin', 'analyst', 'auditor'), async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('compliance_assessments')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'update',
      entity_type: 'compliance_assessments',
      entity_id: req.params.id,
      details: req.body,
      ip_address: req.ip,
    });

    return res.json({ success: true, data, message: 'Assessment updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /assessments/:id
router.delete('/assessments/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('compliance_assessments').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'delete',
      entity_type: 'compliance_assessments',
      entity_id: req.params.id,
      ip_address: req.ip,
    });

    return res.json({ success: true, message: 'Assessment deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
