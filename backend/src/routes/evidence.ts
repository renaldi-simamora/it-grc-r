import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// GET /
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const control_id = req.query.control_id as string;
    const control_assessment_id = req.query.control_assessment_id as string;
    const review_status = req.query.review_status as string;

    let query = supabaseAdmin.from('evidence').select('*', { count: 'exact' });
    if (control_id) query = query.eq('control_id', control_id);
    if (control_assessment_id) query = query.eq('control_assessment_id', control_assessment_id);
    if (review_status) query = query.eq('review_status', review_status);

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
      .from('evidence')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ success: false, error: 'Evidence not found' });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST / — upload evidence
router.post('/', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: 'File is required' });
    if (!req.body.title) return res.status(400).json({ success: false, error: 'title is required' });

    const fileName = `${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('evidence')
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (uploadError) return res.status(500).json({ success: false, error: uploadError.message });

    const { data, error } = await supabaseAdmin
      .from('evidence')
      .insert({
        title: req.body.title,
        description: req.body.description || null,
        control_id: req.body.control_id || null,
        control_assessment_id: req.body.control_assessment_id || null,
        file_name: file.originalname,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.mimetype,
        uploaded_by: req.userId,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'create',
      entity_type: 'evidence',
      entity_id: data.id,
      details: { title: data.title, file_name: file.originalname },
      ip_address: req.ip,
    });

    return res.status(201).json({ success: true, data, message: 'Evidence uploaded' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id/review — review evidence
router.put('/:id/review', authenticate, authorize('admin', 'auditor'), async (req: Request, res: Response) => {
  try {
    const { review_status, review_notes } = req.body;
    if (!review_status) return res.status(400).json({ success: false, error: 'review_status is required' });

    const { data, error } = await supabaseAdmin
      .from('evidence')
      .update({
        review_status,
        review_notes: review_notes || null,
        reviewed_by: req.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'review',
      entity_type: 'evidence',
      entity_id: req.params.id,
      details: { review_status, review_notes },
      ip_address: req.ip,
    });

    return res.json({ success: true, data, message: 'Evidence reviewed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id
router.delete('/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    // Get file path to delete from storage
    const { data: evidence } = await supabaseAdmin
      .from('evidence')
      .select('file_path')
      .eq('id', req.params.id)
      .single();

    if (evidence?.file_path) {
      await supabaseAdmin.storage.from('evidence').remove([evidence.file_path]);
    }

    const { error } = await supabaseAdmin.from('evidence').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'delete',
      entity_type: 'evidence',
      entity_id: req.params.id,
      ip_address: req.ip,
    });

    return res.json({ success: true, message: 'Evidence deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
