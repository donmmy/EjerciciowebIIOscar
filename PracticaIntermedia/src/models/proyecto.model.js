/*{
  user: ObjectId,          // ref: 'User' — usuario que lo creó
  company: ObjectId,       // ref: 'Company' — compañía a la que pertenece
  client: ObjectId,        // ref: 'Client' — cliente asociado
  name: String,            // Nombre del proyecto
  projectCode: String,     // Código único del proyecto dentro de la compañía
  description: String,     // Descripción del proyecto
  address: {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
  },
  status: 'activo' | 'completado' | 'suspendido', // Estado del proyecto
  budget: Number,          // Presupuesto del proyecto
  startDate: Date,         // Fecha de inicio
  endDate: Date,           // Fecha de finalización estimada
  deleted: Boolean,        // Soft delete
  deletedAt: Date,         // Fecha de eliminación
  deletedBy: String,       // Usuario que eliminó
  createdAt: Date,
  updatedAt: Date
}*/

import mongoose from "mongoose";
import { softDeletePlugin } from "../plugins/softDelete.plugin.js";

const proyectoSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 200
        },
        projectCode: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000
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
        status: {
            type: String,
            enum: ['activo', 'completado', 'suspendido'],
            default: 'activo'
        },
        budget: {
            type: Number,
            min: 0
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
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

// Aplicar el plugin de soft delete
proyectoSchema.plugin(softDeletePlugin);

// Índice compuesto para asegurar unicidad de código dentro de la compañía
proyectoSchema.index({ projectCode: 1, company: 1, deleted: 1 }, { unique: true });

const Proyecto = mongoose.model("Proyecto", proyectoSchema);

export default Proyecto;
