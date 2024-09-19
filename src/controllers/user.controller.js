import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler(async(req,res)=>{
   //get user details from frontEnd
   //validation-not empty
   //check if user already exists-email,username
   //upload on cloudinaru-image,video,avatar
   //create user object in database-new entry
   //remove password and refresh token from response
   //check for user creation
   //return response
   const {username,fullName,email,avatar}=req.body;
   console.log("username:",username);
   console.log("email:",email);

//    if(fullName==="")
//    {
//     throw new ApiError(400,"fullname is required!")
//    }

      if([username,fullName,email,avatar].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required!")
      }

      const existedUser = User.findOne({
        $or: [{ username }, { email }]
      });
      
    if(existedUser){
        throw new ApiError(320,"user already exists!! please login")
    }

    const avatarLocalPath=req.files?.avatar[0].path;
    const coverImageLocalPath=req.files?.coverImage[0].path;

    if(!avatarLocalPath)
    {
        throw new ApiError(402,"avatar file is missing!");
    }

    const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUrl=await uploadOnCloudinary(coverImageLocalPath);

    if(!avatarUrl){
        throw new ApiError(400,"avatar file is required");
    }

    const user=await User.create({
        fullName,
        avatar:avatarUrl.url,
        coverImage:coverImageUrl.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshTokem"
    )
    if(!createdUser)
    {
        throw new ApiError(410,"something went wrong while registering the user!")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )






    })

   


export {registerUser}