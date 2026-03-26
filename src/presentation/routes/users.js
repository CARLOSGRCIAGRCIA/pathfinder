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

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', validate(userValidation), registerUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(userValidation), loginUser);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     tags: [Users]
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', auth, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     tags: [Users]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/refresh-token', refreshUserTokenHandler);

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, getUserProfile);

/**
 * @swagger
 * /users/me:
 *   put:
 *     tags: [Users]
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/me', auth, updateUserProfile);

/**
 * @swagger
 * /users/me/stats:
 *   get:
 *     tags: [Users]
 *     summary: Get current user stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User stats
 */
router.get('/me/stats', auth, getCurrentUserStats);

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', auth, requirePermission(PERMISSIONS.USERS.READ), getAllUsers);

/**
 * @swagger
 * /users/{userId}/role:
 *   put:
 *     tags: [Users]
 *     summary: Update user role (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role updated
 */
router.put('/:userId/role', auth, requireAdmin, updateUserRole);

/**
 * @swagger
 * /users/{userId}/toggle-active:
 *   patch:
 *     tags: [Users]
 *     summary: Toggle user active status (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status toggled
 */
router.patch('/:userId/toggle-active', auth, requireAdmin, toggleUserActive);

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/:userId', auth, requireAdmin, deleteUser);

export default router;
