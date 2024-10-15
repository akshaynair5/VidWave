import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const deleteFromCloudinary = async (fileUrl) => {
    try {
        // Extract publicId from URL (excluding file extension and query params if any)
        const parts = fileUrl.split('/');
        const fileName = parts.pop().split('.')[0];  // Remove extension, e.g. .jpg, .png
        const publicId = parts.length > 1 ? `${parts.pop()}/${fileName}` : fileName;  // Handle subfolders

        // Destroy the image in Cloudinary
        const res = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'auto'  // auto detects type (image, video, etc.)
        });

        return res;  // Return the result of the destroy operation
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        return null;  // Handle error case by returning null
    }
}

export default deleteFromCloudinary;
