import { Router } from 'express';
import { login, googleLogin, register } from '../controllers/auth-controller';
import { avatarUpload } from '../middleware/upload';

const router = Router();

router.post('/login', login);
router.post('/signin', login);
router.post('/register', avatarUpload.single('avatar'), register);
router.post('/google-login', googleLogin);

export default router;
