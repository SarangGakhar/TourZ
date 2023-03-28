const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken')
const User=require('../models/userModel');
const catchAsync=require('../utils/catchAsync');
const AppError=require('../utils/appError')

const signToken=id=>(
      jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"60d"}))

exports.signup= catchAsync (async(req,res,next)=>{

const newUser=await User.create({name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm});

const token=signToken(newUser._id)
//jwt.sign({id:newUser._id},process.env.JWT_SECRET,{expiresIn:"60d"}) ;


res.status(201).json({
    status:'success',
    token,
    data:{
        user:newUser
    }
})

})

exports.login= catchAsync( async (req,res,next)=>{
    const {email,password}=req.body;

    // 1>check if email and password exists 

    // 2>check if the user exists and password is correct

    // 3> if everything ok , send token to the clint 

    if(!email || !password){

        return next(new AppError('please provide email and password ',400));
        
    }

    const user=await User.findOne({email}).select('+password')
// so we have the encryped passwoed and we have to match it with the password given by user
// so bcrypt has a function to compare both the original pass and its encryped version 
    const correct = await bcrypt.compare(password,user.password);
    //await user.correctPassword(password,user.password);

    if(!user ||!correct){
       // console.log(correctPassword)
        return next( new AppError(`Incorrect email or password ${correct } ${user}`,401))
    }

    const token=signToken(user._id);
    res.status(200).json({
        status:'success',
        token,
        
    })

   

})

exports.protect=catchAsync(
  async (req,res,next)=>{

    //1> get token and check its there


    


    // 2> verification token


    //3> check if user exists trying to access the routs



    // 4> check if user changed password after the jwt was issued 

        next();
    }
)
