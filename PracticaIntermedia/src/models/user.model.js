/*{
  email: String,             // Único (index: unique), validado con Zod
  password: String,          // Cifrada con bcrypt
  name: String,              // Nombre
  lastName: String,          // Apellidos
  nif: String,               // Documento de identidad
  role: 'admin' | 'guest',            // Por defecto: 'admin'
  status: 'pending' | 'verified',     // Estado de verificación del email (index)
  verificationCode: String,  // Código aleatorio de 6 dígitos
  verificationAttempts: Number, // Intentos restantes (máximo 3)
  company: ObjectId,         // ref: 'Company' — se asigna en el onboarding (index)
  address: {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
  },
  deleted: Boolean,          // Soft delete
  createdAt: Date,
  updatedAt: Date
}

// Virtual (no se almacena, se calcula):
// fullName → name + ' ' + lastName*/

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,             // Único (index: unique), validado con Zod
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Email no válido']
        },
        password: {
            type: String,          // Cifrada con bcrypt
            required: true,
            minlength: 8,
            select: false
        },
        name: {
            type: String,              // Nombre
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        lastName: {
            type: String,          // Apellidos
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        nif: {
            type: String,               // Documento de identidad
            required: true,
            trim: true,
            minlength: 8,
            maxlength: 12
        },
        role: {
            type: String,            // Por defecto: 'admin'
            enum: ['admin', 'guest'],
            default: 'admin'
        },
        status: {
            type: String,
            enum: ['pending', 'verified'],
            default: 'pending'
        },
        // Estado de verificación del email (index)
        verificationCode: {
            type: String,  // Código aleatorio de 6 dígitos
            maxlength: 6,
            minlength: 6,
            random: true
        },
        verificationAttempts: {
            type: Number, // Intentos restantes (máximo 3)
            default: 3
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company'
        },         // ref: 'Company' — se asigna en el onboarding (index)
        address: {
            street: String,
            number: String,
            postal: String,
            city: String,
            province: String
        },
        deleted: Boolean,          // Soft delete
        createdAt: Date,
        updatedAt: Date
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }
    }
)

userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ company: 1 });

// Virtual
userSchema.virtual('fullName').get(function() {
    return `${this.name} ${this.lastName}`;
});

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

export default mongoose.model('User', userSchema);