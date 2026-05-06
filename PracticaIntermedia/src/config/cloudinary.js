import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

(async function () {

  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
  });

  // Upload an image
  const uploadResult = await cloudinary.uploader
    .upload(
      '../../uploads/bombillaIdea.png', {
      public_id: 'bombillaIdea',
    }
    )
    .catch((error) => {
      console.log(error);
    });

  console.log(uploadResult);

  // Optimize delivery by resizing and applying auto-format and auto-quality
  const optimizeUrl = cloudinary.url('bombillaIdea', {
    fetch_format: 'auto',
    quality: 'auto'
  });

  console.log(optimizeUrl);

  // Transform the image: auto-crop to square aspect_ratio
  const autoCropUrl = cloudinary.url('bombillaIdea', {
    crop: 'auto',
    gravity: 'auto',
    width: 200,
    height: 200,
  });

  console.log(autoCropUrl);
})();
