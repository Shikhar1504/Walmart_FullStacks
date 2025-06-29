const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Token creator
const createToken = (user, secret, expiresIn) =>
  jwt.sign({ id: user._id, name: user.name, role: user.role }, secret, { expiresIn });

// REGISTER
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password } = req.body;
    console.log('🔐 Register attempt for:', { name, email });

    if (email === 'admin@supply.com') {
      return res.status(409).json({ message: 'This email is reserved for admin use' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    console.log('✅ User created successfully:', { id: user._id, name: user.name, email: user.email });

    // Create JWT tokens and log user in automatically
    const accessToken = createToken(user, process.env.JWT_SECRET, '1h');
    const refreshToken = createToken(user, process.env.JWT_REFRESH_SECRET, '7d');
    console.log('🔐 JWT tokens created for user:', user._id);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production'
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    next(err);
  }
};

// LOGIN
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', { email });
    
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User authenticated successfully:', { id: user._id, name: user.name, email: user.email });

    const accessToken = createToken(user, process.env.JWT_SECRET, '1h');
    const refreshToken = createToken(user, process.env.JWT_REFRESH_SECRET, '7d');
    console.log('🔐 JWT tokens created for user:', user._id);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production'
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production'
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    next(err);
  }
};

// LOGOUT
exports.logout = (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ message: 'Logged out successfully' });
};

// REFRESH TOKEN
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid refresh token' });

      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const accessToken = createToken(user, process.env.JWT_SECRET, '1h');

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production'
      });
      res.json({ message: 'Token refreshed successfully' });
    });
  } catch (err) {
    next(err);
  }
};

// GET USER PROFILE
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    next(err);
  }
};
