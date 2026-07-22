import type { Request, Response } from 'express';
import db from '../db/sqlite';

export const getCarousel = async (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT id, title, description, image_url FROM carousel_items ORDER BY sort_order ASC').all();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching carousel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFeaturedMajors = async (_req: Request, res: Response) => {
  try {
    const rows = db.prepare(
      'SELECT id, name, category, description, job_prospects, avg_salary FROM majors ORDER BY sort_order ASC LIMIT 6'
    ).all();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching featured majors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNews = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const rows = db.prepare(
      'SELECT id, title, content, category, views, created_at FROM news ORDER BY created_at DESC LIMIT ?'
    ).all(limit);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 院校推荐库（前端结合考生分数计算分数线）
export const getColleges = async (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM colleges ORDER BY sort_order ASC').all();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHomeData = async (_req: Request, res: Response) => {
  try {
    const carousel = db.prepare('SELECT id, title, description, image_url FROM carousel_items ORDER BY sort_order ASC').all();
    const majors = db.prepare(
      'SELECT id, name, category, description, job_prospects, avg_salary FROM majors ORDER BY sort_order ASC LIMIT 6'
    ).all();
    const news = db.prepare(
      'SELECT id, title, content, category, views, created_at FROM news ORDER BY created_at DESC LIMIT 5'
    ).all();

    res.json({ carousel, featuredMajors: majors, news });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
