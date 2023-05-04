const {promisify}=require('util');
const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken')
const User=require('../models/userModel');
const catchAsync=require('../utils/catchAsync');
const AppError=require('../utils/appError')
const sendEmail=require('../utils/email')


const signToken=id=>(
      jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"90d"}));

const createSentToken=(user,statusCode,res)=>{
    const token=signToken(user._id);

    const cookieOptions={
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
       // secure:true,
        httpOnly:true
    }

    if(process.env.NODE_ENV==='production') cookieOptions.secu=true

   res.cookie('jwt',token,cookieOptions)

   // remove passwoed in the output
   user.password=undefined
   user.passwordConfirm=undefined

res.status(statusCode).json({
    status:'success',
    token,
    data:{
        user:user
    }
})

}

exports.signup= catchAsync (async(req,res,next)=>{

const newUser=await User.create(req.body);

createSentToken(newUser,201,res);

})

exports.login= catchAsync( async (req,res,next)=>{
    const {email,password}=req.body;
   
    // 1>check if email and password exists 

    // 2>check if the user exists and password is correct

    // 3> if everything ok , send token to the clint 

    if(!email || !password){

        return next(new AppError('please provide email and password ',400));
        
    }
    console.log(email)
    const user=await User.findOne({email}).select('+password')
   
// so we have the encryped passwoed and we have to match it with the password given by user
// so bcrypt has a function to compare both the original pass and its encryped version 

console.log(user)

if(!user){
    return next(new AppError('User with the given email does not exists'))
}


const correct = await bcrypt.compare(password,user.password);
    //await user.correctPassword(password,user.password);

    if(!correct){
       // console.log(correctPassword)
        return next( new AppError(`Incorrect  password ${correct } `,401))
    }

   createSentToken(user,200,res);

   

})

exports.protect=catchAsync(
  async (req,res,next)=>{

    //1> get token and check its there
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
         token=req.headers.authorization.split(' ')[1]; 
    }

    //console.log(token);

    if(!token){
        return next(new AppError('you are not logged in! please log in to get access. ',401))
    }

    // 2> verification token

   const decoded =await promisify(jwt.verify)(token,process.env.JWT_SECRET)
   // console.log(decoded)

    //3> check if user exists trying to access the routs

    const freshUser=await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError('The user belonging to the token does no longer exists ',401))
    }


    // 4> check if user changed password after the jwt was issued 

   if( freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('user recently changed password, please login again'),401)
    }
    
    // Grant access to protected route

    req.user=freshUser;
        next();
    }
)


exports.restrictTo=function(...roles){
    
return (req,res,next)=>{

    // roles has 'admin','lead-guide'

    if(!roles.includes(req.user.role)){
        return next(new AppError('you dont have permission to perform this action ',403));
    }

    next();

}
    
};


exports.forgotPassword= catchAsync( async (req,res,next)=>{
    // get user based on posted email

    const user= await User.findOne({email:req.body.email})

    if(!user){
        return next(new AppError('there is no user with that email address ',404))
    }
    // generate the random token 

    const resetToken=await user.createPasswordResetToken();

    await user.save({validateBeforeSave:false});

    // send it to users email

    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message=`Forgot your password? submit a patch request with your new passsword and passwordconfirm to: ${resetURL}.\nif you did not forget your password please ignore this email`

    try{
        await sendEmail({
            email:user.email,
            subject:'Your password reset token(valid for 10 minutes )',
            message
        })
    
        res.status(200).json({
            status:'success',
            message:'token sent to email'
    
        })
    }catch(err){
        user.PasswordResetToken=undefined;
        user.passwordResetExpires=undefined;

        await user.save({validateBeforeSave:false});

        //console.log("this is pass reset token-",user.PasswordResetToken)
        return next(new AppError('there was an error sending email. please try again',500))
    }
    
   
})
exports.resetPassword= catchAsync(async (req,res,next)=>{

    // get user based upon token

    const hashedToken=crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user=await User.findOne(
        {
        PasswordResetToken:hashedToken,
        passwordResetExpires:{$gte:Date.now()}

        }
    );



    // if token has not expired and there is user, set the new password 

    if(!user){
        console.log(user);
        return next(new AppError('token is invalid or has expired',400))
    }

    user.password=req.body.password
    user.passwordConfirm=req.body.passwordConfirm
    user.PasswordResetToken=undefined
    user.passwordResetExpires=undefined

    //await user.save({validateBeforeSave:false});
    await user.save();

    // update the changePasswordAt for the current user 

    

    // log the user in, send jwt
    createSentToken(user,200,res);

   //    console.log("token is-",token)




})

exports.updatePassword= catchAsync( async (req,res,next)=>{

    // 1> get the user from the collection

    const user=await User.findById(req.user.id).select('+password')

    //2> check if the posted password password is correct 

    if(! await (user.correctPassword(req.body.passwordCurrent,user.password))){
        return next(new AppError('your current password is wrong',404));
    }

    // 3> if so then update the password

    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;

    await user.save();

    //4> log user in, send jwt 

    createSentToken(user,200,res);



})

