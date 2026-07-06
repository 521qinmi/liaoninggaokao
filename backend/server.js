import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// 验证码存储
const verificationCodes = new Map();
function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// 高考成绩本地数据库（演示用）
const gaokaoScores = [
  { admissionNumber: '20240001001', name: '王同学', idLast4: '1234', province: '北京', year: 2024, score: 710, ranking: 85, percentile: 99.8, physics: '物理', subjects: '化学、生物' },
  { admissionNumber: '20240001002', name: '李同学', idLast4: '5678', province: '北京', year: 2024, score: 695, ranking: 245, percentile: 99.5, physics: '物理', subjects: '地理、化学' },
  { admissionNumber: '20240001003', name: '张同学', idLast4: '9012', province: '北京', year: 2024, score: 680, ranking: 520, percentile: 99.0, physics: '历史', subjects: '政治、地理' },
  { admissionNumber: '20240001004', name: '刘同学', idLast4: '3456', province: '北京', year: 2024, score: 665, ranking: 890, percentile: 98.5, physics: '物理', subjects: '生物、政治' },
  { admissionNumber: '20240001005', name: '陈同学', idLast4: '7890', province: '北京', year: 2024, score: 650, ranking: 1250, percentile: 98.0, physics: '历史', subjects: '地理、生物' },
  { admissionNumber: '20240002001', name: '周同学', idLast4: '2345', province: '上海', year: 2024, score: 720, ranking: 42, percentile: 99.9, physics: '物理', subjects: '化学、地理' },
  { admissionNumber: '20240002002', name: '吴同学', idLast4: '6789', province: '上海', year: 2024, score: 705, ranking: 156, percentile: 99.6, physics: '历史', subjects: '政治、生物' },
  { admissionNumber: '20240002003', name: '郑同学', idLast4: '0123', province: '上海', year: 2024, score: 690, ranking: 385, percentile: 99.2, physics: '物理', subjects: '生物、化学' },
  { admissionNumber: '20240003001', name: '孙同学', idLast4: '4567', province: '浙江', year: 2024, score: 715, ranking: 125, percentile: 99.7, physics: '物理', subjects: '化学、生物' },
  { admissionNumber: '20240003002', name: '马同学', idLast4: '8901', province: '浙江', year: 2024, score: 700, ranking: 315, percentile: 99.3, physics: '历史', subjects: '地理、政治' },
  { admissionNumber: '20240004001', name: '朱同学', idLast4: '2109', province: '江苏', year: 2024, score: 685, ranking: 658, percentile: 98.8, physics: '物理', subjects: '化学、地理' },
  { admissionNumber: '20240004002', name: '林同学', idLast4: '5432', province: '江苏', year: 2024, score: 670, ranking: 1125, percentile: 98.2, physics: '历史', subjects: '政治、生物' },
  { admissionNumber: '20240005001', name: '何同学', idLast4: '9876', province: '广东', year: 2024, score: 705, ranking: 285, percentile: 99.4, physics: '物理', subjects: '生物、化学' },
  { admissionNumber: '20240005002', name: '高同学', idLast4: '3210', province: '广东', year: 2024, score: 690, ranking: 745, percentile: 98.7, physics: '历史', subjects: '地理、政治' },
  { admissionNumber: '20240006001', name: '郭同学', idLast4: '7654', province: '四川', year: 2024, score: 695, ranking: 456, percentile: 99.1, physics: '物理', subjects: '化学、生物' },
  { admissionNumber: '20240006002', name: '韦同学', idLast4: '1098', province: '四川', year: 2024, score: 675, ranking: 1568, percentile: 97.8, physics: '历史', subjects: '政治、地理' },
];

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 正在初始化 Express 应用...');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'college_choice',
});

// Middleware
app.use(express.json());

// 调试中间件 - 记录所有请求
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// 自定义 CORS 中间件 - 允许所有源（开发环境）
app.use((req, res, next) => {
  console.log('🔐 CORS 中间件执行 - Origin:', req.headers.origin, 'Method:', req.method);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin,Content-Type,Accept,Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running' });
});

// 测试路由
console.log('📝 注册 POST /test-post');
app.post('/test-post', (req, res) => {
  res.json({ success: true, message: 'POST works' });
});

app.get('/test-get', (req, res) => {
  res.json({ success: true, message: 'GET works' });
});

// Verification routes
app.post('/api/verification/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('收到验证码请求，邮箱:', email);

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
        message: '验证码已发送，请勿频繁请求，请等待60秒后重试',
      });
    }

    const code = generateVerificationCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    verificationCodes.set(email, { code, expiresAt });

    console.log(`验证码已生成 (${email}): ${code}`);

    res.json({
      success: true,
      message: '验证码已发送到您的邮箱',
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({
      success: false,
      message: `系统错误: ${error.message}`,
    });
  }
});

// 高考成绩查询API
console.log('📝 注册 POST /query-score');
app.post('/query-score', (req, res) => {
  try {
    console.log('收到高考查询请求:', req.body);
    const { admissionNumber } = req.body;

    if (!admissionNumber) {
      return res.status(400).json({
        success: false,
        message: '请输入准考证号',
      });
    }

    const record = gaokaoScores.find(s => s.admissionNumber === admissionNumber);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '未找到该准考证号的成绩记录，请检查输入是否正确',
      });
    }

    // 返回成绩信息（隐藏全名，只显示姓氏）
    res.json({
      success: true,
      data: {
        score: record.score,
        ranking: record.ranking,
        percentile: record.percentile,
        province: record.province,
        physicsOrHistory: record.physics,
        subjects: record.subjects,
        message: `恭喜！您的高考成绩为 ${record.score} 分，全省位次 ${record.ranking}，百分位数 ${record.percentile}%`
      }
    });
  } catch (error) {
    console.error('成绩查询失败:', error);
    res.status(500).json({
      success: false,
      message: '系统错误，请稍后重试',
    });
  }
});

// API Routes - Home
app.get('/api/home/carousel', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.major_id, m.name, c.title, c.description, c.image_url
       FROM carousel_items c
       LEFT JOIN majors m ON c.major_id = m.id
       ORDER BY c.display_order ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching carousel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/home/featured-majors', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, category, description, job_prospects, avg_salary
       FROM majors
       LIMIT 6`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching featured majors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/home/news', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const result = await pool.query(
      `SELECT id, title, content, category, views, created_at
       FROM news
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/home/data', async (req, res) => {
  try {
    const carousel = await pool.query(
      `SELECT c.id, c.major_id, m.name, c.title, c.description, c.image_url
       FROM carousel_items c
       LEFT JOIN majors m ON c.major_id = m.id
       ORDER BY c.display_order ASC`
    );

    const majors = await pool.query(
      `SELECT id, name, category, description, job_prospects, avg_salary
       FROM majors
       LIMIT 6`
    );

    const news = await pool.query(
      `SELECT id, title, content, category, views, created_at
       FROM news
       ORDER BY created_at DESC
       LIMIT 5`
    );

    res.json({
      carousel: carousel.rows,
      featuredMajors: majors.rows,
      news: news.rows,
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API Routes - Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Simple hash for demo (not production-ready)
    const crypto = await import('crypto');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const result = await pool.query(
      'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
      [email, hashedPassword, username || email.split('@')[0]]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const crypto = await import('crypto');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const result = await pool.query(
      'SELECT id, email, username, created_at FROM users WHERE email = $1 AND password = $2',
      [email, hashedPassword]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');

    res.json({
      message: 'Login successful',
      user,
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await pool.query(
      'SELECT id, email, username, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/verification/verify-code', async (req, res) => {
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

    verificationCodes.delete(phone);

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
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
