import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { store } from '../lib/store';
import { Asset } from '../types';

const router = Router();

function generateAssetCode(): string {
  const maxNum = store.assets.reduce((max, a) => {
    const match = a.asset_code.match(/AST-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  return `AST-${String(maxNum + 1).padStart(4, '0')}`;
}

// GET / — list assets with filtering, searching, pagination
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const type = req.query.type as string;
    const status = req.query.status as string;
    const criticality = req.query.criticality as string;
    const sort_by = (req.query.sort_by as string) || 'created_at';
    const sort_order = (req.query.sort_order as string) === 'asc' ? 1 : -1;

    let filtered = store.assets.filter((asset) => {
      if (search) {
        const matchesName = asset.name.toLowerCase().includes(search);
        const matchesCode = asset.asset_code.toLowerCase().includes(search);
        const matchesDesc = (asset.description || '').toLowerCase().includes(search);
        const matchesOwner = (asset.owner || '').toLowerCase().includes(search);
        const matchesDept = (asset.department || '').toLowerCase().includes(search);
        if (!matchesName && !matchesCode && !matchesDesc && !matchesOwner && !matchesDept) return false;
      }
      if (type && asset.type !== type) return false;
      if (status && asset.status !== status) return false;
      if (criticality && asset.criticality !== criticality) return false;
      return true;
    });

    filtered.sort((a: any, b: any) => {
      const valA = a[sort_by] ?? '';
      const valB = b[sort_by] ?? '';
      if (valA < valB) return -1 * sort_order;
      if (valA > valB) return 1 * sort_order;
      return 0;
    });

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

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

// GET /:id — single asset with linked risks & controls
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const asset = store.assets.find((a) => a.id === req.params.id || a.asset_code === req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    const linkedRisks = store.risks.filter((r) => r.asset_id === asset.id);
    const riskIds = new Set(linkedRisks.map((r) => r.id));
    const linkedControls = store.controls.filter((c) => riskIds.has(c.risk_id));

    return res.json({
      success: true,
      data: {
        ...asset,
        risks: linkedRisks,
        controls: linkedControls,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST / — create asset
router.post('/', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const { name, type, description, owner, department, criticality, status } = req.body;
    if (!name || !type || !criticality) {
      return res.status(400).json({ success: false, error: 'name, type, and criticality are required' });
    }

    const asset_code = req.body.asset_code || generateAssetCode();

    const newAsset: Asset = {
      id: `ast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      asset_code,
      name,
      type,
      description: description || null,
      owner: owner || null,
      department: department || null,
      criticality,
      status: status || 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.assets.unshift(newAsset);
    store.logActivity(req.userId || null, 'CREATED_ASSET', 'Assets', newAsset.id, {
      asset_code: newAsset.asset_code,
      name: newAsset.name,
    });

    return res.status(201).json({
      success: true,
      data: newAsset,
      message: 'Asset created successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id — update asset
router.put('/:id', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const index = store.assets.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    const current = store.assets[index];
    const updated: Asset = {
      ...current,
      ...req.body,
      id: current.id,
      asset_code: current.asset_code, // prevent mutating code
      updated_at: new Date().toISOString(),
    };

    store.assets[index] = updated;
    store.logActivity(req.userId || null, 'UPDATED_ASSET', 'Assets', updated.id, {
      asset_code: updated.asset_code,
      name: updated.name,
    });

    return res.json({
      success: true,
      data: updated,
      message: 'Asset updated successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id — delete asset (ADMIN only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const index = store.assets.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    const deleted = store.assets.splice(index, 1)[0];
    store.logActivity(req.userId || null, 'DELETED_ASSET', 'Assets', deleted.id, {
      asset_code: deleted.asset_code,
      name: deleted.name,
    });

    return res.json({
      success: true,
      message: `Asset ${deleted.asset_code} deleted successfully`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
