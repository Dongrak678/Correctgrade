/**
 * ระบบติดตามแก้ไขผลการเรียน (Academic Remediation System)
 * cloudinary-service.js - อัปโหลดไฟล์รูปภาพขึ้น Cloudinary CDN & จัดการระบบ Lightbox Preview
 */

class CloudinaryService {
  constructor() {
    this.cloudName = APP_CONFIG.CLOUDINARY.CLOUD_NAME;
    this.uploadPreset = APP_CONFIG.CLOUDINARY.UPLOAD_PRESET;
    this.uploadUrl = APP_CONFIG.CLOUDINARY.UPLOAD_URL;
  }

  /**
   * อัปโหลดไฟล์รูปภาพไปยัง Cloudinary (Unsigned Preset)
   * พร้อมระบบบีบอัดภาพอัตโนมัติก่อนส่ง (Client-Side Compression)
   * @param {File} file - ไฟล์รูปภาพจาก input[type=file]
   * @param {Function} onProgress - Callback แสดงเปอร์เซ็นต์ความคืบหน้า (0-100)
   * @returns {Promise<string>} URL ของรูปภาพบน CDN
   */
  async uploadImage(file, onProgress = null) {
    if (!file) throw new Error("ไม่พบไฟล์รูปภาพที่ต้องการอัปโหลด");

    // ตรวจสอบชนิดไฟล์ (อนุญาตเฉพาะรูปภาพ)
    if (!file.type.startsWith('image/')) {
      throw new Error("กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPEG, PNG, WEBP, GIF)");
    }

    // บีบอัดและปรับสัดส่วนภาพอัตโนมัติก่อนอัปโหลด เพื่อให้เร็วและประหยัดพื้นที่คลาวด์สูงสุด
    const optimizedFile = await this.compressImageClientSide(file);

    const formData = new FormData();
    formData.append('file', optimizedFile);
    formData.append('upload_preset', this.uploadPreset);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.uploadUrl, true);

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            const secureUrl = response.secure_url || response.url;
            console.log("☁️ อัปโหลดขึ้น Cloudinary สำเร็จ:", secureUrl);
            resolve(secureUrl);
          } catch (err) {
            reject(new Error("เกิดข้อผิดพลาดในการประมวลผลข้อมูลตอบกลับจาก Cloudinary"));
          }
        } else {
          console.warn("Cloudinary upload failed with status:", xhr.status, xhr.responseText);
          // Fallback เป็น Data URL (Base64) ในกรณีฉุกเฉินเพื่อให้ผู้ใช้ยังทำงานต่อได้
          this.convertToBase64(file).then(base64Url => {
            console.log("🔄 ใช้งาน Base64 Fallback สำเร็จ");
            resolve(base64Url);
          }).catch(reject);
        }
      };

      xhr.onerror = () => {
        console.warn("Network error during Cloudinary upload, falling back to Base64");
        this.convertToBase64(file).then(base64Url => {
          resolve(base64Url);
        }).catch(reject);
      };

      xhr.send(formData);
    });
  }

  /**
   * ย่อขนาดและบีบอัดไฟล์รูปภาพในฝั่งเบราว์เซอร์อัตโนมัติ (Client-Side Smart Compression)
   * ปรับขนาดความกว้าง/สูงไม่เกิน 1600px และคุณภาพ 0.82 ช่วยลดขนาดไฟล์ลง 80-90% ก่อนส่งขึ้น Cloud
   * @param {File} file
   * @param {number} maxWidth
   * @param {number} maxHeight
   * @param {number} quality
   * @returns {Promise<File>}
   */
  compressImageClientSide(file, maxWidth = 1600, maxHeight = 1600, quality = 0.82) {
    return new Promise((resolve) => {
      // ถ้าไม่ใช่รูปทั่วไป เช่น SVG หรือ GIF ให้ข้าม
      if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
        return resolve(file);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // คำนวณสัดส่วนใหม่ถ้าขนาดใหญ่กว่าที่กำหนด
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
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob && blob.size < file.size) {
              console.log(`⚡ บีบอัดรูปภาพสำเร็จ: จาก ${(file.size / 1024 / 1024).toFixed(2)} MB เหลือ ${(blob.size / 1024).toFixed(0)} KB (ประหยัดพื้นที่ ${(100 - (blob.size / file.size) * 100).toFixed(0)}%)`);
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' });
              resolve(newFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality);
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  }

  /**
   * แปลงไฟล์เป็น Base64 Data URL (Offline Fallback)
   */
  convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * เปิดหน้าต่าง Lightbox เพื่อดูรูปภาพขนาดเต็มแบบซูมได้
   * @param {string} imageUrl - ลิงก์รูปภาพ
   * @param {string} title - ชื่อหรือหัวข้อรูปภาพ
   */
  previewImage(imageUrl, title = "รูปภาพหลักฐาน") {
    if (!imageUrl) return;

    let lightbox = document.getElementById('image-lightbox-modal');
    if (!lightbox) {
      // สร้าง Lightbox element ถ้ายังไม่มี
      lightbox = document.createElement('div');
      lightbox.id = 'image-lightbox-modal';
      lightbox.className = 'lightbox-modal';
      lightbox.innerHTML = `
        <div class="lightbox-backdrop" onclick="cloudinaryService.closeLightbox()"></div>
        <div class="lightbox-content">
          <div class="lightbox-header">
            <h4 id="lightbox-title">${title}</h4>
            <div class="lightbox-actions">
              <button type="button" class="btn-icon" onclick="cloudinaryService.zoomImage(0.2)" title="ขยายรูป">
                <i class="fas fa-search-plus"></i>
              </button>
              <button type="button" class="btn-icon" onclick="cloudinaryService.zoomImage(-0.2)" title="ย่อรูป">
                <i class="fas fa-search-minus"></i>
              </button>
              <button type="button" class="btn-icon" onclick="cloudinaryService.resetZoom()" title="ขนาดปกติ">
                <i class="fas fa-compress"></i>
              </button>
              <a id="lightbox-download" href="${imageUrl}" target="_blank" download class="btn-icon" title="เปิดรูปภาพแท็บใหม่">
                <i class="fas fa-external-link-alt"></i>
              </a>
              <button type="button" class="btn-icon btn-close-lightbox" onclick="cloudinaryService.closeLightbox()" title="ปิด">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="lightbox-body">
            <div class="lightbox-img-wrapper" id="lightbox-img-wrapper">
              <img id="lightbox-img" src="${imageUrl}" alt="Full Preview" />
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(lightbox);
    } else {
      document.getElementById('lightbox-title').innerText = title;
      const img = document.getElementById('lightbox-img');
      img.src = imageUrl;
      document.getElementById('lightbox-download').href = imageUrl;
    }

    this.currentZoom = 1;
    this.updateZoomTransform();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  zoomImage(delta) {
    this.currentZoom = Math.max(0.5, Math.min(3.5, (this.currentZoom || 1) + delta));
    this.updateZoomTransform();
  }

  resetZoom() {
    this.currentZoom = 1;
    this.updateZoomTransform();
  }

  updateZoomTransform() {
    const img = document.getElementById('lightbox-img');
    if (img) {
      img.style.transform = `scale(${this.currentZoom || 1})`;
    }
  }

  closeLightbox() {
    const lightbox = document.getElementById('image-lightbox-modal');
    if (lightbox) {
      lightbox.classList.remove('active');
    }
    document.body.style.overflow = '';
  }
}

// Global Singleton Instance
const cloudinaryService = new CloudinaryService();
