import PDFDocument from 'pdfkit';
import axios from 'axios';

/**
 * Genera un PDF de albarán y devuelve el buffer
 * @param {Object} deliverNote - Documento albarán con datos poblados
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
export const generateDeliverNotePDF = async (deliverNote) => {
    // Intentar obtener el logo de la compañía
    let logoBuffer = null;
    if (deliverNote.user.company && deliverNote.user.company.logo) {
        try {
            const response = await axios.get(deliverNote.user.company.logo, { responseType: 'arraybuffer' });
            logoBuffer = Buffer.from(response.data);
        } catch (err) {
            console.error('Error obteniendo logo para PDF:', err.message);
        }
    }

    // Intentar obtener la firma si está firmado
    let signatureBuffer = null;
    if (deliverNote.signed && deliverNote.signatureUrl) {
        try {
            const response = await axios.get(deliverNote.signatureUrl, { responseType: 'arraybuffer' });
            signatureBuffer = Buffer.from(response.data);
        } catch (err) {
            console.error('Error obteniendo firma para PDF:', err.message);
        }
    }

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            bufferPages: true
        });

        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // --- ENCABEZADO ---
        // Logo si existe
        if (logoBuffer) {
            try {
                doc.image(logoBuffer, 50, 45, { width: 60 });
            } catch (e) {
                console.error('Error insertando logo en PDF:', e);
            }
        }

        doc.fontSize(16)
            .font('Helvetica-Bold')
            .text('ALBARÁN DE ENTREGA', { align: 'center' })
            .moveDown(0.5);

        // Información general (ajustar Y si hay logo)
        const startY = 100;
        doc.fontSize(10)
            .font('Helvetica')
            .text(`Albarán Nº: ${deliverNote._id}`, 350, startY)
            .text(`Fecha: ${deliverNote.workDate.toLocaleDateString('es-ES')}`, 350, startY + 15)
            .text(`Estado: ${deliverNote.signed ? 'FIRMADO' : 'SIN FIRMAR'}`, 350, startY + 30)
            .moveDown(1);

        // Sección: Datos de la Empresa
        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('EMPRESA', 50, 170)
            .fontSize(10)
            .font('Helvetica')
            .text(`Nombre: ${deliverNote.user.name} ${deliverNote.user.lastName}`, 50, 190)
            .text(`Email: ${deliverNote.user.email}`, 50, 205)
            .text(`Teléfono: ${deliverNote.user.phone || 'N/A'}`, 50, 220)
            .moveDown(1);

        // Sección: Datos del Cliente
        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('CLIENTE', 50, 250)
            .fontSize(10)
            .font('Helvetica')
            .text(`Nombre: ${deliverNote.client.name}`, 50, 270)
            .text(`CIF: ${deliverNote.client.cif}`, 50, 285)
            .text(`Email: ${deliverNote.client.email || 'N/A'}`, 50, 300)
            .text(`Teléfono: ${deliverNote.client.phone || 'N/A'}`, 50, 315)
            .moveDown(1);

        // Sección: Datos del Proyecto
        if (deliverNote.project) {
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text('PROYECTO', 50, 345)
                .fontSize(10)
                .font('Helvetica')
                .text(`Nombre: ${deliverNote.project.name}`, 50, 365)
                .text(`Código: ${deliverNote.project.projectCode}`, 50, 380)
                .text(`Descripción: ${deliverNote.project.description || 'N/A'}`, 50, 395, { width: 500 })
                .moveDown(1);
        }

        // Sección: Detalles del Albarán
        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('DETALLES DEL ALBARÁN', 50, 450)
            .fontSize(10)
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
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('FIRMA', 50)
                .fontSize(10)
                .font('Helvetica')
                .text(`Firmado en: ${deliverNote.signedAt?.toLocaleDateString('es-ES') || 'N/A'}`, 50);

            if (signatureBuffer) {
                try {
                    doc.image(signatureBuffer, 50, doc.y + 10, { width: 150 });
                } catch (e) {
                    console.error('Error insertando firma en PDF:', e);
                }
            }
        }

        // Pie de página
        doc.fontSize(8)
            .font('Helvetica')
            .text('_______________________________________________________________', 50, 750)
            .text('Este documento ha sido generado electrónicamente y tiene validez legal.', 50, 765, { align: 'center' });

        doc.end();
    });
};

/**
 * Sube un PDF a la nube (Cloudinary o Cloudflare R2)
 * @param {Buffer} pdfBuffer - Buffer del PDF a subir
 * @param {String} fileName - Nombre del archivo
 * @returns {Promise<String>} - URL del archivo en la nube
 */
export const uploadPDFToCloud = async (pdfBuffer, fileName) => {
    // TODO: Implementar lógica de subida a Cloudinary o Cloudflare R2
    // Ejemplo con Cloudinary:
    // const formData = new FormData();
    // formData.append('file', new Blob([pdfBuffer]), fileName);
    // formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
    // 
    // const response = await axios.post(
    //     `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/upload`,
    //     formData
    // );
    // return response.data.secure_url;

    console.warn('uploadPDFToCloud: Función no implementada. Usar URL local por ahora.');
    return `/uploads/${fileName}`;
};

/**
 * Descarga un archivo desde una URL en la nube
 * @param {String} url - URL del archivo
 * @returns {Promise<Buffer>} - Buffer del archivo
 */
export const downloadFromCloud = async (url) => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return response.data;
};

export default {
    generateDeliverNotePDF,
    uploadPDFToCloud,
    downloadFromCloud
};
