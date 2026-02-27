import Movie from "../models/movie.model.js";

export const getMovies = async (req, res) => {
   const{
    page = 1,
    limit = 10,
    title,
    director,
    genre,
    year,
    availableCopies,
    timesRented,
    cover,
    sortBy = 'createdAt',
    order = 'desc'
   } = req.query;

   const filter = {};
   if (title) filter.title = title;
   if (director) filter.director = director;
   if (genre) filter.genre = genre;
   if (year) filter.year = year;
   if (availableCopies) filter.availableCopies = availableCopies;
   if (timesRented) filter.timesRented = timesRented;
   if (cover) filter.cover = cover;

   const sort = {};
   sort[sortBy] = order === 'asc' ? 1 : -1;

   const skip = (Number(page) - 1) * Number(limit);

   const [movies, total] = await Promise.all([
    Movie.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort(sort),
    Movie.countDocuments(filter)
   ]);
    
    res.json(movies);
}

export const getMovie = async (req, res) => {
    const movies = await Movie.find(req.params.id);
    if (!movies) {
        return res.status(404).json({ message: 'No se encontraron películas' });
    }
    res.json(movies);
}

export const createMovie = async (req, res) => {
    const movie = await Movie.create(req.body);
    res.status(201).json({data:movie});
}

export const updateMovie = async (req, res) => {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) {
        return res.status(404).json({ message: 'No se encontraron películas' });
    }
    if(movie.cover){
        const storage = await Storage.findOne({ filename: movie.cover });
        if (storage) {
            await Storage.findByIdAndDelete(storage._id);
        }
    }
    res.json({data:movie});
}

export const deleteMovie = async (req, res) => {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
        return res.status(404).json({ message: 'No se encontraron películas' });
    }
    res.json({data:movie});
}

export const rentMovie = async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
        return res.status(404).json({ message: 'No se encontraron películas' });
    }
    if (movie.availableCopies === 0) {
        return res.status(400).json({ message: 'No hay copias disponibles' });
    }
    movie.availableCopies--;
    movie.timesRented++;
    await movie.save();

    res.json({data:movie});
}

export const returnMovie = async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
        return res.status(404).json({ message: 'No se encontraron películas' });
    }
    if (movie.availableCopies === movie.copies) {
        return res.status(400).json({ message: 'No hay copias para devolver' });
    }
    movie.availableCopies++;
    movie.timesRented=0;
    await movie.save();
    res.json({data:movie});
}

export const updateCover = async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
        return res.status(404).json({ message: 'No se encontraron películas' });
    }
    movie.cover = req.file.filename;
    await movie.save();
    res.json({data:movie});
}

export const getCover = async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
        return res.status(404).json({ message: 'No se encontraron películas' });
    }
    res.json({data:movie});
}

export const getMostRentedMovies = async (req, res) => {
    const movies = await Movie.find().sort({ timesRented: -1 }).limit(5);
    res.json(movies);
}
