import { Router } from 'express';
import {
  createCategory,
  getCategories,
  createMenuItem,
  getMenuItems,
} from '../controllers/menu.controller.js';

const router = Router();

router.route('/categories').post(createCategory).get(getCategories);
router.route('/items').post(createMenuItem).get(getMenuItems);

export default router;
