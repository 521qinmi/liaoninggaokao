import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import db from '../db/sqlite';

// 验证码存储（开发环境使用内存，生产环境应使用 Redis）
const verificationCodes: Map<string, { code: string; expiresAt: number }> = new Map();

// 邮箱格式校验
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 是否已配置发件邮箱（请求时读取，避免模块加载早于 dotenv 的时序问题）
const isEmailConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

// 创建邮件传输器（请求时构建，默认 163 邮箱，可用 EMAIL_SERVICE 覆盖）
const createTransporter = () =>
  nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || '163',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || '',
    },
  });

// 生成6位随机验证码
function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// 发送验证码（基于邮箱）
export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // 校验邮箱格式
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的邮箱地址',
      });
    }

    // 邮箱不能重复注册：已注册则不发码，提示直接登录
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '该邮箱已注册，请直接登录',
      });
    }

    // 检查是否已有验证码未过期（60 秒内不允许重复发送）
    const existing = verificationCodes.get(email);
    if (existing && existing.expiresAt - 9 * 60 * 1000 > Date.now()) {
      return res.status(429).json({
        success: false,
        message: '验证码已发送，请稍后再试',
      });
    }

    // 生成新验证码
    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10分钟过期

    // 未配置发件邮箱时，明确报错（不做本地演示）
    if (!isEmailConfigured()) {
      console.error('未配置 EMAIL_USER / EMAIL_PASSWORD，无法发送验证码邮件');
      return res.status(500).json({
        success: false,
        message: '邮件服务未配置，请在后端 .env 中设置 EMAIL_USER 和 EMAIL_PASSWORD',
      });
    }

    // 发送验证码邮件
    try {
      await createTransporter().sendMail({
        from: `"智选未来" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '智选未来 - 注册验证码',
        html: `
          <h2>您的注册验证码为：</h2>
          <p style="font-size: 32px; color: #0066cc; font-weight: bold; letter-spacing: 5px;">
            ${code}
          </p>
          <p style="color: #666;">
            此验证码 10 分钟内有效，请勿分享给他人。
          </p>
        `,
      });
    } catch (emailError) {
      console.error('验证码邮件发送失败:', emailError);
      return res.status(502).json({
        success: false,
        message: '验证码邮件发送失败，请检查发件邮箱配置或稍后重试',
      });
    }

    // 邮件发送成功后再保存验证码
    verificationCodes.set(email, { code, expiresAt });

    res.json({
      success: true,
      message: '验证码已发送到您的邮箱，请查收',
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({
      success: false,
      message: '发送验证码失败',
    });
  }
};

// 验证码验证（基于邮箱）
export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: '邮箱和验证码不能为空',
      });
    }

    const stored = verificationCodes.get(email);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: '验证码不存在或已过期，请重新获取',
      });
    }

    if (stored.expiresAt < Date.now()) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: '验证码已过期，请重新获取',
      });
    }

    if (stored.code !== code) {
      return res.status(400).json({
        success: false,
        message: '验证码错误',
      });
    }

    // 验证成功，删除验证码
    verificationCodes.delete(email);

    res.json({
      success: true,
      message: '验证码正确',
    });
  } catch (error) {
    console.error('验证码验证失败:', error);
    res.status(500).json({
      success: false,
      message: '验证码验证失败',
    });
  }
};
