import "dotenv/config"
import app  from "./src/app.js";
import "./src/config/database.js";

const PORT = 3000 ||process.env.PORT

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})