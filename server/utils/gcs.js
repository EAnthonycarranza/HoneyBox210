const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  keyFilename: path.join(__dirname, '..', 'gcs-keyfile.json'),
  projectId: 'velvety-calling-491423-u5',
});

const BUCKET_NAME = 'honey_box_210';
const bucket = storage.bucket(BUCKET_NAME);

/**
 * Upload a file buffer to Google Cloud Storage
 * @param {Buffer} fileBuffer - The file data
 * @param {string} filename - Destination filename (e.g., 'gallery/photo-123.jpg')
 * @param {string} mimeType - File MIME type (e.g., 'image/jpeg')
 * @returns {string} Public URL of the uploaded file
 */
const uploadToGCS = async (fileBuffer, filename, mimeType) => {
  const blob = bucket.file(filename);
  const stream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000',
    },
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      console.error('GCS upload error:', err.message);
      reject(err);
    });
    stream.on('finish', () => {
      // Bucket uses uniform access - public access is set at bucket level
      const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;
      resolve(publicUrl);
    });
    stream.end(fileBuffer);
  });
};

/**
 * Upload a base64 image to Google Cloud Storage
 * @param {string} base64Data - Data URL (data:image/jpeg;base64,...)
 * @param {string} folder - Folder prefix (e.g., 'gallery' or 'products')
 * @returns {string} Public URL
 */
const uploadBase64ToGCS = async (base64Data, folder = 'gallery') => {
  const matches = base64Data.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/);
  if (!matches) throw new Error('Invalid image data format.');

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `${folder}/${folder}-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const mimeType = `image/${matches[1]}`;

  return uploadToGCS(buffer, filename, mimeType);
};

/**
 * Delete a file from Google Cloud Storage
 * @param {string} publicUrl - The full public URL of the file
 */
const deleteFromGCS = async (publicUrl) => {
  try {
    const prefix = `https://storage.googleapis.com/${BUCKET_NAME}/`;
    if (!publicUrl.startsWith(prefix)) return; // Not a GCS URL, skip
    const filename = publicUrl.replace(prefix, '');
    await bucket.file(filename).delete();
  } catch (err) {
    console.error('GCS delete error:', err.message);
    // Non-fatal - don't throw
  }
};

module.exports = { uploadToGCS, uploadBase64ToGCS, deleteFromGCS, bucket, BUCKET_NAME };
