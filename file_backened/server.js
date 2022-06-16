require('dotenv').config();
const express= require("express");
const app= express();
const path= require("path");
const cors= require('cors');

const PORT= 4000;

const connectDB= require("./config/db");
connectDB();

app.use(cors());

app.use(express.json());
app.use(express.static("public"))
app.set("views", path.join(__dirname,"/views"));
app.set("view engine", "ejs");

app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));

app.listen(PORT, ()=>{
    console.log(`SERVER RUNNING ON PORT: http://localhost:${PORT}`);
});
