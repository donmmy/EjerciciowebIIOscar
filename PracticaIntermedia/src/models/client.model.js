/*{
  user: ObjectId,          // ref: 'User' — usuario que lo creó
  company: ObjectId,       // ref: 'Company' — compañía a la que pertenece
  name: String,            // Nombre del cliente
  cif: String,             // CIF/NIF del cliente
  email: String,
  phone: String,
  address: {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
  },
  deleted: Boolean,        // Soft delete
  createdAt: Date,
  updatedAt: Date
}*/

import mongoose from "mongoose";
import { softDeletePlugin } from "../plugins/softDelete.plugin.js";



const clientSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company"
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        cif: {  
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 20
        },
        email: {
            type: String,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Email no válido']
        },
        phone: {
            type: String,
            trim: true,
            match: [/^\+?[0-9\s\-]{7,15}$/, 'Número de teléfono no válido']
        },
        address: {
            street: {
                type: String,
                trim: true,
                minlength: 2,
                maxlength: 100
            },
            number: {
                type: String,
                trim: true,
                minlength: 1,
                maxlength: 10
            },
            postal: {
                type: String,
                trim: true,
                minlength: 5,
                maxlength: 10
            },
            city: {
                type: String,
                trim: true,
                minlength: 2,
                maxlength: 100
            },
            province: {
                type: String,
                trim: true,
                minlength: 2,
                maxlength: 100
            }
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

clientSchema.index({ cif: 1 }, { unique: true });

clientSchema.plugin(softDeletePlugin);

export default mongoose.model("Client", clientSchema);