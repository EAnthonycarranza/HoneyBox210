const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/email');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const generateVerificationToken = (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  return userId ? `${token}.${userId}` : token;
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
      }

      const { name, email, password, phoneNumber } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }

      // Generate user first to get ID
      const user = new User({
        name,
        email,
        password,
        phoneNumber,
      });

      const verificationToken = generateVerificationToken(user._id);
      user.verificationToken = verificationToken;

      await user.save();

      // Send verification email (non-blocking)
      sendVerificationEmail(email, name, verificationToken);

      res.status(201).json({
        message: 'Account created successfully. Please check your email to verify your account before logging in.',
      });
    } catch (error) {
      console.error('Registration error:', error.message);
      res.status(500).json({ message: 'Server error during registration.' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      if (!user.isVerified) {
        return res.status(401).json({
          message: 'Please verify your email before logging in.',
          isNotVerified: true,
          email: user.email,
        });
      }

      const token = generateToken(user._id);

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin,
          phoneNumber: user.phoneNumber,
        },
      });
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({ message: 'Server error during login.' });
    }
  }
);

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ message: 'Server error fetching user.' });
  }
});

// PUT /api/auth/me - Update user profile
router.put(
  '/me',
  auth,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phoneNumber').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
      }

      const { name, phoneNumber } = req.body;
      const updates = {};

      if (name) updates.name = name;
      if (phoneNumber) updates.phoneNumber = phoneNumber;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      res.json({
        message: 'Profile updated successfully.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin,
          phoneNumber: user.phoneNumber,
          addresses: user.addresses,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error.message);
      res.status(500).json({ message: 'Server error updating profile.' });
    }
  }
);

// GET /api/auth/verify/:token
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    let user = await User.findOne({ verificationToken: token }).select('+verificationToken');

    // If not found by token, check if it's an "already verified" case by decoding the token format
    // New format is "hex.userId"
    if (!user && token && token.includes('.')) {
      const parts = token.split('.');
      const userId = parts[parts.length - 1]; // Support both "token.userId" and just "token"

      if (mongoose.Types.ObjectId.isValid(userId)) {
        const potentialUser = await User.findById(userId);
        if (potentialUser && potentialUser.isVerified) {
          return res.json({ message: 'Email already verified. You can sign in to your account.' });
        }
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now use all features.' });
  } catch (error) {
    console.error('Verification error:', error.message);
    res.status(500).json({ message: 'Server error during verification.' });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+verificationToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    const verificationToken = generateVerificationToken(user._id);
    user.verificationToken = verificationToken;
    await user.save();

    const sent = await sendVerificationEmail(user.email, user.name, verificationToken);

    if (sent) {
      res.json({ message: 'Verification email sent. Please check your inbox.' });
    } else {
      res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
    }
  } catch (error) {
    console.error('Resend verification error:', error.message);
    res.status(500).json({ message: 'Server error resending verification email.' });
  }
});

// POST /api/auth/resend-verification-public - Resend verification email (no auth required)
router.post(
  '/resend-verification-public',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email } = req.body;
      const user = await User.findOne({ email }).select('+verificationToken');

      if (!user) {
        // Don't reveal whether account exists
        return res.json({ message: 'If an account exists with that email, a verification link has been sent.' });
      }

      if (user.isVerified) {
        return res.json({ message: 'This email is already verified. You can sign in.' });
      }

      const verificationToken = generateVerificationToken(user._id);
      user.verificationToken = verificationToken;
      await user.save();

      const sent = await sendVerificationEmail(user.email, user.name, verificationToken);

      if (sent) {
        res.json({ message: 'Verification email sent! Please check your inbox.' });
      } else {
        res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
      }
    } catch (error) {
      console.error('Public resend verification error:', error.message);
      res.status(500).json({ message: 'Server error. Please try again.' });
    }
  }
);

// GET /api/auth/admin/users - Get all users (admin)
router.get('/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('name email phoneNumber isVerified isAdmin createdAt');
    res.json({ users });
  } catch (error) {
    console.error('Admin get users error:', error.message);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// DELETE /api/auth/admin/users/:id - Delete a user (admin)
router.delete('/admin/users/:id', adminAuth, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: 'User not found.' });

    // Prevent deleting other admins (at least through this route)
    if (userToDelete.isAdmin) {
      return res.status(403).json({ message: 'Admin accounts cannot be deleted here.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted.' });
  } catch (error) {
    console.error('Admin delete user error:', error.message);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        // Return success even if user doesn't exist for security
        return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
      }

      // Create reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      await user.save();

      const sent = await sendResetPasswordEmail(user.email, user.name, resetToken);

      if (sent) {
        res.json({ message: 'Password reset link sent to your email.' });
      } else {
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
      }
    } catch (error) {
      console.error('Forgot password error:', error.message);
      res.status(500).json({ message: 'Server error. Please try again.' });
    }
  }
);

// POST /api/auth/reset-password/:token - Reset password using token
router.post(
  '/reset-password/:token',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { token } = req.params;
      const { password } = req.body;

      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token.' });
      }

      // Set new password
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.isVerified = true; // Optionally verify email if they reset password

      await user.save();

      res.json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
      console.error('Reset password error:', error.message);
      res.status(500).json({ message: 'Server error during password reset.' });
    }
  }
);

// PUT /api/auth/change-password - Change password while logged in
router.put(
  '/change-password',
  auth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select('+password');

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully.' });
    } catch (error) {
      console.error('Change password error:', error.message);
      res.status(500).json({ message: 'Server error changing password.' });
    }
  }
);

module.exports = router;
