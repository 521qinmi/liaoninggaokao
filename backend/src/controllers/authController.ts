import type { Request, Response } from 'express';
import crypto from 'crypto';
import db from '../db/sqlite';

const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// 数据库行 → 前端使用的用户对象（不含密码）
const rowToUser = (row: any) => {
  if (!row) return null;
  let subjects: string[] = [];
  try {
    subjects = row.subjects ? JSON.parse(row.subjects) : [];
  } catch {
    subjects = [];
  }
  return {
    email: row.email,
    name: row.name || '',
    score: row.score || '',
    ranking: row.ranking || '',
    lastYearScore: row.last_year_score || '',
    province: row.province || '',
    physicsOrHistory: row.physics_or_history || '',
    subjects,
  };
};

// 注册：写入 SQLite
export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      name,
      score,
      ranking,
      lastYearScore,
      province,
      physicsOrHistory,
      subjects,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    // 邮箱是否已存在
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: '该邮箱已注册' });
    }

    db.prepare(
      `INSERT INTO users
        (email, password, name, score, ranking, last_year_score, province, physics_or_history, subjects)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      email,
      hashPassword(password),
      name || email.split('@')[0] || '用户',
      String(score ?? ''),
      String(ranking ?? ''),
      String(lastYearScore ?? ''),
      province || '',
      physicsOrHistory || '',
      JSON.stringify(Array.isArray(subjects) ? subjects : [])
    );

    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    res.status(201).json({ message: '注册成功', user: rowToUser(row) });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

// 登录：校验邮箱 + 密码
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    const row: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!row || row.password !== hashPassword(password)) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    res.json({ message: '登录成功', user: rowToUser(row) });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

// 更新个人资料
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const {
      email,
      name,
      score,
      ranking,
      lastYearScore,
      province,
      physicsOrHistory,
      subjects,
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: '缺少邮箱' });
    }

    const row: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!row) {
      return res.status(404).json({ error: '用户不存在' });
    }

    db.prepare(
      `UPDATE users SET
        name = ?, score = ?, ranking = ?, last_year_score = ?,
        province = ?, physics_or_history = ?, subjects = ?,
        updated_at = datetime('now','localtime')
       WHERE email = ?`
    ).run(
      name ?? row.name,
      String(score ?? ''),
      String(ranking ?? ''),
      String(lastYearScore ?? ''),
      province || '',
      physicsOrHistory || '',
      JSON.stringify(Array.isArray(subjects) ? subjects : []),
      email
    );

    const updated = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    res.json({ message: '资料已更新', user: rowToUser(updated) });
  } catch (error) {
    console.error('更新资料失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
