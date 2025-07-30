import { Router } from 'express';
import { login, googleLogin, register } from '../controllers/auth-controller';
import upload from '../middleware/upload';

const router = Router();

router.post('/login', login);
router.post('/signin', login);
router.post('/register', upload.single('avatar'), register);
router.post('/google-login', googleLogin);

export default router;
