/*
{
  user: ObjectId,          // ref: 'User' — usuario que crea
  company: ObjectId,       // ref: 'Company' — compañía a la que pertenece
  client: ObjectId,        // ref: 'Client'
  project: ObjectId,       // ref: 'Project'
  format: 'material' | 'hours',  // Tipo de albarán
  description: String,
  workDate: Date,          // Fecha del trabajo
  // Para format: 'material'
  material: String,
  quantity: Number,
  unit: String,
  // Para format: 'hours'
  hours: Number,
  workers: [{              // Múltiples trabajadores (opcional)
    name: String,
    hours: Number
  }],
  // Firma
  signed: Boolean,
  signedAt: Date,
  signatureUrl: String,    // URL de la imagen de firma (Cloudinary/R2)
  pdfUrl: String,          // URL del PDF firmado en la nube
  deleted: Boolean,        // Soft delete
  createdAt: Date,
  updatedAt: Date
}
 */
import mongoose from "mongoose";
import { softDeletePlugin } from "../plugins/softDelete.plugin.js";

const deliverNoteSchema = new mongoose.Schema(
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
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project"
        },
        format: {
            type: String,
            enum: ['material', 'hours']
        },
        description:{
            type: String,
            trim: true,
            maxlength: 500
        },
        workDate: {
            type: Date,
            required: true
        },
        // Para format: 'material'
        material: {
            type: String,
            trim: true
        },
        quantity: {
            type: Number,
            min: 0
        },
        unit: {
            type: String,
            trim: true
        },
        // Para format: 'hours'
        hours: {
            type: Number,
            min: 0
        },
        workers: [{
            name: {
                type: String,
                trim: true
            },
            hours: {
                type: Number,
                min: 0
            }
        }],
        // Firma
        signed: {
            type: Boolean,
            default: false
        },
        signedAt: {
            type: Date
        },
        signatureUrl: String,    // URL de la imagen de firma (Cloudinary/R2)
        pdfUrl: String,          // URL del PDF firmado en la nube
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

deliverNoteSchema.plugin(softDeletePlugin);

export default mongoose.model("DeliverNote", deliverNoteSchema);