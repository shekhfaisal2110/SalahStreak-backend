const ADMIN_EMAIL = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : 'shekhfaisal.2110@gmail.com';

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.email === ADMIN_EMAIL) return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
};