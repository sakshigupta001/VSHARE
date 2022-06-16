const router = require('express').Router();
const { diskStorage } = require('multer');
const multer= require("multer");
const path= require("path");
const File= require("../models/filemodel")
const {v4:uuid4}= require("uuid");

let storage= multer.diskStorage({
    destination: (req,file,cb)=> {
        cb(null,"./uploads")
    },
    filename: (req,file,cb)=>{
        const filename= `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`;
        cb(null,filename);
    }
})

let upload= multer({
    storage: storage,
    limit: {fileSize: 1000000* 2000}
}).single('myfile');

router.post("/", (req,res)=>{

    upload(req,res, async (err)=>{

        if(!req.file){
            return res.json({error: "File not found! Upload again"})
        }

        if (err) {
            return res.status(500).send({ error: err.message });
        }

          const file= new File({
              filename: req.file.filename,
              path: req.file.path,
              size: req.file.size,
              uuid: uuid4()
          });

          const response= await file.save();
          return res.json({file: `${process.env.APP_BASE_URL}/files/${response.uuid}`});
    });
})

router.post("/send", async(req,res)=>{

    const {uuid, emailFrom, emailTo}= req.body;

    if(!uuid || !emailFrom || !emailTo)
    {
        return res.status(422).send({error:"All fields are required"});
    }
try{
    const file= await File.findOne({uuid:uuid});
    
    file.sender= emailFrom;
    file.receiver= emailTo;
    const response= await file.save();

    const sendMail= require("../services/emailService");
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: "File shared with you",
        text: `${emailFrom} shared a file with you.`,
        html: require("../services/emailTemplate")({
            emailFrom: emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size: file.size/1000 + 'KB'
        })
    }).then(() => {
        return res.json({success: true});
      }).catch(err => {
        return res.status(500).json({error: 'Error in email sending.'});
      });
    }catch(err) {
        return res.status(500).send({ error: 'Something went wrong.'});
    }
});

module.exports = router;