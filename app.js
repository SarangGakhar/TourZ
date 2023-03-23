//import fs from 'fs';
const express=require( 'express');

//const { CLIENT_RENEG_WINDOW } from 'tls';
const morgan =require('morgan');


const tourRouter =require( './routes/tourRoutes');
const userRouter =require( './routes/userRoutes');

const app=express();

if(process.env.NODE_ENV==='development'){

   app.use(morgan('dev'));
}

console.log(process.env.NODE_ENV);

//app.use(morgan('dev'));

app.use(express.json()); // middleware to get body from request

app.use((req,res,next)=>{
   // console.log("creating my own middleware");
    req.reqTime=new Date().toISOString();
    next(); // we need to call it otherwise it will not work


})


app.use('/api/v1/tours',tourRouter);/* tourRouter and userRouter is a middleware and we have specified the route */ 
app.use('/api/v1/users',userRouter);

module.exports= app;

