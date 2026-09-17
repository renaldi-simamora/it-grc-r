import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { store } from '../lib/store';
import { Evidence } from '../types';
import multer from 'multer';

const router = Router();

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype) || file.originalname.match(/\.(pdf|png|jpg|jpeg|docx|xlsx)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed formats: PDF, PNG, JPG, DOCX, XLSX'));
    }
  },
});

function generateEvidenceCode(): string {
  const maxNum = store.evidences.reduce((max, e) => {
    const match = e.evidence_code.match(/EVD-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  return `EVD-${String(maxNum + 1).padStart(4, '0')}`;
}

// GET / — list evidence
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const control_id = req.query.control_id as string;
    const review_status = req.query.review_status as string;
    const search = ((req.query.search as string) || '').toLowerCase().trim();

    let filtered = store.evidences.filter((ev) => {
      if (search) {
        const matchesCode = ev.evidence_code.toLowerCase().includes(search);
        const matchesName = ev.file_name.toLowerCase().includes(search);
        const matchesDesc = (ev.description || '').toLowerCase().includes(search);
        if (!matchesCode && !matchesName && !matchesDesc) return false;
      }
      if (control_id && ev.control_id !== control_id) return false;
      if (review_status && ev.review_status !== review_status) return false;
      return true;
    });

    filtered.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());

    // Enrich with linked control
    const enriched = filtered.map((e) => {
      const control = store.controls.find((c) => c.id === e.control_id);
      return {
        ...e,
        control: control ? { id: control.id, control_code: control.control_code, name: control.name } : null,
      };
    });

    const total = enriched.length;
    const offset = (page - 1) * limit;
    const paginated = enriched.slice(offset, offset + limit);

    return res.json({
      success: true,
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id — single evidence
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const ev = store.evidences.find((e) => e.id === req.params.id || e.evidence_code === req.params.id);
    if (!ev) {
      return res.status(404).json({ success: false, error: 'Evidence not found' });
    }

    const control = store.controls.find((c) => c.id === ev.control_id);
    return res.json({
      success: true,
      data: {
        ...ev,
        control: control || null,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST / — upload evidence
router.post('/', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { control_id, description } = req.body;

    if (!control_id) {
      return res.status(400).json({ success: false, error: 'control_id is required' });
    }

    const control = store.controls.find((c) => c.id === control_id);
    if (!control) {
      return res.status(404).json({ success: false, error: 'Control not found' });
    }

    const fileName = file ? file.originalname : req.body.file_name || `Sample_Evidence_${Date.now()}.pdf`;
    const filePath = `evidence/${Date.now()}-${fileName}`;
    const evidence_code = req.body.evidence_code || generateEvidenceCode();

    const newEvidence: Evidence = {
      id: `evd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      evidence_code,
      control_id,
      file_name: fileName,
      file_path: filePath,
      description: description || 'Simulated compliance audit evidence (SIMULATION)',
      uploaded_by: req.userId || null,
      review_status: 'PENDING',
      uploaded_at: new Date().toISOString(),
      reviewed_at: null,
      reviewer: null,
      reviewer_notes: null,
    };

    store.evidences.unshift(newEvidence);
    store.logActivity(req.userId || null, 'UPLOADED_EVIDENCE', 'Evidence', newEvidence.id, {
      evidence_code: newEvidence.evidence_code,
      file_name: newEvidence.file_name,
      control_code: control.control_code,
    });

    return res.status(201).json({
      success: true,
      data: newEvidence,
      message: 'Synthetic evidence recorded successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id/review — review evidence (APPROVED / REJECTED)
router.put('/:id/review', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const { review_status, reviewer_notes } = req.body;
    if (!review_status || !['APPROVED', 'REJECTED', 'PENDING'].includes(review_status)) {
      return res.status(400).json({ success: false, error: 'Valid review_status (APPROVED or REJECTED) is required' });
    }

    const ev = store.evidences.find((e) => e.id === req.params.id);
    if (!ev) {
      return res.status(404).json({ success: false, error: 'Evidence not found' });
    }

    const user = store.profiles.find((p) => p.id === req.userId);
    const reviewerName = user ? user.full_name : req.userEmail || 'Lead Auditor';

    ev.review_status = review_status;
    ev.reviewed_at = new Date().toISOString();
    ev.reviewer = reviewerName;
    ev.reviewer_notes = reviewer_notes || null;

    store.logActivity(req.userId || null, `EVIDENCE_${review_status}`, 'Evidence', ev.id, {
      evidence_code: ev.evidence_code,
      review_status,
      reviewer: reviewerName,
    });

    return res.json({
      success: true,
      data: ev,
      message: `Evidence marked as ${review_status}`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id — delete evidence
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const index = store.evidences.findIndex((e) => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Evidence not found' });
    }

    const deleted = store.evidences.splice(index, 1)[0];
    store.logActivity(req.userId || null, 'DELETED_EVIDENCE', 'Evidence', deleted.id, {
      evidence_code: deleted.evidence_code,
      file_name: deleted.file_name,
    });

    return res.json({
      success: true,
      message: `Evidence ${deleted.evidence_code} deleted successfully`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
