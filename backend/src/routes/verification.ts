import { Router } from 'express';
import { sendVerificationCode, verifyCode } from '../controllers/verificationController.js';

const router = Router();

// 发送验证码
router.post('/send-code', sendVerificationCode);

// 验证验证码
router.post('/verify-code', verifyCode);

export default router;
