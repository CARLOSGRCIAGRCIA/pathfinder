import express from 'express';
import { validate, userValidation } from '../../business/utils/validationUtils.js';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
  toggleUserActive,
  deleteUser,
  refreshUserTokenHandler,
  getCurrentUserStats,
} from '../controllers/userController.js';
import { auth, requireAdmin, requirePermission, optionalAuth } from '../middleware/auth.js';
import { PERMISSIONS } from '../../data/models/User.js';

const router = express.Router();

router.post('/register', validate(userValidation), registerUser);

router.post('/login', validate(userValidation), loginUser);

router.post('/logout', auth, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

router.post('/refresh-token', refreshUserTokenHandler);

router.get('/me', auth, getUserProfile);

router.put('/me', auth, updateUserProfile);

router.get('/me/stats', auth, getCurrentUserStats);

router.get('/', auth, requirePermission(PERMISSIONS.USERS.READ), getAllUsers);

router.put('/:userId/role', auth, requireAdmin, updateUserRole);

router.patch('/:userId/toggle-active', auth, requireAdmin, toggleUserActive);

router.delete('/:userId', auth, requireAdmin, deleteUser);

export default router;
