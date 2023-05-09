const nodemailer=require('nodemailer')

const sendEmail= async options=>{
    // create a transporter

    const transporter=nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,

        service:'Gmail',
        
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
        
        //service:'SendPulse',

        // activate in gmail "less secure app option "
    })

    // define the email options 

    const mailOptions={
         from:'sarang gakhar1 <gakharsarang1@gmail.com>',
         to:options.email,
         subject:options.subject,
         text:options.message,
         // html:

    }


    //actually send the email with nodemailer

    await transporter.sendMail(mailOptions)



};

module.exports=sendEmail;