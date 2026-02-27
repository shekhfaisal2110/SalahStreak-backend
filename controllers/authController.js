import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import { sendOtpEmail, sendRegistrationEmail } from '../utils/emailService.js';
import crypto from 'crypto';

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const generateUniqueLoginKey = async () => {
  let key;
  let exists = true;
  while (exists) {
    key = crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').substring(0, 8);
    const user = await User.findOne({ loginKey: key });
    if (!user) exists = false;
  }
  return key;
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if a verified user already exists with this email
    const existingVerified = await User.findOne({ email, isVerified: true });
    if (existingVerified) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // 2. If an unverified user exists, delete it (and its OTPs) to allow a fresh start
    const existingUnverified = await User.findOne({ email, isVerified: false });
    if (existingUnverified) {
      await Otp.deleteMany({ email });
      await existingUnverified.deleteOne();
    }

    // 3. Generate OTP and login key
    const otp = generateOTP();
    const loginKey = await generateUniqueLoginKey();

    // 4. Create the user (unverified)
    const user = await User.create({ name, email, password, loginKey, isVerified: false });

    // 5. Store OTP in database
    await Otp.create({
      email,
      otp,
      type: 'verify',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // 6. Attempt to send email
    try {
      await sendRegistrationEmail(email, name, otp, loginKey);
    } catch (emailError) {
      // If email fails, roll back: delete the user and OTP
      await user.deleteOne();
      await Otp.deleteOne({ email, otp, type: 'verify' });
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ success: false, message: 'Failed to send verification email. Please try again.' });
    }

    // 7. Email sent successfully – generate token and respond
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name, email, isVerified: false },
      // loginKey // optional – you can send it to show once
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, type } = req.body;
    const record = await Otp.findOne({ email, otp, type });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (type === 'verify') {
      await User.findOneAndUpdate({ email }, { isVerified: true });
    }

    await Otp.deleteOne({ _id: record._id });
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    await Otp.create({
      email,
      otp,
      type: 'reset',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpEmail(email, otp, 'reset');
    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = await Otp.findOne({ email, otp, type: 'reset' });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    user.password = newPassword;
    await user.save();

    await Otp.deleteOne({ _id: record._id });
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export const loginWithKey = async (req, res) => {
  try {
    const { loginKey } = req.body;
    const user = await User.findOne({ loginKey });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid login key' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};