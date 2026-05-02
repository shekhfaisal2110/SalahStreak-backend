// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// export const protect = async (req, res, next) => {
//   let token;
//   if (req.headers.authorization?.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id).select('-password');
//       if (!req.user) {
//         return res.status(401).json({ success: false, message: 'User not found' });
//       }
//       next();
//     } catch (error) {
//       return res.status(401).json({ success: false, message: 'Not authorized' });
//     }
//   } else {
//     return res.status(401).json({ success: false, message: 'No token provided' });
//   }
// };



import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // ✅ Lean query with only needed fields
      const user = await User.findById(decoded.id)
        .select('name email isVerified streak pincode showRank totalSteps') // add fields as needed
        .lean();
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      
      req.user = user; // now plain JS object, not Mongoose document
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired, please login again' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
};