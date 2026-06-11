import express from "express";
import dotenv from "dotenv";
import {PORT} from "./constants";
const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.listen(PORT,()=>{
    console.log("Server is running on port 3000");
});
