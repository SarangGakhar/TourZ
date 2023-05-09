//import fs from 'fs';
const path=require('path');
const express=require( 'express');
const rateLimit=require('express-rate-limit')
const helmet=require('helmet')
const mongoSanitize=require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');
//const { CLIENT_RENEG_WINDOW } from 'tls';
const morgan =require('morgan');
const AppError=require('./utils/appError');
const globalErrorHandler=require('./controllers/errorController')

const tourRouter =require( './routes/tourRoutes');
const userRouter =require( './routes/userRoutes');
const reviewRouter=require('./routes/reviewRoutes')

const app=express();

 app.set('view engine','pug');
 app.set('views',path.join(__dirname,'views'));
 app.use(express.static(path.join(__dirname,'public'))); 


// development logging 
if(process.env.NODE_ENV==='development'){

   app.use(morgan('dev'));
}

console.log(process.env.NODE_ENV);

//app.use(morgan('dev'));

const limiter=rateLimit({
   max:100,
   windowMs:60*60*1000 ,
   message:'Too many request from this IP, please try again in an hour '
});

app.use(helmet())
app.use('/api',limiter);


// body parser, reading data from body into req.body
app.use(express.json({limit:'10kb'})); // middleware to get body from request

// data sanitization against noSQL query injection

app.use(mongoSanitize());

//data sanitization against xss

app.use(xss());

// prevent paramater pollution
app.use(hpp({
   whitelist:[
   "duration",
   "ratingsQuantity",
   "ratingsAverage",
   "maxGroupSize",
   "difficulty",
   "price"
   ]
}));



app.use((req,res,next)=>{
   // console.log("creating my own middleware");
    req.reqTime=new Date().toISOString();
    console.log(req.headers);
    next(); // we need to call it otherwise it will not work


})


app.get('/',(req,res)=>{
   res.status(200).render('base');

})


app.use('/api/v1/tours',tourRouter);/* tourRouter and userRouter is a middleware and we have specified the route */ 
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);


//handeling the routes that do not have any handler or we can say we type in the wrong route 

app.all('*',(req,res,next)=>{
   // res.status(404).json({

   //    status:'fail',
   //    message:`can't find ${req.originalUrl} on this server`
 
      
   // });

   // const err=new Error(`can't find ${req.originalUrl} on this server`);
   // err.status='fail';
   // err.statusCode=404;

   // to use the default error handler we have to pass out error variable in the 
   // argument of the next function

   next(
      new AppError(`can't find ${req.originalUrl} on this server`,404)
   );
});

app.use(

   globalErrorHandler

//    (err,req,res,next)=>{
//    // is the status code is valid then it will remain same else it is be assigned to 500
//    err.statusCode=err.statusCode||500;
//    // if the status is valid then it will remain the same else it will be named as error
//    err.status=err.status||'error';

//    res.status(err.statusCode).json({
//       status: err.status,
//       message:err.message
//    })

// }

);

module.exports= app;

