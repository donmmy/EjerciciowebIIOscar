import mongoose from 'mongoose';

const podcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    duration: {
      type: Number,
      required: true
    },
    categories: {
      type: [String],
      default: []
    },
    coverImage: {
      type: String,
      default: ''
    },
    published: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model('Podcast', podcastSchema);
