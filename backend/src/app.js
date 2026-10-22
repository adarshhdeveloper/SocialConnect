import express from "express"

const app = express()

//health check 
app.get("/health",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"SocialPoster API is running"
    })
})

export default app

