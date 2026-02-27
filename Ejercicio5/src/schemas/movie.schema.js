export const movieSchema = {
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 200
    },
    director: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 200
    },
    year: {
        type: Number,
        required: true,
        min: 1888,
        max: new Date().getFullYear()
    },
    genre: {
        type: String,
        required: true,
        enum: ['action', 'comedy', 'drama', 'horror', 'scifi']
    },
    copies: {
        type: Number,
        required: true,
        min: 1,
        default: 5
    },
    availableCopies: {
        type: Number,
        required: true,
        min: 0,
        default: 5
    },
    timesRented: {
        type: Number,
        required: true,
        default: 0
    },
    cover: {
        type: String,
        default: null
    }
}