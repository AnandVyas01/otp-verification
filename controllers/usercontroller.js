const bcrypt = require('bcrypt');
const _ = require('lodash');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

const User = require('../models/usermodel');
const OTP = require('../models/otpmodel');

const signUp = async (req, res) => {
    //finding for the user using phone number
    const user = await User.findOne({
        number: req.body.number
    })

    //checking if number/user has already registered 
    if (user) return res.status(400).send("user has already registered!!");

    //generating the otp 6 digit length
    const Otp = otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        upperCase: false,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    })

    //accepting the number
    const number = req.body.number;
    console.log(Otp);

    //adding mail service 
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });
    
    //adding mail template
    mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            // Appears in header & footer of e-mails
            // name: 'Mailgen',
            // link: 'https://mailgen.js/'
            // Optional product logo
            // logo: 'https://mailgen.js/img/logo.png'
        }
    });

    //mail body
    var email = {
        body: {
            name: number,
            intro: `Use this otp for Signing up ${Otp}`,
            outro: 'Otp will expire in 5 minutes'
        }
    };
    
    // Generate an HTML email with the provided contents
    var emailBody = mailGenerator.generate(email);
    
    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    var emailText = mailGenerator.generatePlaintext(email);

    //sfilling in details
    let mailOptions = {
        from: process.env.MAIL_USER, // sender address
        to: number, // list of receivers
        subject: 'verification', // Subject line
        text: emailText, // plain text body
        html: emailBody // html body
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
    //create the collection 
    const otp = new OTP({
        number: number,
        otp: Otp
    })

    //generating the hashed otp value
    //generate 10 digit hash value
    const salt = await bcrypt.genSalt(10);
    //saving hashed otp instead of normal readable text
    otp.otp = await bcrypt.hash(otp.otp, salt)
    //saving the document
    const result = await otp.save();

    return res.status(200).send('Otp sent sucessfuly!!')
}


const verifyOtp = async (req, res) => {
    //finding otp
    const otpHolder = await OTP.find({
        number: req.body.number
    })
    if (otpHolder.length === 0) return res.status(400).send("Otp his been expired, try signing up again")

    //one user might have requested more than one otp searching for the latest otp
    const latestOtp = otpHolder[otpHolder.length - 1]
    // console.log(latestOtp, "latestotp")

    //comparing the otp
    const validOtp = await bcrypt.compare(req.body.otp, latestOtp.otp)
    // console.log(validOtp, "validotp")
    //otp verification and user verificvation
    if (latestOtp.number === req.body.number && validOtp) {
        const user = new User(_.pick(req.body, ["number"]))
        // console.log(user, "user")
        const token = user.generateJWT();
        const result = await user.save();
        // deleting otp from db after logging in
        const delOtp = await OTP.deleteMany({
            number: latestOtp.number
        })
        return res.status(200).send({
            message: "user registered succesfully",
            token: token,
            data: result
        })
    } else {
        return res.status(400).send("your otp was wrong")
    }
}

module.exports = {
    signUp,
    verifyOtp
}