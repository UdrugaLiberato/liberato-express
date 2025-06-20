import { Router } from 'express';
import {login, googleLogin, register} from '../controllers/auth-controller';

const router = Router();

router.post('/login', login);
router.post('/signin', login);
router.post('/register', register);
router.post('/google-login', googleLogin);

export default router;