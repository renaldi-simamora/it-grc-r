import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// POST /register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, error: 'email, password, and full_name are required' });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return res.status(400).json({ success: false, error: authError.message });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        role: role || 'viewer',
      })
      .select()
      .single();

    if (profileError) {
      return res.status(500).json({ success: false, error: profileError.message });
    }

    return res.status(201).json({ success: true, data: profile, message: 'User registered successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'email and password are required' });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ success: false, error: error.message });
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return res.json({
      success: true,
      data: {
        user: profile,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /profile
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error) return res.status(404).json({ success: false, error: 'Profile not found' });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const { full_name, department } = req.body;
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ full_name, department, updated_at: new Date().toISOString() })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /users (admin)
router.get('/users', authenticate, authorize('admin'), async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('user_profiles').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /users/:id/role (admin)
router.put('/users/:id/role', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!['admin', 'analyst', 'auditor', 'viewer'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.userId,
      action: 'update_role',
      entity_type: 'user_profiles',
      entity_id: req.params.id,
      details: { new_role: role },
      ip_address: req.ip,
    });

    return res.json({ success: true, data, message: 'Role updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
