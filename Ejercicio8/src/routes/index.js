import { Router } from 'express';
import authRoutes from './auth.routes.js';
import tracksRoutes from './tracks.routes.js';
import postsRoutes from './posts.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tracks', tracksRoutes);
router.use('/posts', postsRoutes);

export default router;
