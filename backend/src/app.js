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
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

//health check 
app.get("/health",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"SocialConnect API is running"
    })
})


//instagram routes
app.use("/api/instagram",instagramRoutes)

export default app

