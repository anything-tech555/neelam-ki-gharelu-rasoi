import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/storage';
import { CONFIG } from '../config';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { SavedAddress, User } from '../types/shared';

export const authRouter = Router();

// Helper to generate JWT token
const createToken = (user: User) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role
    },
    CONFIG.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Customer Registration
authRouter.post('/register', (req, res: Response) => {
  try {
    const { name, email, phone, password, address, landmark } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, 10-digit phone number, and password are required.' });
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
    }

    const users = db.get('users');
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email or mobile number already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const initialAddresses: SavedAddress[] = address
      ? [
          {
            id: uuidv4(),
            tag: 'Home',
            address: address.trim(),
            landmark: landmark ? landmark.trim() : undefined,
            isDefault: true
          }
        ]
      : [];

    const newUser: User & { passwordHash: string } = {
      id: `user-${uuidv4().substring(0, 8)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'customer',
      addresses: initialAddresses,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    db.mutate(data => {
      data.users.push(newUser);
    });

    const { passwordHash: _, ...safeUser } = newUser;
    const token = createToken(safeUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Customer Login
authRouter.post('/login', (req, res: Response) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Mobile number/Email and password are required.' });
    }

    const users = db.get('users');
    const user = users.find(
      u => u.email.toLowerCase() === identifier.toLowerCase().trim() || u.phone === identifier.trim()
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    const { passwordHash: _, ...safeUser } = user;
    const token = createToken(safeUser);

    return res.json({
      success: true,
      message: 'Welcome back!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Dedicated Admin Login
authRouter.post('/admin-login', (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Admin email and password are required.' });
    }

    const users = db.get('users');
    const admin = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Unauthorized admin credentials.' });
    }

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const { passwordHash: _, ...safeAdmin } = admin;
    const token = createToken(safeAdmin);

    return res.json({
      success: true,
      message: 'Admin authorization granted.',
      token,
      user: safeAdmin
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during admin login.' });
  }
});

// Current User Profile
authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const users = db.get('users');
  const user = users.find(u => u.id === req.user?.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const { passwordHash: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

// Update Profile
authRouter.put('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user?.id;

    let updatedSafeUser: User | null = null;

    db.mutate(data => {
      const idx = data.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        if (name) data.users[idx].name = name.trim();
        if (phone) data.users[idx].phone = phone.trim();
        const { passwordHash: _, ...safe } = data.users[idx];
        updatedSafeUser = safe;
      }
    });

    if (!updatedSafeUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, message: 'Profile updated.', user: updatedSafeUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// Add Saved Address
authRouter.post('/addresses', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tag, address, landmark, isDefault } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, message: 'Address is required.' });
    }

    const newAddr: SavedAddress = {
      id: uuidv4(),
      tag: tag || 'Home',
      address: address.trim(),
      landmark: landmark ? landmark.trim() : undefined,
      isDefault: Boolean(isDefault)
    };

    let userAddresses: SavedAddress[] = [];

    db.mutate(data => {
      const u = data.users.find(usr => usr.id === req.user?.id);
      if (u) {
        if (newAddr.isDefault) {
          u.addresses.forEach((a: SavedAddress) => (a.isDefault = false));
        }
        u.addresses.push(newAddr);
        userAddresses = u.addresses;
      }
    });

    return res.json({ success: true, message: 'Address added.', addresses: userAddresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add address.' });
  }
});

// Delete Saved Address
authRouter.delete('/addresses/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const addrId = req.params.id;
  let userAddresses: SavedAddress[] = [];

  db.mutate(data => {
    const u = data.users.find(usr => usr.id === req.user?.id);
    if (u) {
      u.addresses = u.addresses.filter((a: SavedAddress) => a.id !== addrId);
      userAddresses = u.addresses;
    }
  });

  return res.json({ success: true, message: 'Address removed.', addresses: userAddresses });
});
