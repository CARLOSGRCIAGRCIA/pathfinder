import express from 'express';
import { validate, userValidation } from '../../business/utils/validationUtils.js';
import {
  registerUser,
  loginUser,
  getUserProfile,
  refreshUserTokenHandler,
} from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validate(userValidation), registerUser);
router.post('/login', validate(userValidation), loginUser);
router.get('/profile', auth, getUserProfile);
router.post('/refresh-token', refreshUserTokenHandler);

export default router;