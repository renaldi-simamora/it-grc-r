import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { store } from '../lib/store';
import { ComplianceItem, ComplianceCategory, AssessmentStatus } from '../types';

const router = Router();

const COMPLIANCE_CATEGORIES: ComplianceCategory[] = [
  'Access Control',
  'Data Protection',
  'Backup & Recovery',
  'Change Management',
  'Incident Management',
  'Asset Management',
  'Documentation',
];

// GET / — compliance summary, category rates, item checklist
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const categoryFilter = req.query.category as string;
    let items = store.complianceItems;

    if (categoryFilter) {
      items = items.filter((i) => i.category === categoryFilter);
    }

    // Category breakdown
    const categoryStats: Record<
      string,
      { total: number; compliant: number; partially_compliant: number; non_compliant: number; not_applicable: number; rate: number }
    > = {};

    for (const cat of COMPLIANCE_CATEGORIES) {
      const catItems = store.complianceItems.filter((i) => i.category === cat);
      const applicable = catItems.filter((i) => i.status !== 'NOT_APPLICABLE');
      const compliant = catItems.filter((i) => i.status === 'COMPLIANT').length;
      const partial = catItems.filter((i) => i.status === 'PARTIALLY_COMPLIANT').length;
      const nonCompliant = catItems.filter((i) => i.status === 'NON_COMPLIANT').length;
      const na = catItems.filter((i) => i.status === 'NOT_APPLICABLE').length;

      const rate = applicable.length > 0 ? Math.round(((compliant + partial * 0.5) / applicable.length) * 100) : 100;

      categoryStats[cat] = {
        total: catItems.length,
        compliant,
        partially_compliant: partial,
        non_compliant: nonCompliant,
        not_applicable: na,
        rate,
      };
    }

    // Overall compliance rate
    const totalApplicable = store.complianceItems.filter((i) => i.status !== 'NOT_APPLICABLE');
    const totalCompliant = store.complianceItems.filter((i) => i.status === 'COMPLIANT').length;
    const totalPartial = store.complianceItems.filter((i) => i.status === 'PARTIALLY_COMPLIANT').length;

    const overallRate =
      totalApplicable.length > 0
        ? Math.round(((totalCompliant + totalPartial * 0.5) / totalApplicable.length) * 100)
        : 0;

    const incompleteItems = store.complianceItems.filter(
      (i) => i.status === 'NON_COMPLIANT' || i.status === 'PARTIALLY_COMPLIANT'
    );

    return res.json({
      success: true,
      data: {
        overall_compliance_rate: overallRate,
        total_items: store.complianceItems.length,
        applicable_items: totalApplicable.length,
        compliant_items: totalCompliant,
        category_breakdown: categoryStats,
        incomplete_items: incompleteItems,
        items,
        disclaimer: 'SIMULATION / SYNTHETIC DATA — For Personal Portfolio & Academic Demonstration Only',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST / — create new compliance item
router.post('/', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const { title, description, category, status, notes, responsible_owner } = req.body;
    if (!title || !category) {
      return res.status(400).json({ success: false, error: 'title and category are required' });
    }

    const newItem: ComplianceItem = {
      id: `cmp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      description: description || '',
      category,
      status: status || 'NON_COMPLIANT',
      notes: notes || null,
      responsible_owner: responsible_owner || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.complianceItems.push(newItem);
    store.logActivity(req.userId || null, 'CREATED_COMPLIANCE_ITEM', 'Compliance', newItem.id, {
      title: newItem.title,
      category: newItem.category,
    });

    return res.status(201).json({
      success: true,
      data: newItem,
      message: 'Compliance item created',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id — update compliance status & notes
router.put('/:id', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const index = store.complianceItems.findIndex((i) => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Compliance item not found' });
    }

    const current = store.complianceItems[index];
    const updated: ComplianceItem = {
      ...current,
      ...req.body,
      id: current.id,
      updated_at: new Date().toISOString(),
    };

    store.complianceItems[index] = updated;
    store.logActivity(req.userId || null, 'UPDATED_COMPLIANCE_ITEM', 'Compliance', updated.id, {
      title: updated.title,
      status: updated.status,
    });

    return res.json({
      success: true,
      data: updated,
      message: 'Compliance item updated',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
