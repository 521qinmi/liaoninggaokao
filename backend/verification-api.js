import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// 验证码存储
const verificationCodes = new Map();

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  service: 'qq',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@qq.com',
    pass: process.env.EMAIL_PASSWORD || 'your-password',
  },
});

// 发送验证码
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的邮箱地址',
      });
    }

    const existing = verificationCodes.get(email);
    if (existing && existing.expiresAt > Date.now()) {
      return res.status(429).json({
        success: false,
        message: '验证码已发送，请勿频繁请求',
      });
    }

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    verificationCodes.set(email, { code, expiresAt });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: '智选未来 - 邮箱验证码',
      html: `<h2>邮箱验证码</h2><p style="font-size:32px;font-weight:bold;color:#0066cc;">${code}</p><p>验证码有效期10分钟</p>`,
    });

    res.json({ success: true, message: '验证码已发送' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
