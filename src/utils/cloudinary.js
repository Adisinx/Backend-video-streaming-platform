import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// IIFE (Immediately Invoked Function Expression)
(async function() {
    
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

})();

    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if (!localFilePath) return null;

            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto"
            });

            console.log("File is uploaded to Cloudinary:", response.url);
            // console.log(response);
            // return response;

            fs.unlinkSync(localFilePath);
            return response;

        } catch (error) {
            console.error("Error during upload:", error);
            fs.unlinkSync(localFilePath); // Deletes the local file after failure
            return null;
        }
    }

    // Example usage inside the IIFE
    // await uploadOnCloudinary("path/to/your/file");



// Export the function for external use
export { uploadOnCloudinary };
