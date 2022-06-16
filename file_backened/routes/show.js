const router = require('express').Router();
const File= require("../models/filemodel")

router.get("/:uuid", async(req,res)=>{
   
    try{

        const file= await File.findOne({uuid: req.params.uuid});
        if(!file)
            return res.render('download', {error: "This link has been expired."});

        return res.render('download', {
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadlink: `${process.env.APP_BASE_URL}/files/downloads/${file.uuid}`
        });

    }catch(err){
        return res.render('download', {error: "Something went wrong try again."});
    }
});

router.get("/downloads/:uuid", async(req,res)=>{

    const file= await File.findOne({uuid: req.params.uuid});
    if(!file)
        return res.render('download', {error: "This link has been expired."});

        const response = await file.save();
        const filePath = `${__dirname}/../${file.path}`;
        res.download(filePath,()=>{
            console.log(filePath);
        });
});

module.exports = router;