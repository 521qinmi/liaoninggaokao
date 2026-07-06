import nodemailer from 'nodemailer';
// 验证码存储（开发环境使用内存，生产环境应使用 Redis）
const verificationCodes = new Map();
// 创建邮件传输器（使用 QQ 邮箱作为示例）
const transporter = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: process.env.EMAIL_USER || 'your-qq-email@qq.com',
        pass: process.env.EMAIL_PASSWORD || 'your-qq-app-password',
    },
});
// 生成6位随机验证码
function generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}
// 发送验证码
export const sendVerificationCode = async (req, res) => {
    try {
        const { phone } = req.body;
        // 验证电话号码格式
        if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: '请输入有效的中国电话号码',
            });
        }
        // 检查是否已有验证码未过期
        const existing = verificationCodes.get(phone);
        if (existing && existing.expiresAt > Date.now()) {
            return res.status(429).json({
                success: false,
                message: '验证码已发送，请勿频繁请求',
            });
        }
        // 生成新验证码
        const code = generateCode();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10分钟过期
        // 保存验证码
        verificationCodes.set(phone, { code, expiresAt });
        // 发送邮件通知（实际环境应发送短信）
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER || 'your-qq-email@qq.com',
                to: phone.replace(/(.{3})(.{4})(.{4})/, '$1****$3') + '@example.com', // 示例邮箱
                subject: '智选未来 - 验证码',
                html: `
          <h2>您的验证码为：</h2>
          <p style="font-size: 32px; color: #0066cc; font-weight: bold; letter-spacing: 5px;">
            ${code}
          </p>
          <p style="color: #666;">
            此验证码10分钟内有效，请勿分享给他人。
          </p>
        `,
            });
        }
        catch (emailError) {
            console.log('邮件发送失败，但验证码已生成（演示环境）');
        }
        res.json({
            success: true,
            message: '验证码已发送',
            code: process.env.NODE_ENV === 'development' ? code : undefined, // 开发环境返回验证码便于测试
        });
    }
    catch (error) {
        console.error('发送验证码失败:', error);
        res.status(500).json({
            success: false,
            message: '发送验证码失败',
        });
    }
};
// 验证码验证
export const verifyCode = async (req, res) => {
    try {
        const { phone, code } = req.body;
        if (!phone || !code) {
            return res.status(400).json({
                success: false,
                message: '手机号和验证码不能为空',
            });
        }
        const stored = verificationCodes.get(phone);
        if (!stored) {
            return res.status(400).json({
                success: false,
                message: '验证码不存在或已过期',
            });
        }
        if (stored.expiresAt < Date.now()) {
            verificationCodes.delete(phone);
            return res.status(400).json({
                success: false,
                message: '验证码已过期',
            });
        }
        if (stored.code !== code) {
            return res.status(400).json({
                success: false,
                message: '验证码错误',
            });
        }
        // 验证成功，删除验证码
        verificationCodes.delete(phone);
        res.json({
            success: true,
            message: '验证码正确',
        });
    }
    catch (error) {
        console.error('验证码验证失败:', error);
        res.status(500).json({
            success: false,
            message: '验证码验证失败',
        });
    }
};
// 检查验证码是否存在（用于测试）
export const checkCode = (phone) => {
    const stored = verificationCodes.get(phone);
    return stored ? stored.expiresAt > Date.now() : false;
};
//# sourceMappingURL=verificationController.js.map