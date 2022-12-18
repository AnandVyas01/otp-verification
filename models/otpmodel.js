const mongoose = require('mongoose');


module.exports = Otp = mongoose.model('Otp', mongoose.Schema({
    number: {
        type:String,
        required:true
    },
    otp : {
        type:String,
        required:true
    },
    // setting expiration - 5 min of the otp
    //it will get deleted automatically from the database
    createdAt : {
        type: Date,
        default:Date.now,
        index:{
            expires:300
        }
    }
}, {timestamps:true})) 