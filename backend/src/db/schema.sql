-- 创建 majors 表（专业信息）
CREATE TABLE IF NOT EXISTS majors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  job_prospects VARCHAR(20),
  avg_salary INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 carousel_items 表（轮播内容）
CREATE TABLE IF NOT EXISTS carousel_items (
  id SERIAL PRIMARY KEY,
  major_id INTEGER REFERENCES majors(id) ON DELETE CASCADE,
  image_url VARCHAR(255),
  title VARCHAR(150),
  description TEXT,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 news 表（热点话题）
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  category VARCHAR(50),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 users 表（用户信息）
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入示例数据 - 专业
INSERT INTO majors (name, category, description, job_prospects, avg_salary) VALUES
('计算机科学与技术', '工科', '培养掌握计算机软硬件知识的高级技术人才', '优秀', 18000),
('人工智能', '工科', '学习深度学习、机器学习等前沿技术', '优秀', 20000),
('数据科学与大数据技术', '工科', '培养大数据处理和分析人才', '优秀', 17000),
('财务管理', '管理', '培养财务管理专业人才', '良好', 12000),
('法学', '法学', '培养法律专业人才', '良好', 11000),
('医学', '医学', '培养医疗卫生专业人才', '优秀', 14000)
ON CONFLICT DO NOTHING;

-- 插入轮播数据
INSERT INTO carousel_items (major_id, title, description, display_order) VALUES
(1, '计算机科学与技术', '当今最热门的技术专业，就业前景广阔', 1),
(2, '人工智能', '未来科技的核心，引领数字时代', 2),
(3, '数据科学与大数据技术', '数据驱动决策的时代已来', 3)
ON CONFLICT DO NOTHING;

-- 插入新闻数据
INSERT INTO news (title, content, category) VALUES
('2024年高考报名人数突破新高', '今年高考考生人数创历史新高，各校录取竞争更加激烈', '行业动态'),
('AI时代来临，这些专业最吃香', '随着人工智能发展，相关专业就业前景持续看好', '就业前景'),
('大学四年应该如何选择专业方向', '专业选择决定职业发展，选对专业很关键', '专业指导')
ON CONFLICT DO NOTHING;
