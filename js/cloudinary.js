/**
 * Cloudinary CDN File & PDF Upload Engine with Auto-Compression & Base64 Fallback
 * Cloud Name: ku9okwip
 * Upload Preset: room107
 */

const CLOUDINARY_CONFIG = {
  cloudName: 'ku9okwip',
  uploadPreset: 'room107',
  uploadUrl: 'https://api.cloudinary.com/v1_1/ku9okwip/auto/upload'
};

/**
 * Auto Compress / Resize image file using HTML5 Canvas (High Quality, Low File Size)
 * Shrinks 5-15MB phone photos down to ~150-300KB with sharp readability
 * @param {File} file - Original image file from camera/file input
 * @param {number} maxWidth - Maximum width (default 1600px)
 * @param {number} maxHeight - Maximum height (default 1600px)
 * @param {number} quality - JPEG quality 0.0 - 1.0 (default 0.82)
 * @returns {Promise<File>} Compressed File object
 */
async function compressImageFile(file, maxWidth = 1600, maxHeight = 1600, quality = 0.82) {
  // If not an image (e.g. PDF), return original file without compression
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Proportional aspect ratio scaling
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Clean white background for transparency conversion to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const cleanName = (file.name || 'image').replace(/\.[^/.]+$/, "") + ".jpg";
              const compressedFile = new File([blob], cleanName, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              console.log(`Auto Image Compressed: ${(file.size / 1024).toFixed(1)} KB -> ${(blob.size / 1024).toFixed(1)} KB (Saved ${Math.round((1 - blob.size / file.size) * 100)}%)`);
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image or PDF file to Cloudinary with auto-compression and Base64 Data URL fallback
 * @param {File} file - File from input / camera
 * @returns {Promise<string>} Cloudinary URL or Base64 String
 */
async function uploadImageFile(file) {
  if (!file) return null;

  try {
    // Step 1: Auto compress image if it's a photo/image
    let uploadPayload = file;
    if (file.type && file.type.startsWith('image/')) {
      uploadPayload = await compressImageFile(file, 1600, 1600, 0.82);
    }

    // Step 2: Upload to Cloudinary CDN
    const formData = new FormData();
    formData.append('file', uploadPayload);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    const response = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Cloudinary upload success:', data.secure_url);
      
      let finalUrl = data.secure_url;
      // If it's a PDF and URL doesn't have .pdf extension, ensure extension
      if ((file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) && !finalUrl.toLowerCase().endsWith('.pdf')) {
        if (data.format === 'pdf') {
          finalUrl = `${finalUrl}.pdf`;
        }
      }
      return finalUrl;
    } else {
      console.warn('Cloudinary upload returned non-200 status, converting to Base64 fallback...', response.statusText);
      return await convertFileToBase64(uploadPayload);
    }
  } catch (err) {
    console.warn('Cloudinary upload failed (network/CORS), falling back to Base64 Data URL:', err);
    return await convertFileToBase64(file);
  }
}

/**
 * Convert file to Base64 Data URL fallback
 * @param {File} file 
 * @returns {Promise<string>}
 */
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

