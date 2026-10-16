import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { User } from '../models/User';

const router = Router();

// GET all users (admin only)
router.get('/', authenticate, requireRole(['admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST create user (admin only)
router.post('/', authenticate, requireRole(['admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'trainee', organizationId = 'IN-MOD-HQ' } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and temporary password are required.' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: 'User with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      organizationId,
    });

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        status: user.status,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update user (admin only)
router.patch('/:id', authenticate, requireRole(['admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, status, name, organizationId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(role && { role }),
        ...(status && { status }),
        ...(name && { name }),
        ...(organizationId && { organizationId }),
      },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
