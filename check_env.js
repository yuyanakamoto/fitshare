require('dotenv').config();

console.log('=== Environment Variables Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');

const isValidCloudName = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';
const useCloudinary = process.env.NODE_ENV === 'production' && isValidCloudName;

console.log('=== Cloudinary Status ===');
console.log('Cloud name valid:', isValidCloudName);
console.log('Use Cloudinary:', useCloudinary);

if (!useCloudinary) {
  console.log('=== Why Cloudinary is not enabled ===');
  if (process.env.NODE_ENV !== 'production') {
    console.log('- NODE_ENV is not production');
  }
  if (!isValidCloudName) {
    console.log('- CLOUDINARY_CLOUD_NAME is not set or is placeholder');
  }
}