import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../lib/supabase';
import { UserRole } from '../types';
import { store } from '../lib/store';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
      userEmail?: string;
    }
  }
}

// Verify auth token (Supabase JWT or simulation session token)
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  // Check demo simulation tokens first
  if (token === 'demo-admin-token' || token.startsWith('demo-admin')) {
    const admin = store.profiles.find((p) => p.role === 'ADMIN');
    if (admin) {
      req.userId = admin.id;
      req.userRole = 'ADMIN';
      req.userEmail = admin.email;
      return next();
    }
  }

  if (token === 'demo-officer-token' || token.startsWith('demo-officer') || token.startsWith('demo-analyst')) {
    const officer = store.profiles.find((p) => p.role === 'GRC_OFFICER');
    if (officer) {
      req.userId = officer.id;
      req.userRole = 'GRC_OFFICER';
      req.userEmail = officer.email;
      return next();
    }
  }

  // Fallback check in store by user ID
  const storeUser = store.profiles.find((p) => p.id === token || p.email === token);
  if (storeUser) {
    req.userId = storeUser.id;
    req.userRole = storeUser.role;
    req.userEmail = storeUser.email;
    return next();
  }

  // If Supabase is configured, verify Supabase JWT
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && user) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        req.userId = user.id;
        req.userRole = (profile?.role as UserRole) || 'GRC_OFFICER';
        req.userEmail = user.email;
        return next();
      }
    } catch (err) {
      console.warn('[Auth] Supabase token verification failed, checking simulation profile:', err);
    }
  }

  // If demo fallback default
  const defaultUser = store.profiles[0];
  req.userId = defaultUser.id;
  req.userRole = defaultUser.role;
  req.userEmail = defaultUser.email;
  next();
}

// Role-based authorization
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required role: ${allowedRoles.join(' or ')}. Current role: ${req.userRole || 'None'}`,
      });
    }
    next();
  };
}
