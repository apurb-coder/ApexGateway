import prisma from '../utils/prisma.js';

// Sync/Register user role from frontend
export const register = async (req, res) => {
  try {
    const { role } = req.body;
    const { id, email } = req.user; // populated by authenticateUser middleware

    const userRole = role === 'PROVIDER' ? 'PROVIDER' : 'CONSUMER';

    // Update user role or create if not present
    const user = await prisma.user.upsert({
      where: { id },
      update: { role: userRole },
      create: {
        id,
        email,
        passwordHash: '', // external login
        role: userRole
      }
    });

    return res.status(200).json({
      message: 'User synced successfully',
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get currently authenticated user database details
export const getMe = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Legacy local login fallback/mock for backwards compatibility if needed
export const login = async (req, res) => {
  return res.status(410).json({ 
    error: 'Direct username/password login is deprecated. Please authenticate via Supabase.' 
  });
};
