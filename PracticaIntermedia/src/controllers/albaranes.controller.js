import Proyecto from '../models/proyecto.model.js';
import DeliverNote from '../models/deliverNote.model.js';
import User from '../models/user.model.js';
import Client from '../models/client.model.js';
import { AppError } from '../utils/AppError.js';
import { deliverNoteValidator } from '../validators/deliverNote.validator.js';
import PDFDocument from 'pdfkit';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { generateDeliverNotePDF, uploadPDFToCloud, downloadFromCloud } from '../utils/handlePDF.js';

// POST /api/albaranes
export const createDeliverNote = async (req, res, next) => {
    try {
        const { projectId, description, date, format, material, quantity, unit, hours, workers } = req.body;
        const companyId = req.user.company;
        const userId = req.user._id;

        // Validar que el proyecto existe y pertenece a la compañía del usuario
        const project = await Proyecto.findOne({ 
            _id: projectId,
            company: companyId,
            deleted: false
        });
        if (!project) {
            throw AppError.notFound('Proyecto no encontrado');
        }

        // Crear el albarán
        const newDeliverNote = await DeliverNote.create({
            user: userId,
            company: companyId,
            client: project.client,
            project: projectId,
            description,
            workDate: new Date(date),
            format,
            material,
            quantity,
            unit,
            hours,
            workers
        });
        
        res.status(201).json(newDeliverNote);
    } catch (error) {
        next(error);
    }
};

// GET /api/albaranes
export const getDeliverNotes = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, projectId, dateFrom, dateTo, client, format, signed } = req.query;
        const companyId = req.user.company;

        // Construir filtro base
        const filter = { company: companyId, deleted: false };

        // Aplicar filtros opcionales
        if (projectId) {
            filter.project = projectId;
        }
        if (client) {
            filter.client = client;
        }
        if (format) {
            filter.format = format;
        }
        if (signed) {
            filter.signed = signed === 'true'; // Convertir a booleano
        }

        // Filtro por rango de fechas
        if (dateFrom || dateTo) {
            filter.workDate = {};
            if (dateFrom) {
                filter.workDate.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                filter.workDate.$lte = new Date(dateTo);
            }
        }

        // Calcular skip para paginación
        const skip = (Number(page) - 1) * Number(limit);

        // Consultar albaranes con paginación
        const [deliverNotes, total] = await Promise.all([
            DeliverNote.find(filter)
                .populate('client project')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            DeliverNote.countDocuments(filter)
        ]);

        res.json({
            data: deliverNotes,
            pagination: {
                currentPage: Number(page),
                limit: Number(limit),
                totalItems: total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/albaranes/:id
export const getDeliverNoteById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const companyId = req.user.company;
        
        const deliverNote = await DeliverNote.findOne({ _id: id, company: companyId })
            .populate(['client', 'project', 'user']);
        
        if (!deliverNote) {
            throw AppError.notFound('Albarán no encontrado');
        }
        
        res.json(deliverNote);
    } catch (error) {
        next(error);
    }
};

//GET /api/albaranes/pdf/:id
export const getDeliverNotePDF = async (req, res, next) => {
    try {
        const { id } = req.params;
        const companyId = req.user.company;
        const userId = req.user._id;

        // Validar que el albarán existe y pertenece a la compañía del usuario
        const deliverNote = await DeliverNote.findOne({ _id: id, company: companyId })
            .populate('client')
            .populate('project')
            .populate('user', 'name lastName email phone');

        if (!deliverNote) {
            throw AppError.notFound('Albarán no encontrado');
        }

        // Verificar permisos: solo el usuario que creó el albarán o un guest de la compañía
        if (deliverNote.user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
            throw AppError.forbidden('No tienes permisos para descargar este albarán');
        }

        // Si el albarán está firmado y tiene URL en la nube, descargarlo desde allí
        if (deliverNote.signed && deliverNote.pdfUrl) {
            try {
                const response = await axios.get(deliverNote.pdfUrl, { 
                    responseType: 'arraybuffer' 
                });
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="albarán_${deliverNote._id}.pdf"`);
                res.send(response.data);
                return;
            } catch (error) {
                console.error('Error descargando PDF de la nube:', error);
                // Si falla, generar nuevo PDF
            }
        }

        // Generar PDF en memoria
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            bufferPages: true
        });

        // Headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="albarán_${deliverNote._id}.pdf"`);

        doc.pipe(res);

        // Configurar estilos
        const titleFont = 16;
        const headingFont = 12;
        const bodyFont = 10;

        // Título
        doc.fontSize(titleFont)
            .font('Helvetica-Bold')
            .text('ALBARÁN DE ENTREGA', { align: 'center' })
            .moveDown(0.5);

        // Información general
        doc.fontSize(bodyFont)
            .font('Helvetica')
            .text(`Albarán Nº: ${deliverNote._id}`, 50, 100)
            .text(`Fecha: ${deliverNote.workDate.toLocaleDateString('es-ES')}`, 50, 120)
            .text(`Estado: ${deliverNote.signed ? 'FIRMADO' : 'SIN FIRMAR'}`, 50, 140)
            .moveDown(1);

        // Sección: Datos de la Empresa
        doc.fontSize(headingFont)
            .font('Helvetica-Bold')
            .text('EMPRESA', 50, 170)
            .fontSize(bodyFont)
            .font('Helvetica')
            .text(`Nombre: ${deliverNote.user.name} ${deliverNote.user.lastName}`, 50, 190)
            .text(`Email: ${deliverNote.user.email}`, 50, 205)
            .text(`Teléfono: ${deliverNote.user.phone || 'N/A'}`, 50, 220)
            .moveDown(1);

        // Sección: Datos del Cliente
        doc.fontSize(headingFont)
            .font('Helvetica-Bold')
            .text('CLIENTE', 50, 250)
            .fontSize(bodyFont)
            .font('Helvetica')
            .text(`Nombre: ${deliverNote.client.name}`, 50, 270)
            .text(`CIF: ${deliverNote.client.cif}`, 50, 285)
            .text(`Email: ${deliverNote.client.email || 'N/A'}`, 50, 300)
            .text(`Teléfono: ${deliverNote.client.phone || 'N/A'}`, 50, 315)
            .moveDown(1);

        // Sección: Datos del Proyecto
        if (deliverNote.project) {
            doc.fontSize(headingFont)
                .font('Helvetica-Bold')
                .text('PROYECTO', 50, 345)
                .fontSize(bodyFont)
                .font('Helvetica')
                .text(`Nombre: ${deliverNote.project.name}`, 50, 365)
                .text(`Código: ${deliverNote.project.projectCode}`, 50, 380)
                .text(`Descripción: ${deliverNote.project.description || 'N/A'}`, 50, 395, { width: 500 })
                .moveDown(1);
        }

        // Sección: Detalles del Albarán
        doc.fontSize(headingFont)
            .font('Helvetica-Bold')
            .text('DETALLES DEL ALBARÁN', 50, 450)
            .fontSize(bodyFont)
            .font('Helvetica')
            .text(`Descripción: ${deliverNote.description || 'N/A'}`, 50, 470, { width: 500 });

        // Mostrar detalles según el formato
        if (deliverNote.format === 'material') {
            doc.text(`Material: ${deliverNote.material || 'N/A'}`, 50, 495)
                .text(`Cantidad: ${deliverNote.quantity || 'N/A'} ${deliverNote.unit || ''}`, 50, 510);
        } else if (deliverNote.format === 'hours') {
            doc.text(`Horas totales: ${deliverNote.hours || 'N/A'}`, 50, 495);
            
            if (deliverNote.workers && deliverNote.workers.length > 0) {
                doc.text('Trabajadores:', 50, 515);
                let yPos = 530;
                deliverNote.workers.forEach(worker => {
                    doc.text(`  - ${worker.name}: ${worker.hours} horas`, 60, yPos);
                    yPos += 15;
                });
            }
        }

        // Sección: Firma
        if (deliverNote.signed) {
            doc.moveDown(2)
                .fontSize(headingFont)
                .font('Helvetica-Bold')
                .text('FIRMA', 50, null)
                .text(`Firmado en: ${deliverNote.signedAt?.toLocaleDateString('es-ES') || 'N/A'}`, 50, null);

            // Si tiene URL de firma, intentar mostrarla
            if (deliverNote.signatureUrl) {
                try {
                    doc.text('Imagen de firma adjunta', 50, null);
                } catch (error) {
                    console.error('Error agregando imagen de firma:', error);
                }
            }
        }

        // Pie de página
        doc.fontSize(bodyFont)
            .font('Helvetica')
            .text('_______________________________________________________________', 50, null)
            .text('Este documento ha sido generado electrónicamente y tiene validez legal.', 50, null, { align: 'center' });

        // Finalizar documento
        doc.end();

    } catch (error) {
        next(error);
    }
};

// PATCH /api/deliverynote/:id/sign - Firmar albarán
export const signDeliverNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const companyId = req.user.company;

        // Validar que se cargó archivo de firma
        if (!req.file) {
            throw AppError.badRequest('Archivo de firma no cargado');
        }

        // Buscar el albarán con datos poblados
        const deliverNote = await DeliverNote.findOne({ 
            _id: id, 
            company: companyId,
            user: userId 
        }).populate(['client', 'project', 'user']);

        if (!deliverNote) {
            throw AppError.notFound('Albarán no encontrado');
        }

        // Verificar que no esté ya firmado
        if (deliverNote.signed) {
            throw AppError.badRequest('Este albarán ya está firmado y no puede modificarse');
        }

        // TODO: Subir imagen de firma a Cloudinary o Cloudflare R2
        // Aquí iría la lógica de subida a la nube
        // const signatureUrl = await uploadToCloudinary(req.file);
        // Por ahora usamos la ruta local
        const signatureUrl = `/uploads/${req.file.filename}`;

        // Actualizar albarán con datos de firma
        deliverNote.signed = true;
        deliverNote.signedAt = new Date();
        deliverNote.signatureUrl = signatureUrl;

        // Generar PDF firmado
        try {
            const pdfBuffer = await generateDeliverNotePDF(deliverNote);
            
            // TODO: Subir PDF a la nube
            // const pdfUrl = await uploadPDFToCloud(pdfBuffer, `albarán_${deliverNote._id}.pdf`);
            // deliverNote.pdfUrl = pdfUrl;
            
            // Por ahora no se sube a la nube, se genera bajo demanda
        } catch (pdfError) {
            console.error('Error generando PDF:', pdfError);
            // No es crítico si falla la generación del PDF en este punto
        }

        await deliverNote.save();

        res.json({
            message: 'Albarán firmado correctamente',
            data: deliverNote
        });
    } catch (error) {
        // Eliminar archivo cargado si hay error
        if (req.file) {
            const filePath = path.join(
                path.dirname(new URL(import.meta.url).pathname),
                '../../uploads',
                req.file.filename
            );
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        next(error);
    }
};

// DELETE /api/deliverynote/:id - Borrar albarán (solo si no está firmado)
export const deleteDeliverNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { hard = false } = req.query;
        const userId = req.user._id;
        const companyId = req.user.company;

        // Buscar el albarán
        const deliverNote = await DeliverNote.findOne({ 
            _id: id, 
            company: companyId,
            user: userId 
        });

        if (!deliverNote) {
            throw AppError.notFound('Albarán no encontrado');
        }

        // Verificar que no esté firmado
        if (deliverNote.signed) {
            throw AppError.badRequest('No se puede borrar un albarán firmado');
        }

        // Eliminar archivos asociados si existen
        if (deliverNote.signatureUrl && deliverNote.signatureUrl.startsWith('/uploads/')) {
            const filePath = path.join(
                path.dirname(new URL(import.meta.url).pathname),
                '../../',
                deliverNote.signatureUrl
            );
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Realizar el borrado
        if (hard === 'true') {
            // Hard delete: eliminar completamente
            await DeliverNote.deleteOne({ _id: id });
        } else {
            // Soft delete: marcar como eliminado
            deliverNote.deleted = true;
            await deliverNote.save();
        }

        res.json({
            message: 'Albarán eliminado correctamente',
            type: hard === 'true' ? 'hard_deleted' : 'soft_deleted'
        });
    } catch (error) {
        next(error);
    }
};