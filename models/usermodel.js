const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


//creating a user schema 
const userSchema = mongoose.Schema({
    number: {
        type:String,
        required:true
    }

}, {timestamps: true})

userSchema.methods.generateJWT = function(){
    const token  = jwt.sign({
        _id:this._id,
        number:this.number
    }, process.env.JWT_SECRETKEY, {expiresIn: 60*10})
}

module.exports = User = mongoose.model('User', userSchema);