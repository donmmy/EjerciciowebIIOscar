import sharp from 'sharp';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * Optimiza una imagen con Sharp y la sube a Cloudinary
 * @param {Buffer} buffer - Buffer de la imagen original
 * @param {Object} options - Opciones de optimización (width, format)
 * @returns {Promise<Object>} - Resultado de la subida a Cloudinary
 */
export const uploadToCloudinary = async (buffer, { width = 800, folder = 'signatures' } = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Optimizar con Sharp
      const optimizedBuffer = await sharp(buffer)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      // Subir a Cloudinary usando stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(optimizedBuffer).pipe(uploadStream);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Sube un buffer (ej. PDF) directamente a Cloudinary
 * @param {Buffer} buffer - Buffer del archivo
 * @param {Object} options - Opciones de subida
 * @returns {Promise<Object>} - Resultado de la subida
 */
export const uploadFileToCloudinary = async (buffer, { folder = 'documents', filename } = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
        public_id: filename
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
