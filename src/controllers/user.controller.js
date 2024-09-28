import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";


const generateAccessAndRefreshToken= async(userId)=>{
    try {
        const user=await User.findById(userId);
        console.log(user,"Bhinder");
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        console.log(accessToken,refreshToken);


       
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessToken,refreshToken};
        
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access and refresh tokens")
        
    }
}


const registerUser=asyncHandler(async(req,res)=>{
   //get user details from frontEnd
   //validation-not empty
   //check if user already exists-email,username
   //upload on cloudinaru-image,video,avatar
   //create user object in database-new entry
   //remove password and refresh token from response
   //check for user creation
   //return response
   const {username,password,fullName,email,avatar}=req.body;
   console.log("username:",username);
   console.log("email:",email);
   console.log(req.body);

//    if(fullName==="")
//    {
//     throw new ApiError(400,"fullname is required!")
//    }

      if([username,password,fullName,email,avatar].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required!")
      }

      const existedUser = await User.findOne({
        $or: [{ username }, { email }]
      });
      
    if(existedUser){
        throw new ApiError(320,"user already exists!! please login")
    }

    const avatarLocalPath=req.files?.avatar[0].path;
    //const coverImageLocalPath=req.files?.coverImage[0].path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)
    {
        coverImageLocalPath=req.files.coverImage[0].path;
    }

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
        coverImage:coverImageUrl?.url||"",
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

const loginUser=asyncHandler(async(req,res)=>{
    //req body->data
    //username or email
    //find the user
    //if not return
    //password check
    //if true , generate accessToken and refreshToken
    //send cookie

    const {username,email,password} =req.body;
    console.log(email);

    if(!username && !email)
    {
        throw new ApiError(400,"username or email is required!!");
    }

    //alternate
//    if(!(username || email))
//    {
//     throw new ApiError(401,"username or email is required!!");
//    }
     
     const user=await User.findOne({
        $or:[{username},{email}]

     })

     if(!user)
     {
        throw new ApiError(404,"user does not exist!")
     }
     const isPasswordValid=await user.isPasswordCorrect(password);

     if(!isPasswordValid)
     {
        throw new ApiError(400,"invalid password")

     }

     const {accessToken ,refreshToken}=await generateAccessAndRefreshToken(user._id)

     const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

     const options={
        httpOnly:true,
        secure:true,
     }

     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "User logged In Successfully"
        )
     )




})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1,
            }
        },{
            new:true,
        }
    )

    const options={
        httpOnly:true,
        secure:true,

    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out successfully"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken;

    if(!incomingRefreshToken)
    {
        throw new ApiError(400,"unauthorized request!");

    }

   try {
     const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
 
     const user= await User.findById(decodedToken?._id);
 
     if(!user)
     {
         throw new ApiError(400,"Invalid refresh token!!")
     }
 
     if(incomingRefreshToken!==user?.refreshToken){
         throw new ApiError(401,"refresh token is expired or used!!")
     }
 
     const options={
         httpOnly:true,
         secure:true,
     }
 
     const {accessToken,newRefreshToken}=generateAccessAndRefreshToken(user._id);
 
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json(
         new ApiResponse(
             200,
             {
                 accessToken,
                 refreshToken:newRefreshToken,
                 
             },
             "AcessToken refreshed !!"
         )
     )
   } catch (error) {
    throw new ApiError(401,error?.message||"invalid refresh token!")
    
   }
})




   


export {registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken
}