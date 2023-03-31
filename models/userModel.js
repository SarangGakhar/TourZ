const crypto=require('crypto');
const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const catchAsync = require('../utils/catchAsync');

// name email photo password passwordConfirm

const userSchema = mongoose.Schema({

    name:{
        type:String,
        required:[true,'please provide a name'],
        unique:true
    },

    email:{
        type:String,
        required:[true,'please provide an email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'please provide a valid email']
    },

    photo:{
        type:String
    },
    
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user',
        unique:false
    },
    password:{
        type:String,
        required:[true,'please provide a password'],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:true,
        select:false,
        
        validate:{
            // this will always work on save not on update 

            validator:function(el){
                return el===this.password;
            },
            message:' confirm password does not match with the password'


        }
    },
    passwordChangedAt:Date,

    passwordResetToken:String,

    passwordResetExpires:Date
    
});

// we cannot save the password string as it is in the database so we have to bcrypt it 
// this middleware will run before saving the data to database

userSchema.pre('save', async function(next){
    // if the password is not modified then no need to do any thing 
    if(!this.isModified('password')) {return next()}

    // else we need to bcrypt 
    this.password= await bcrypt.hash(this.password,12)

    // with the below code there is some error dont know why 

    this.passwordConfirm=this.password;
   // this.passwordConfirm="Password-Confirmed";

    next(); 


}
)

userSchema.methods.correctPassword= async function(candidatePassword,userPassword){
    return  await bcrypt.compare(candidatePassword,userPassword) }

    userSchema.methods.changedPasswordAfter=function(JWTTimestamp){
        if(this.passwordChangedAt){
            const changedTimestamp=parseInt(this.passwordChangedAt.getTime()/1000,10);
            
            console.log(changedTimestamp,JWTTimestamp);

            return JWTTimestamp<changedTimestamp;
        }


        // false means password not changed
        return false;
    }


userSchema.methods.createPasswordResetToken=function(){

    const resetToken=crypto.randomBytes(32).toString('hex');

    this.passwordResetToken=crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    console.log({resetToken},this.passwordResetToken)

    this.passwordResetExpires=Date.now +10*60*1000

    return resetToken;


}

const User=mongoose.model('user',userSchema);

module.exports=User;

