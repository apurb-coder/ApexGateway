import * as jose from 'jose';
import prisma from '../utils/prisma.js';

// Setup JWKS and issuer/audience configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const jwksUrl = process.env.SUPABASE_JWKS_URL || `${supabaseUrl}/auth/v1/keys`;
const jwtIssuer = process.env.SUPABASE_JWT_ISSUER || `${supabaseUrl}/auth/v1`;
const jwtAudience = process.env.SUPABASE_JWT_AUDIENCE || 'authenticated';

let JWKS;
try {
  JWKS = jose.createRemoteJWKSet(new URL(jwksUrl));
} catch (error) {
  console.error('Failed to parse JWKS URL:', error.message);
}

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    if (!JWKS) {
      return res.status(500).json({ error: 'Authentication service misconfigured' });
    }

    // Verify Supabase JWT locally using jose
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: jwtIssuer,
      audience: jwtAudience,
    });

    const id = payload.sub; // Supabase user ID (UUID)
    const email = payload.email;

    // Check if the user exists in our local database, auto-provision if not
    let user = await prisma.user.findUnique({
      where: { id: id }
    });

    if (!user) {
      // Auto-provision with default role 'CONSUMER'
      user = await prisma.user.create({
        data: {
          id: id,
          email: email || '',
          passwordHash: '', // external login
          role: 'CONSUMER'
        }
      });
    }

    // Attach user to request context
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Supabase JWT verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Alias for compatibility
export const authMiddleware = authenticateUser;

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};
