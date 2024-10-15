import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';    // Helps in file system management (async/ sync)

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadToCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath){
            return null;               // This means that the file is not there in the public/temp folder
        }
        const res = await cloudinary.uploader.upload(localFilePath, {
            resource_type:'auto'
        })
        // console.log(localFilePath)     // public\temp\pic.jpeg
        // Now here res consists of details like - { public_id: 'abc123', version: 123456789, signature: 'xyz123', width: 1000, height: 600, format: 'jpg', resource_type: 'image', created_at: '2021-09-20T10:15:30Z', tags: [], bytes: 123456, type: 'upload', etag: 'abc123', url: 'https://res.cloudinary.com/demo/image/upload/abc123.jpg', secure_url: 'https://res.cloudinary.com/demo/image/upload/abc123.jpg' }
        fs.unlinkSync(localFilePath)
        return res
    }
    catch(err){
        console.log('Error while uploading file to cloudinary',err)
        fs.unlinkSync(localFilePath)   // This will remove the file from the public/temp folder
        return null
    }
}

export default uploadToCloudinary;
