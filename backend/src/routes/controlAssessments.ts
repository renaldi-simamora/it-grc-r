import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { store } from '../lib/store';
import { ControlAssessment, ControlChecklistItem, AssessmentStatus } from '../types';

const router = Router();

export function calculateComplianceScore(items: { status: AssessmentStatus }[]): { score: number; status: AssessmentStatus } {
  const applicableItems = items.filter((i) => i.status !== 'NOT_APPLICABLE');
  if (applicableItems.length === 0) {
    return { score: 100, status: 'NOT_APPLICABLE' };
  }

  let totalPoints = 0;
  for (const item of applicableItems) {
    if (item.status === 'COMPLIANT') {
      totalPoints += 1.0;
    } else if (item.status === 'PARTIALLY_COMPLIANT') {
      totalPoints += 0.5;
    }
  }

  const score = Math.round((totalPoints / applicableItems.length) * 100);

  let status: AssessmentStatus = 'NON_COMPLIANT';
  if (score >= 90) {
    status = 'COMPLIANT';
  } else if (score >= 50) {
    status = 'PARTIALLY_COMPLIANT';
  } else {
    status = 'NON_COMPLIANT';
  }

  return { score, status };
}

// GET / — list assessments
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const control_id = req.query.control_id as string;
    let list = store.controlAssessments;
    if (control_id) {
      list = list.filter((ca) => ca.control_id === control_id);
    }

    const enriched = list.map((ca) => {
      const control = store.controls.find((c) => c.id === ca.control_id);
      const items = store.checklistItems.filter((chk) => chk.assessment_id === ca.id);
      return {
        ...ca,
        control: control ? { id: control.id, control_code: control.control_code, name: control.name } : null,
        checklist_items: items,
      };
    });

    return res.json({ success: true, data: enriched });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id — single assessment with checklist and evidence items
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const ca = store.controlAssessments.find((a) => a.id === req.params.id);
    if (!ca) {
      return res.status(404).json({ success: false, error: 'Control assessment not found' });
    }

    const control = store.controls.find((c) => c.id === ca.control_id);
    const items = store.checklistItems.filter((chk) => chk.assessment_id === ca.id).map((item) => {
      const evidence = item.evidence_id ? store.evidences.find((e) => e.id === item.evidence_id) : null;
      return { ...item, evidence };
    });

    return res.json({
      success: true,
      data: {
        ...ca,
        control,
        checklist_items: items,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST / — create new control assessment with checklist items
router.post('/', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const { control_id, notes, checklist_items } = req.body;
    if (!control_id) {
      return res.status(400).json({ success: false, error: 'control_id is required' });
    }

    const control = store.controls.find((c) => c.id === control_id);
    if (!control) {
      return res.status(404).json({ success: false, error: 'Control not found' });
    }

    const rawItems: { title: string; status: AssessmentStatus; notes?: string; evidence_id?: string }[] =
      checklist_items && Array.isArray(checklist_items) && checklist_items.length > 0
        ? checklist_items
        : [
            { title: 'Policy and standard procedures documented', status: 'COMPLIANT' },
            { title: 'Technical control implementation operational', status: 'PARTIALLY_COMPLIANT' },
            { title: 'Periodic monitoring and log review active', status: 'NON_COMPLIANT' },
            { title: 'Supporting evidence collected and verified', status: 'PARTIALLY_COMPLIANT' },
          ];

    const { score, status } = calculateComplianceScore(rawItems);

    const assessmentId = `ca-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newAssessment: ControlAssessment = {
      id: assessmentId,
      control_id,
      assessor_id: req.userId || null,
      status,
      score,
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.controlAssessments.unshift(newAssessment);

    // Insert checklist items
    const createdItems: ControlChecklistItem[] = [];
    for (const item of rawItems) {
      const chk: ControlChecklistItem = {
        id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        assessment_id: assessmentId,
        title: item.title,
        status: item.status || 'NON_COMPLIANT',
        notes: item.notes || null,
        evidence_id: item.evidence_id || null,
      };
      store.checklistItems.push(chk);
      createdItems.push(chk);
    }

    // Update control implementation & effectiveness based on assessment score
    if (score >= 90) {
      control.implementation_status = 'IMPLEMENTED';
      control.effectiveness = 'EFFECTIVE';
    } else if (score >= 50) {
      control.implementation_status = 'PARTIALLY_IMPLEMENTED';
      control.effectiveness = 'PARTIALLY_EFFECTIVE';
    } else {
      control.implementation_status = 'NOT_IMPLEMENTED';
      control.effectiveness = 'INEFFECTIVE';
    }

    store.logActivity(req.userId || null, 'ASSESSED_CONTROL', 'ControlAssessment', assessmentId, {
      control_code: control.control_code,
      score,
      status,
    });

    return res.status(201).json({
      success: true,
      data: {
        ...newAssessment,
        checklist_items: createdItems,
      },
      message: `Control assessment completed with score ${score}% (${status})`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id — update assessment notes or checklist
router.put('/:id', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const ca = store.controlAssessments.find((a) => a.id === req.params.id);
    if (!ca) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    if (req.body.notes !== undefined) ca.notes = req.body.notes;
    ca.updated_at = new Date().toISOString();

    return res.json({ success: true, data: ca, message: 'Assessment updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
