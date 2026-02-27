import { Router } from "express";
import { getMovies,
     getMovie,
     createMovie,
     updateMovie, 
     deleteMovie, 
     rentMovie, 
     returnMovie, 
     updateCover, 
     getCover, 
     getMostRentedMovies } from "../controllers/movie.controller.js";

const router = Router();

router.get('/', getMovies);
router.get('/:id', getMovie);
router.post('/', createMovie);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);
router.post('/:id/rent', rentMovie);
router.post('/:id/return', returnMovie);
router.post('/:id/cover', updateCover);
router.get('/:id/cover', getCover);
router.get('/stats/top', getMostRentedMovies);

export default router;