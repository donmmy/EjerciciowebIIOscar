import mongoose from 'mongoose';

const userSchema = new mongoose.userSchema({
  name: String,            // Requerido, mín 2 chars
  email: String,           // Requerido, único, formato email
  password: String,        // Requerido, mín 8 chars (guardar hasheado)
  role: String,            // Enum: ['user', 'admin'], default: 'user'
  createdAt: Date          // timestamps: true
})
/*const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    age: {
      type: Number
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model('User', userSchema);   */
