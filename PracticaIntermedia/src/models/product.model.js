/*
{
  user: ObjectId,          // ref: 'User' — usuario que lo creó
  company: ObjectId,       // ref: 'Company' — compañía a la que pertenece
  client: ObjectId,        // ref: 'Client' — cliente asociado
  name: String,            // Nombre del proyecto
  projectCode: String,     // Código interno único
  address: {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
  },
  email: String,           // Email de contacto del proyecto
  notes: String,           // Notas adicionales
  active: Boolean,
  deleted: Boolean,        // Soft delete
  createdAt: Date,
  updatedAt: Date
}
*/
import mongoose from "mongoose";
import { softDeletePlugin } from "../plugins/softDelete.plugin";

const productSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company"
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client"
        },
        name: {
            type: String,
            required: true
        },
        projectCode: {
            type: String,
            required: true,
            unique: true
        },
        address: {
            street: String,
            number: String,
            postal: String,
            city: String,
            province: String
        },
        email: {
            type: String,
            required: true
        },
        notes: {
            type: String
        },
        active: {
            type: Boolean,
            default: true
        }
    }
);

productSchema.plugin(softDeletePlugin);

export const Product = mongoose.model("Product", productSchema);