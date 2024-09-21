import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"

const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            index:true,   //for searching its useful
            trim:true
        },
        email:{
            
            type:String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true,
            
        },
        fullName:{
            type:String,
            required:true,
            index:true, 
            trim:true
        },
        avatar:{
            type:String,
            required:true,
        },
        coverImage:{
            type:String,
        },
        watchHistory:[{
            type:Schema.Types.ObjectId,
            ref:"Video",
        }],
        password:{
            type:String,
            required:[true,"password is required"]
        },
        refreshToken:{
            type:String,
        }


    },{
        timestamps:true,
    }
)

userSchema.pre("save",async function (next) {
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10);
    next();

    }
    else{
        return next();
    }
    
    
})

userSchema.methods.isPasswordCorrect=async function(password)
{
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken=function()
{
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullNam:this.fullName
    
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }

    )
   

}
userSchema.methods.generateRefreshToken=function()
{
    return jwt.sign(
        {
            _id:this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}



export const User=mongoose.model("User",userSchema)