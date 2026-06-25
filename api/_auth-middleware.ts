/**
 * Server-side authentication & authorization middleware.
 * Extracts user from Supabase JWT or legacy header, attaches to request.
 * Provides authorization helpers for resource ownership checks.
 */
import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { logger } from './_logger.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  artistName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      userId?: string;
    }
  }
}

/**
 * Extract user from Authorization header (Supabase JWT) or X-User-Id header.
 * Attaches user to req.user and req.userId for downstream use.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers['x-user-id'] as string;
  const userEmailHeader = req.headers['x-user-email'] as string;

  // Priority 1: Supabase JWT in Authorization header
  if (authHeader?.startsWith('Bearer ') && supabase) {
    const token = authHeader.slice(7);
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email ?? '',
          role: (user.user_metadata?.role as string) || 'artist',
          artistName: user.user_metadata?.artist_name,
        };
        req.userId = user.id;
        return next();
      }
    } catch (err) {
      logger.debug({ err }, 'Supabase auth failed, trying headers');
    }
  }

  // Priority 2: X-User-Id header (for internal/service-to-service)
  if (userIdHeader) {
    req.userId = userIdHeader;
    if (userEmailHeader) {
      req.user = {
        id: userIdHeader,
        email: userEmailHeader,
        role: 'artist',
      };
    }
    return next();
  }

  // No auth found - continue without user (endpoints must check manually)
  next();
}

/**
 * Require authenticated user - returns 401 if no user attached.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.userId) {
    res.status(401).json({ error: 'unauthorized', message: 'Authentication required' });
    return;
  }
  next();
}

/**
 * Require specific role(s) - returns 403 if user lacks role.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'forbidden', message: `Requires role: ${roles.join(' or ')}` });
      return;
    }
    next();
  };
}

/**
 * Require resource ownership - checks if user owns the resource.
 * Usage: requireOwnership('releases', 'releaseId', 'userId')
 */
export function requireOwnership(resourceTable: string, resourceIdParam: string, ownerField = 'userId') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.userId) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    // Admin bypass
    if (req.user?.role === 'admin') return next();

    const resourceId = req.params[resourceIdParam] || req.body[resourceIdParam] || req.query[resourceIdParam];
    if (!resourceId) {
      res.status(400).json({ error: `Missing ${resourceIdParam}` });
      return;
    }

    // This is a generic check - specific implementations should use store methods
    // For now, allow and let individual endpoints do the ownership check
    next();
  };
}

/**
 * Optional auth - attaches user if present, continues either way.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  authMiddleware(req, res, next);
}