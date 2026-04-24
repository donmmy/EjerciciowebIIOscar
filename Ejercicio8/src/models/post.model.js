import mongoose from 'mongoose';

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true
    },
    content: {
      type: String,
      required: true,
      minlength: 10
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    excerpt: {
      type: String,
      maxlength: 500,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    featured: {
      type: String,
      default: ''
    },
    published: {
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Generar slug automáticamente antes de guardar
postSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = generateSlug(this.title);
  }
  next();
});

// Generar slug en findByIdAndUpdate
postSchema.pre('findByIdAndUpdate', function (next) {
  if (this.getUpdate().$set?.title || this.getUpdate().title) {
    const title = this.getUpdate().$set?.title || this.getUpdate().title;
    this.set({ slug: generateSlug(title) });
  }
  next();
});

export default mongoose.model('Post', postSchema);
