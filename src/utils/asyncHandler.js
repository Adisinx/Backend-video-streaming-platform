const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((error)=>next(error))
    }
}
export {asyncHandler};


// const asyncHandler1=()=>{}
// const asyncHandler2=(fn)=>{()=>{}}
// const asyncHandler3=(func)=>async()=>{}


// const asyncHandler=()=>async(req,res,next)=>{
//     try{
//         await func(req,res,next);
//     }
//     catch(error)
//     {
//         req.status(err.code||500).json({
//             success:false,
//             message:err.message,
//         })
//     }
// }