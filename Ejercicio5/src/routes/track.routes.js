// src/routes/track.routes.js
import { Router } from 'express';
import {
  getTracks,
  getTrack,
  createTrack,
  updateTrack,
  deleteTrack,
  getTopTracks,
  getTracksByArtist,
  playTrack,
  likeTrack
} from '../controllers/tracks.controller.js';

const router = Router();

router.get('/', getTracks);
router.get('/top', getTopTracks);
router.get('/artist/:artistId', getTracksByArtist);
router.get('/:id', getTrack);
router.post('/', createTrack);
router.put('/:id', updateTrack);
router.delete('/:id', deleteTrack);
router.post('/:id/play', playTrack);
router.post('/:id/like', likeTrack);

export default router;
