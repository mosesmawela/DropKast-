import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import { logger } from './_logger.js';
import { eventBus } from './_event-bus.js';
import type { Request, Response, NextFunction } from 'express';

export interface ApiToken {
  id: string;
  prefix: string;
  hash: string;
  name: string;
  scopes: string[];
  createdBy: string;
  expiresAt?: Date;
  lastUsedAt?: Date;
  enabled: boolean;
  createdAt: Date;
}

const tokens = new Map<string, ApiToken>();

function generatePrefix(): string {
  return 'dk_' + randomBytes(4).toString('hex');
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createToken(input: { name: string; scopes: string[]; createdBy: string; expiresAt?: Date }): { token: string; tokenId: string } {
  const raw = `dk_${randomBytes(24).toString('hex')}`;
  const prefix = raw.slice(0, 10);
  const id = `tok-${Date.now()}-${randomBytes(4).toString('hex')}`;

  tokens.set(id, {
    id,
    prefix,
    hash: hashToken(raw),
    name: input.name,
    scopes: input.scopes,
    createdBy: input.createdBy,
    expiresAt: input.expiresAt,
    enabled: true,
    createdAt: new Date(),
  });

  eventBus.emit('token.created', 'api-tokens', { tokenId: id, name: input.name, scopes: input.scopes });
  logger.info({ tokenId: id, name: input.name }, 'api-token: created');
  return { token: raw, tokenId: id };
}

export function revokeToken(id: string): boolean {
  const token = tokens.get(id);
  if (!token) return false;
  token.enabled = false;
  eventBus.emit('token.revoked', 'api-tokens', { tokenId: id });
  return true;
}

export function getToken(id: string): ApiToken | undefined {
  return tokens.get(id);
}

export function listTokens(): ApiToken[] {
  return Array.from(tokens.values());
}

export function validateToken(raw: string): ApiToken | null {
  const hash = hashToken(raw);
  for (const token of tokens.values()) {
    if (!token.enabled) continue;
    if (token.expiresAt && token.expiresAt < new Date()) continue;
    if (token.hash === hash) {
      token.lastUsedAt = new Date();
      return token;
    }
  }
  return null;
}

export function tokenHasScope(token: ApiToken, scope: string): boolean {
  return token.scopes.includes('*') || token.scopes.includes(scope);
}

export function tokenMiddleware(...requiredScopes: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const raw = authHeader.slice(7);
    const token = validateToken(raw);
    if (!token) {
      res.status(401).json({ error: 'invalid_token' });
      return;
    }

    for (const scope of requiredScopes) {
      if (!tokenHasScope(token, scope)) {
        res.status(403).json({ error: 'insufficient_scope', required: scope });
        return;
      }
    }

    (req as any).token = token;
    (req as any).userId = token.createdBy;
    next();
  };
}

export function getDefaultScopes(): string[] {
  return ['releases:read', 'releases:write', 'campaigns:read', 'earnings:read'];
}
