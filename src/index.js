//require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
// import mongoose from "mongoose"
//import { DB_NAME } from "./db/constants.js"
import connectDB from "./db/index.js"
import { app } from "./app.js";

dotenv.config({
    path:'./.env'
})

const porti=process.env.PORT||8000;

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log('CUSTOM error before dbConnect ',error);
        throw error;
    })
    app.listen(porti,()=>{
        console.log(`server is running at port:${porti}`)
    })
})
.catch((err)=>{
    console.error("CUSTOM MONGOOSE CONNECTION ERROR:",err);
});













/*
(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error",(error)=>{
             console.log('application not able to talk to db:',error);
             throw error;

        })
        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port:${process.env.PORT}`)
        })

    }
    catch(error){
        console.error('error found:',error);
        throw error;
    }

})()
    */