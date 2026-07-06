-- 创建高考成绩表
CREATE TABLE IF NOT EXISTS gaokao_scores (
  id SERIAL PRIMARY KEY,
  admission_number VARCHAR(20) UNIQUE NOT NULL,  -- 准考证号
  student_name VARCHAR(100) NOT NULL,            -- 学生姓名
  id_card_last_4 VARCHAR(4) NOT NULL,            -- 身份证后4位（隐私保护）
  province VARCHAR(50) NOT NULL,                 -- 所在省份
  exam_year INT NOT NULL,                        -- 高考年份
  total_score INT NOT NULL,                      -- 总分
  chinese_score INT,                             -- 语文成绩
  math_score INT,                                -- 数学成绩
  english_score INT,                             -- 英语成绩
  physics_or_history VARCHAR(20),                -- 物理/历史
  subjects VARCHAR(100),                         -- 选科（用逗号分隔）
  ranking INT NOT NULL,                          -- 全省位次
  percentile DECIMAL(5,2),                       -- 百分位数
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_admission_number ON gaokao_scores(admission_number);
CREATE INDEX IF NOT EXISTS idx_province_score ON gaokao_scores(province, total_score);

-- 插入示例数据（2024年，模拟数据）
INSERT INTO gaokao_scores
(admission_number, student_name, id_card_last_4, province, exam_year, total_score, chinese_score, math_score, english_score, physics_or_history, subjects, ranking, percentile)
VALUES
('20240001001', '王同学', '1234', '北京', 2024, 710, 142, 148, 148, '物理', '化学、生物', 85, 99.8),
('20240001002', '李同学', '5678', '北京', 2024, 695, 138, 145, 142, '物理', '地理、化学', 245, 99.5),
('20240001003', '张同学', '9012', '北京', 2024, 680, 135, 140, 138, '历史', '政治、地理', 520, 99.0),
('20240001004', '刘同学', '3456', '北京', 2024, 665, 132, 135, 135, '物理', '生物、政治', 890, 98.5),
('20240001005', '陈同学', '7890', '北京', 2024, 650, 128, 130, 132, '历史', '地理、生物', 1250, 98.0),
('20240002001', '周同学', '2345', '上海', 2024, 720, 145, 150, 150, '物理', '化学、地理', 42, 99.9),
('20240002002', '吴同学', '6789', '上海', 2024, 705, 140, 148, 145, '历史', '政治、生物', 156, 99.6),
('20240002003', '郑同学', '0123', '上海', 2024, 690, 137, 142, 140, '物理', '生物、化学', 385, 99.2),
('20240003001', '孙同学', '4567', '浙江', 2024, 715, 143, 149, 147, '物理', '化学、生物', 125, 99.7),
('20240003002', '马同学', '8901', '浙江', 2024, 700, 140, 145, 143, '历史', '地理、政治', 315, 99.3),
('20240004001', '朱同学', '2109', '江苏', 2024, 685, 136, 141, 136, '物理', '化学、地理', 658, 98.8),
('20240004002', '林同学', '5432', '江苏', 2024, 670, 132, 137, 133, '历史', '政治、生物', 1125, 98.2),
('20240005001', '何同学', '9876', '广东', 2024, 705, 141, 146, 144, '物理', '生物、化学', 285, 99.4),
('20240005002', '高同学', '3210', '广东', 2024, 690, 138, 142, 141, '历史', '地理、政治', 745, 98.7),
('20240006001', '郭同学', '7654', '四川', 2024, 695, 139, 144, 142, '物理', '化学、生物', 456, 99.1),
('20240006002', '韦同学', '1098', '四川', 2024, 675, 134, 138, 134, '历史', '政治、地理', 1568, 97.8);

-- 创建成绩段统计表（用于推荐算法）
CREATE TABLE IF NOT EXISTS score_segments (
  id SERIAL PRIMARY KEY,
  province VARCHAR(50) NOT NULL,
  exam_year INT NOT NULL,
  score_min INT NOT NULL,
  score_max INT NOT NULL,
  rank_start INT NOT NULL,
  rank_end INT NOT NULL,
  count INT NOT NULL,
  UNIQUE(province, exam_year, score_min, score_max)
);

-- 插入成绩段数据
INSERT INTO score_segments (province, exam_year, score_min, score_max, rank_start, rank_end, count)
VALUES
('北京', 2024, 700, 750, 1, 200, 189),
('北京', 2024, 650, 699, 201, 1000, 799),
('北京', 2024, 600, 649, 1001, 2500, 1499),
('北京', 2024, 550, 599, 2501, 4500, 1999),
('上海', 2024, 700, 750, 1, 150, 149),
('上海', 2024, 650, 699, 151, 800, 649),
('上海', 2024, 600, 649, 801, 2000, 1199),
('上海', 2024, 550, 599, 2001, 3500, 1499),
('浙江', 2024, 700, 750, 1, 300, 299),
('浙江', 2024, 650, 699, 301, 1500, 1199),
('浙江', 2024, 600, 649, 1501, 3500, 1999),
('浙江', 2024, 550, 599, 3501, 6000, 2499);
