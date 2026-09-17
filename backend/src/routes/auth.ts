import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { supabaseAdmin, isSupabaseConfigured } from '../lib/supabase';
import { UserRole, UserProfile } from '../types';
import { store } from '../lib/store';

const router = Router();

// POST /register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, error: 'email, password, and full_name are required' });
    }

    const requestedRole: UserRole = role === 'ADMIN' ? 'ADMIN' : 'GRC_OFFICER';

    // If Supabase is configured, use Supabase Auth
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        return res.status(400).json({ success: false, error: authError.message });
      }

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          full_name,
          role: requestedRole,
        })
        .select()
        .single();

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return res.status(500).json({ success: false, error: profileError.message });
      }

      return res.status(201).json({
        success: true,
        data: {
          user: profile,
          access_token: `demo-token-${profile.id}`,
        },
        message: 'User registered successfully',
      });
    }

    // Simulation Mode
    const existing = store.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email,
      full_name,
      role: requestedRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.profiles.push(newProfile);
    store.logActivity(newProfile.id, 'USER_REGISTERED', 'Auth', newProfile.id, { email, role: requestedRole });

    return res.status(201).json({
      success: true,
      data: {
        user: newProfile,
        access_token: requestedRole === 'ADMIN' ? 'demo-admin-token' : 'demo-officer-token',
        refresh_token: 'demo-refresh-token',
      },
      message: 'User registered successfully (Simulation Mode)',
    });
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

    // Check if Supabase is active
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        return res.json({
          success: true,
          data: {
            user: profile,
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            expires_at: data.session?.expires_at,
          },
        });
      }
    }

    // Simulation / Demo accounts match
    const lowerEmail = email.toLowerCase().trim();
    let profile = store.profiles.find((p) => p.email.toLowerCase() === lowerEmail);

    // If typing "admin", "officer", "analyst" shorthand
    if (!profile) {
      if (lowerEmail.includes('admin')) {
        profile = store.profiles.find((p) => p.role === 'ADMIN');
      } else {
        profile = store.profiles.find((p) => p.role === 'GRC_OFFICER');
      }
    }

    if (!profile) {
      return res.status(401).json({ success: false, error: 'Invalid email or credentials' });
    }

    const token = profile.role === 'ADMIN' ? 'demo-admin-token' : 'demo-officer-token';

    return res.json({
      success: true,
      data: {
        user: profile,
        access_token: token,
        refresh_token: 'demo-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 86400 * 7,
      },
      message: 'Logged in successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /profile & GET /me
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  const profile = store.profiles.find((p) => p.id === req.userId) || store.profiles[0];
  return res.json({ success: true, data: profile });
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const profile = store.profiles.find((p) => p.id === req.userId) || store.profiles[0];
  return res.json({ success: true, data: profile });
});

// GET /users (ADMIN only)
router.get('/users', authenticate, authorize('ADMIN'), async (_req: Request, res: Response) => {
  return res.json({ success: true, data: store.profiles });
});

export default router;
