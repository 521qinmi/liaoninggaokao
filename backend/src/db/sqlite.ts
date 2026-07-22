import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

// 数据库文件（backend/data.db），首次运行自动创建
const dbPath = path.join(process.cwd(), 'data.db');
const db = new DatabaseSync(dbPath);

// ===== 建表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT,
    score TEXT,
    ranking TEXT,
    last_year_score TEXT,
    province TEXT,
    physics_or_history TEXT,
    subjects TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS majors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    job_prospects TEXT,
    avg_salary INTEGER,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS carousel_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    views INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS colleges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT,
    nature TEXT,
    name TEXT,
    major TEXT,
    plan06 INTEGER, plan05 INTEGER, plan04 INTEGER, plan03 INTEGER,
    off05 INTEGER, rank05 INTEGER,
    off04 INTEGER, rank04 INTEGER,
    off03 INTEGER, rank03 INTEGER,
    sort_order INTEGER DEFAULT 0
  );
`);

// ===== 初始化种子数据（仅当表为空时）=====
const count = (table: string): number =>
  (db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number }).c;

if (count('majors') === 0) {
  const stmt = db.prepare(
    'INSERT INTO majors (name, category, description, job_prospects, avg_salary, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  );
  [
    ['计算机科学与技术', '工科', '培养掌握计算机软硬件知识的高级技术人才', '优秀', 18000, 1],
    ['人工智能', '工科', '学习深度学习、机器学习等前沿技术', '优秀', 20000, 2],
    ['数据科学与大数据技术', '工科', '培养大数据处理和分析人才', '优秀', 17000, 3],
    ['财务管理', '管理', '培养财务管理专业人才', '良好', 12000, 4],
    ['法学', '法学', '培养法律专业人才', '良好', 11000, 5],
    ['医学', '医学', '培养医疗卫生专业人才', '优秀', 14000, 6],
  ].forEach((r) => stmt.run(...(r as [string, string, string, string, number, number])));
}

if (count('carousel_items') === 0) {
  const stmt = db.prepare('INSERT INTO carousel_items (title, description, sort_order) VALUES (?, ?, ?)');
  [
    ['计算机科学与技术', '当今最热门的技术专业，就业前景广阔', 1],
    ['人工智能', '未来科技的核心，引领数字时代', 2],
    ['数据科学与大数据技术', '数据驱动决策的时代已来', 3],
  ].forEach((r) => stmt.run(...(r as [string, string, number])));
}

if (count('news') === 0) {
  const stmt = db.prepare(
    "INSERT INTO news (title, content, category, views, created_at) VALUES (?, ?, ?, ?, datetime('now','localtime', ?))"
  );
  [
    ['2024年高考报名人数突破新高', '今年高考考生人数创历史新高，各校录取竞争更加激烈', '行业动态', 1200, '0 day'],
    ['AI时代来临，这些专业最吃香', '随着人工智能发展，相关专业就业前景持续看好', '就业前景', 980, '-1 day'],
    ['大学四年应该如何选择专业方向', '专业选择决定职业发展，选对专业很关键', '专业指导', 756, '-2 day'],
    ['教育部发布2024年高考改革新政', '多项改革政策出台，将影响未来几年高考', '政策解读', 1450, '-3 day'],
    ['名校开设新专业，应对产业升级', '清华北大等高校纷纷设立新兴产业相关专业', '校园新闻', 890, '-4 day'],
  ].forEach((r) => stmt.run(...(r as [string, string, string, number, string])));
}

if (count('colleges') === 0) {
  const stmt = db.prepare(
    `INSERT INTO colleges
      (level, nature, name, major, plan06, plan05, plan04, plan03, off05, rank05, off04, rank04, off03, rank03, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  [
    ['冲', '985', '清华大学', '计算机科学与技术', 80, 75, 72, 70, 25, 45, 22, 52, 20, 58, 1],
    ['冲', '211', '北京大学', '数学与应用数学', 70, 68, 65, 62, 23, 55, 21, 62, 18, 70, 2],
    ['稳', '双一流', '复旦大学', '物理学', 120, 110, 108, 105, 5, 245, 3, 258, 2, 270, 3],
    ['稳', '省重点', '浙江大学', '电子信息工程', 150, 140, 138, 135, 8, 210, 5, 225, 4, 240, 4],
    ['保', '双高计划', '南京大学', '化学', 100, 95, 92, 90, -15, 850, -12, 920, -10, 1000, 5],
    ['保', '公办', '武汉大学', '地质学', 90, 85, 82, 80, -12, 750, -10, 820, -8, 900, 6],
  ].forEach((r) => stmt.run(...(r as number[] as any)));
}

export default db;
