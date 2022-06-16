const nodemailer= require("nodemailer")

async function sendMail({ from, to, subject, text, html}){
    let transporter= nodemailer.createTransport({
    service: 'gmail',
        
        auth:{
            user: process.env.USER,
            pass: process.env.PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
          }
    });

    let info= transporter.sendMail({
        from: from,
        to: to,
        subject: subject,
        text: text,
        html: html
    });
};

module.exports= sendMail;
