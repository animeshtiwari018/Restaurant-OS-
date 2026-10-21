import { Router } from 'express';
import {
  createCategory,
  getCategories,
  createMenuItem,
  getMenuItems,
  updateMenuItem,
} from '../controllers/menu.controller.js';

const router = Router();

router.route('/categories').post(createCategory).get(getCategories);
router.route('/items').post(createMenuItem).get(getMenuItems);
router.route('/items/:id').put(updateMenuItem).patch(updateMenuItem);

export default router;
