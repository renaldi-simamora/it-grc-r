import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { UserRole } from '../types';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
      userEmail?: string;
    }
  }
}

// Verify Supabase JWT and attach user info
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    // Get user profile for role
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.is_active) {
      return res.status(403).json({ success: false, error: 'Account is inactive or profile not found' });
    }

    req.userId = user.id;
    req.userRole = profile.role as UserRole;
    req.userEmail = user.email;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
}

// Role-based authorization
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
}
