import { Router } from 'express';
import {
  getCarousel,
  getFeaturedMajors,
  getNews,
  getHomeData,
} from '../controllers/homeController';

const router = Router();

router.get('/carousel', getCarousel);
router.get('/featured-majors', getFeaturedMajors);
router.get('/news', getNews);
router.get('/data', getHomeData);

export default router;
