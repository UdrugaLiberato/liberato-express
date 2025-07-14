import { Router } from 'express';
import { login, googleLogin, register } from '../controllers/auth-controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissions } from '../middleware/check-permissions';
import { upload } from '../middleware/upload';
import * as LocationController from '../controllers/location-controller';

const router = Router();

router.post('/login', login);
router.post('/signin', login);
// router.post('/register', register);
router.post('/register', upload.single('avatar'), register);
router.post('/google-login', googleLogin);

export default router;
