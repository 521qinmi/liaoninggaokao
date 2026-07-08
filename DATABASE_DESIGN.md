# 智选未来 - 数据库设计文档

## 1. 系统概述

### 项目名称
智选未来 (Smart Future College Choice Recommendation)

### 系统功能
- 用户注册和登录（邮箱认证）
- 高考成绩查询
- 志愿填报表单
- 学校与专业推荐
- 推荐结果展示

### 数据库选择
- **主数据库**: PostgreSQL (生产环境推荐)
- **开发环境**: SQLite 或 PostgreSQL
- **缓存**: Redis (验证码存储、会话管理)

---

## 2. 核心数据表设计

### 2.1 用户表 (users)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
```

**字段说明：**
- `id`: 用户唯一标识
- `email`: 邮箱（唯一）
- `password_hash`: 密码哈希值（不存储明文）
- `username`: 用户名（可选）
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `is_active`: 账户是否激活

---

### 2.2 邮箱验证表 (email_verifications)

```sql
CREATE TABLE email_verifications (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  verification_code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_verifications_email ON email_verifications(email);
CREATE INDEX idx_verifications_expires ON email_verifications(expires_at);
```

**字段说明：**
- `id`: 验证记录ID
- `email`: 待验证邮箱
- `verification_code`: 6位验证码
- `expires_at`: 过期时间（10分钟）
- `is_verified`: 是否已验证
- `created_at`: 生成时间

---

### 2.3 高考成绩表 (gaokao_scores)

```sql
CREATE TABLE gaokao_scores (
  id SERIAL PRIMARY KEY,
  admission_number VARCHAR(20) UNIQUE NOT NULL,
  student_name VARCHAR(100),
  id_last4 VARCHAR(4),
  province VARCHAR(50) NOT NULL,
  exam_year INTEGER NOT NULL DEFAULT 2024,
  score INTEGER NOT NULL,
  ranking INTEGER NOT NULL,
  percentile DECIMAL(5, 2),
  physics_or_history VARCHAR(20),
  subject1 VARCHAR(50),
  subject2 VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_gaokao_admission ON gaokao_scores(admission_number);
CREATE INDEX idx_gaokao_province ON gaokao_scores(province);
CREATE INDEX idx_gaokao_score ON gaokao_scores(score);
CREATE INDEX idx_gaokao_ranking ON gaokao_scores(ranking);
```

**字段说明：**
- `admission_number`: 准考证号（唯一）
- `student_name`: 学生姓名
- `id_last4`: 身份证后4位（隐私保护）
- `province`: 报考省份
- `exam_year`: 考试年份
- `score`: 高考成绩
- `ranking`: 全省位次
- `percentile`: 百分位数
- `physics_or_history`: 物理或历史选择
- `subject1`, `subject2`: 选科科目

---

### 2.4 历年分数转换表 (historical_scores)

```sql
CREATE TABLE historical_scores (
  id SERIAL PRIMARY KEY,
  province VARCHAR(50) NOT NULL,
  exam_year INTEGER NOT NULL,
  ranking_threshold INTEGER NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_historical_scores ON historical_scores(province, exam_year, ranking_threshold);
```

**用途：** 根据今年排名推算去年相同排名的分数

**示例数据：**
```
province: '北京', exam_year: 2025, ranking_threshold: 85, score: 695
province: '北京', exam_year: 2025, ranking_threshold: 245, score: 680
province: '北京', exam_year: 2025, ranking_threshold: 1000, score: 650
```

---

### 2.5 志愿填报表 (volunteer_forms)

```sql
CREATE TABLE volunteer_forms (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  admission_number VARCHAR(20),
  score INTEGER NOT NULL,
  ranking INTEGER NOT NULL,
  last_year_equivalent_score INTEGER,
  province VARCHAR(50) NOT NULL,
  physics_or_history VARCHAR(20),
  subject1 VARCHAR(50),
  subject2 VARCHAR(50),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_volunteer_forms_user ON volunteer_forms(user_id);
CREATE INDEX idx_volunteer_forms_admission ON volunteer_forms(admission_number);
```

**字段说明：** 保存用户提交的志愿填报表单数据

---

### 2.6 学校信息表 (schools)

```sql
CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  school_type VARCHAR(100),
  province VARCHAR(50),
  characteristics TEXT,
  established_year INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_schools_name ON schools(name);
CREATE INDEX idx_schools_type ON schools(school_type);
CREATE INDEX idx_schools_province ON schools(province);
```

**学校性质（school_type）:**
- 985
- 211
- 双一流
- 省重点
- 双高计划
- 公办
- 民办
- 部署
- 省属
- 市属
- 中外合作
- 本科（一本）
- 本科（二本）
- 专科
- 军事院校
- 公安/司法类院校
- 党校/行政学校
- 成人高等学校

---

### 2.7 专业信息表 (majors)

```sql
CREATE TABLE majors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  job_prospects VARCHAR(50),
  avg_salary DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_majors_name ON majors(name);
CREATE INDEX idx_majors_category ON majors(category);
```

---

### 2.8 学校专业招生计划表 (school_major_plans)

```sql
CREATE TABLE school_major_plans (
  id SERIAL PRIMARY KEY,
  school_id INTEGER NOT NULL,
  major_id INTEGER NOT NULL,
  exam_year INTEGER NOT NULL,
  plan_count INTEGER NOT NULL,
  min_score INTEGER,
  min_ranking INTEGER,
  physics_or_history_required VARCHAR(20),
  subject1_required VARCHAR(50),
  subject2_required VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE CASCADE
);

-- 索引
CREATE UNIQUE INDEX idx_school_major_plans ON school_major_plans(school_id, major_id, exam_year);
```

**用途：** 存储各校各专业不同年份的招生计划数据

---

### 2.9 推荐记录表 (recommendations)

```sql
CREATE TABLE recommendations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  volunteer_form_id INTEGER,
  school_id INTEGER NOT NULL,
  major_id INTEGER NOT NULL,
  recommendation_level VARCHAR(10),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (volunteer_form_id) REFERENCES volunteer_forms(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (major_id) REFERENCES majors(id)
);

-- 索引
CREATE INDEX idx_recommendations_user ON recommendations(user_id);
CREATE INDEX idx_recommendations_level ON recommendations(recommendation_level);
```

**recommendation_level:** 冲 / 稳 / 保

---

### 2.10 资讯表 (news)

```sql
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  category VARCHAR(100),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_created ON news(created_at);
```

---

## 3. 关系图

```
users (1) ──→ (多) email_verifications
users (1) ──→ (多) volunteer_forms
users (1) ──→ (多) recommendations

volunteer_forms (1) ──→ (多) recommendations

schools (1) ──→ (多) school_major_plans
schools (1) ──→ (多) recommendations

majors (1) ──→ (多) school_major_plans
majors (1) ──→ (多) recommendations

gaokao_scores: 独立表（成绩查询）
historical_scores: 独立表（分数转换）
```

---

## 4. 数据量估算

| 表名 | 预期行数 | 说明 |
|-----|--------|------|
| users | 100K | 注册用户 |
| gaokao_scores | 1M | 全国高考成绩（每年） |
| schools | 3K | 国内高校数量 |
| majors | 10K | 专业总数 |
| school_major_plans | 100K | 每校多个专业，多年数据 |
| volunteer_forms | 50K | 填报记录 |
| recommendations | 300K | 推荐记录 |
| news | 1K | 资讯 |

---

## 5. 索引策略

### 必需索引
- `users.email` - 登录查询
- `gaokao_scores.admission_number` - 成绩查询
- `gaokao_scores.score` - 分数排序
- `historical_scores(province, exam_year, ranking_threshold)` - 复合查询

### 可选索引
- `volunteer_forms.user_id` - 用户志愿查询
- `schools.school_type` - 学校性质筛选
- `recommendations.recommendation_level` - 推荐等级筛选

---

## 6. 查询性能优化

### 常见查询

**1. 查询高考成绩**
```sql
SELECT * FROM gaokao_scores 
WHERE admission_number = '20240001001';
```

**2. 根据排名获取去年等同分数**
```sql
SELECT score FROM historical_scores
WHERE province = '北京' 
AND exam_year = 2025 
AND ranking_threshold >= 85
ORDER BY ranking_threshold ASC
LIMIT 1;
```

**3. 获取学校招生信息**
```sql
SELECT s.name, m.name, smp.plan_count, smp.min_score
FROM schools s
JOIN school_major_plans smp ON s.id = smp.school_id
JOIN majors m ON smp.major_id = m.id
WHERE s.school_type = '985' 
AND smp.exam_year = 2024
ORDER BY smp.min_score DESC;
```

---

## 7. 缓存策略（Redis）

```
# 验证码（临时存储）
verification_code:{email} -> {code:1234567, expires: timestamp}

# 用户会话
session:{session_id} -> {user_id, email, login_time}

# 成绩查询缓存（可选）
gaokao_score:{admission_number} -> {JSON数据, expires: 24h}

# 推荐结果缓存
recommendation:{user_id} -> {JSON数组, expires: 1h}
```

---

## 8. 备份与恢复

### 备份策略
- **频率**: 每日一次全量备份，每小时一次增量备份
- **保留期**: 30天
- **位置**: 异地备份（云存储）

### 备份命令示例
```bash
# PostgreSQL 全量备份
pg_dump college_choice_db > backup_$(date +%Y%m%d).sql

# 恢复
psql college_choice_db < backup_20240708.sql
```

---

## 9. 安全性考虑

### 数据保护
- ✅ 密码使用 bcrypt 哈希存储
- ✅ 敏感信息（身份证后4位）脱敏存储
- ✅ 邮箱验证码临时存储，有效期10分钟
- ✅ SQL 注入防护：使用参数化查询
- ✅ 访问控制：基于用户ID的数据隔离

### 审计日志
可选：添加操作审计表记录重要操作

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  action VARCHAR(100),
  table_name VARCHAR(100),
  record_id INTEGER,
  old_value JSON,
  new_value JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 10. 扩展建议

### 未来可能需要的表
1. **用户收藏表** - 收藏喜欢的学校/专业
2. **用户对比表** - 对比多个学校
3. **分析报告表** - 保存用户分析历史
4. **反馈表** - 用户反馈和建议
5. **操作日志表** - 审计和分析用户行为

### 性能优化
- 使用连接池（PgBouncer）
- 定期 VACUUM 和 ANALYZE
- 分区大表（按年份分区 gaokao_scores）
- 定期重建索引

---

## 11. 部署建议

### 开发环境
```
数据库: SQLite 或 local PostgreSQL
缓存: Redis (可选)
备份: 本地备份脚本
```

### 生产环境
```
数据库: PostgreSQL (托管服务如 AWS RDS)
缓存: Redis (托管服务如 Redis Cloud)
备份: 自动日备份
监控: Datadog / New Relic
```

---

## 12. 初始化脚本

参考文件：`backend/src/db/schema.sql`

包含所有上述表的创建语句和初始索引配置。

---

**文档版本**: 1.0  
**最后更新**: 2026-07-08  
**维护者**: 智选未来开发团队
