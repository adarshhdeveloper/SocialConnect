import express from "express"
import instagramRoutes from "./routes/instagram.routes.js"
import session from "express-session";

const app = express()
app.set("trust proxy", 1);

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, 
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    },
  })
);

//health check 
app.get("/health",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"SocialPoster API is running"
    })
})

//instagram routes
app.use("/api/instagram",instagramRoutes)

export default app

