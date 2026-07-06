import { Request, Response } from 'express';
import pool from '../db/database';
export const getCarousel = async (req, res) => {
    try {
        const result = await pool.query(`SELECT c.id, c.major_id, m.name, c.title, c.description, c.image_url
       FROM carousel_items c
       LEFT JOIN majors m ON c.major_id = m.id
       ORDER BY c.display_order ASC`);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching carousel:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const getFeaturedMajors = async (req, res) => {
    try {
        const result = await pool.query(`SELECT id, name, category, description, job_prospects, avg_salary
       FROM majors
       LIMIT 6`);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching featured majors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const getNews = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const result = await pool.query(`SELECT id, title, content, category, views, created_at
       FROM news
       ORDER BY created_at DESC
       LIMIT $1`, [limit]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const getHomeData = async (req, res) => {
    try {
        const carousel = await pool.query(`SELECT c.id, c.major_id, m.name, c.title, c.description, c.image_url
       FROM carousel_items c
       LEFT JOIN majors m ON c.major_id = m.id
       ORDER BY c.display_order ASC`);
        const majors = await pool.query(`SELECT id, name, category, description, job_prospects, avg_salary
       FROM majors
       LIMIT 6`);
        const news = await pool.query(`SELECT id, title, content, category, views, created_at
       FROM news
       ORDER BY created_at DESC
       LIMIT 5`);
        res.json({
            carousel: carousel.rows,
            featuredMajors: majors.rows,
            news: news.rows,
        });
    }
    catch (error) {
        console.error('Error fetching home data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=homeController.js.map