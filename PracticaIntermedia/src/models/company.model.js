/*
{
  owner: ObjectId,           // ref: 'User' — admin que creó la compañía
  name: String,              // Nombre de la empresa
  cif: String,               // CIF de la empresa
  address: {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
  },
  logo: String,              // URL del logo (imagen subida con Multer)
  isFreelance: Boolean,      // true si es autónomo (1 sola persona)
  deleted: Boolean,          // Soft delete
  createdAt: Date,
  updatedAt: Date
}
 */

import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },           // ref: 'User' — admin que creó la compañía
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },              // Nombre de la empresa
        cif: {
            type: String,
            required: true,
            trim: true,
            minlength: 8,
            maxlength: 12
        },               // CIF de la empresa
        address: {
            street: String,
            number: String,
            postal: String,
            city: String,
            province: String
        },
        logo: {
            type: String,
            trim: true,
            URL: true
        },              // URL del logo (imagen subida con Multer)
        isFreelance: {
            type: Boolean,
            default: false
        },      // true si es autónomo (1 sola persona)
        deleted: {
            type: Boolean,
            default: false
        },          // Soft delete
        createdAt: Date,
        updatedAt: Date
    },
    {
        timestamps: true
    }
)

export default mongoose.model('Company', companySchema);