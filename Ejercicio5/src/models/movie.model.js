import mongoose from "mongoose";

const movieSchema = new mongoose.Schema( {
  title: {
    type: String,        // Requerido, mín 2 caracteres
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200
  },
  director: {
    type: String,     // Requerido
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200
  },
  year: {
    type: Number,         // Entre 1888 y año actual
    required: true,
    min: 1888,
    max: new Date().getFullYear()
  },
  genre: {
    type: String,        // Enum: action, comedy, drama, horror, scifi
    required: true,
    enum: ['action', 'comedy', 'drama', 'horror', 'scifi']
  },
  copies: {
    type: Number,       // Total de copias (default: 5)
    required: true,
    min: 1,
    default: 5
  },
  availableCopies: {
    type: Number, // Copias disponibles
    required: true,
    min: 0,
    default: 5
  },
  timesRented: {
    type: Number,  // Contador de alquileres (default: 0)
    required: true,
    default: 0
  },
  cover: {
    type: String,     // Nombre del archivo de carátula (default: null)
    default: null
  }
})

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;