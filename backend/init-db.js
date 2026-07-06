import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'college_choice',
});

pool.on('error', (err) => {
  console.error('数据库连接错误:', err);
});

const initDb = async () => {
  try {
    console.log('📦 开始初始化数据库...');
    console.log('连接信息:', {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '5432',
      database: process.env.DB_NAME || 'college_choice'
    });

    // 创建表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gaokao_scores (
        id SERIAL PRIMARY KEY,
        admission_number VARCHAR(20) UNIQUE NOT NULL,
        student_name VARCHAR(100) NOT NULL,
        id_card_last_4 VARCHAR(4) NOT NULL,
        province VARCHAR(50) NOT NULL,
        exam_year INT NOT NULL,
        total_score INT NOT NULL,
        chinese_score INT,
        math_score INT,
        english_score INT,
        physics_or_history VARCHAR(20),
        subjects VARCHAR(100),
        ranking INT NOT NULL,
        percentile DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ 成绩表创建成功');

    // 创建索引
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admission_number ON gaokao_scores(admission_number)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_province_score ON gaokao_scores(province, total_score)
    `);
    console.log('✓ 索引创建成功');

    // 检查是否已有数据
    const result = await pool.query('SELECT COUNT(*) FROM gaokao_scores');
    if (result.rows[0].count > 0) {
      console.log('✓ 数据已存在，跳过数据插入');
      await pool.end();
      return;
    }

    // 插入示例数据
    const sampleData = [
      ['20240001001', '王同学', '1234', '北京', 2024, 710, 142, 148, 148, '物理', '化学、生物', 85, 99.8],
      ['20240001002', '李同学', '5678', '北京', 2024, 695, 138, 145, 142, '物理', '地理、化学', 245, 99.5],
      ['20240001003', '张同学', '9012', '北京', 2024, 680, 135, 140, 138, '历史', '政治、地理', 520, 99.0],
      ['20240001004', '刘同学', '3456', '北京', 2024, 665, 132, 135, 135, '物理', '生物、政治', 890, 98.5],
      ['20240001005', '陈同学', '7890', '北京', 2024, 650, 128, 130, 132, '历史', '地理、生物', 1250, 98.0],
      ['20240002001', '周同学', '2345', '上海', 2024, 720, 145, 150, 150, '物理', '化学、地理', 42, 99.9],
      ['20240002002', '吴同学', '6789', '上海', 2024, 705, 140, 148, 145, '历史', '政治、生物', 156, 99.6],
      ['20240002003', '郑同学', '0123', '上海', 2024, 690, 137, 142, 140, '物理', '生物、化学', 385, 99.2],
      ['20240003001', '孙同学', '4567', '浙江', 2024, 715, 143, 149, 147, '物理', '化学、生物', 125, 99.7],
      ['20240003002', '马同学', '8901', '浙江', 2024, 700, 140, 145, 143, '历史', '地理、政治', 315, 99.3],
      ['20240004001', '朱同学', '2109', '江苏', 2024, 685, 136, 141, 136, '物理', '化学、地理', 658, 98.8],
      ['20240004002', '林同学', '5432', '江苏', 2024, 670, 132, 137, 133, '历史', '政治、生物', 1125, 98.2],
      ['20240005001', '何同学', '9876', '广东', 2024, 705, 141, 146, 144, '物理', '生物、化学', 285, 99.4],
      ['20240005002', '高同学', '3210', '广东', 2024, 690, 138, 142, 141, '历史', '地理、政治', 745, 98.7],
      ['20240006001', '郭同学', '7654', '四川', 2024, 695, 139, 144, 142, '物理', '化学、生物', 456, 99.1],
      ['20240006002', '韦同学', '1098', '四川', 2024, 675, 134, 138, 134, '历史', '政治、地理', 1568, 97.8],
    ];

    for (const data of sampleData) {
      await pool.query(
        `INSERT INTO gaokao_scores
        (admission_number, student_name, id_card_last_4, province, exam_year, total_score, chinese_score, math_score, english_score, physics_or_history, subjects, ranking, percentile)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (admission_number) DO NOTHING`,
        data
      );
    }
    console.log('✓ 示例数据插入成功（16条记录）');

    console.log('✅ 数据库初始化完成！');
    await pool.end();
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    await pool.end();
    process.exit(1);
  }
};

initDb();
