const AppError = require("../utils/appError")

const handleCastError= err=>{

   const message=`Invalid ${err.path}: ${err.value}.`

   return new AppError(message,400)

}

const handleDuplicateFieldsDB=err=>{

   
   const value=err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
   console.log(value);

   const message=`Duplicate field value: ${value}. please use other value!`
   return new AppError(message,400);
}

const handleValidationErrorDB=err=>{
   const errors=Object.values(err.errors).map(el=>el.message);
   const message=`Invalid input data. ${errors.join('. ')}`;
   return new AppError(message,400)
}

const handleJWTError=()=>(new AppError('Invalid token. please login again',401));

const handleJWTExpiredError=()=>(new AppError('Your token has expired! please login again',401));

const sendErrorDev=(err,res)=>{

   res.status(err.statusCode).json({
      status: err.status,
      error:err,
      message:err.message,
      stack:err.stack

   })

}

const sendErrorProd=(err,res)=>{

   // operational, trusted error :send message to client 
   if(err.isOperational){

      res.status(err.statusCode).json({
         status: err.status,
         message:err.message,
        
      })

   }

   // programming or other unknown error : dont leak details 

   else{

      // 1> log the error

      console.error('Error',err)   

      // 2>send a generic message 
      res.status(500).json({
         status:'error',
         message:'something went wrong!'
      })
   }



}

module.exports=(err,req,res,next)=>{
    // is the status code is valid then it will remain same else it is be assigned to 500
    err.statusCode=err.statusCode||500;
    // if the status is valid then it will remain the same else it will be named as error
    err.status=err.status||'error';


    if(process.env.NODE_ENV ==='development'){

      sendErrorDev(err,res);

    }

    else if(process.env.NODE_ENV==='production'){

      let error={...err};

      if(error.name==='CastError') error= handleCastError(error)
      if(error.code===11000) error=handleDuplicateFieldsDB(error)
      if(error.name==='ValidationError') error=handleValidationErrorDB(error)
      if(error.name==="JsonWebTokenError") error=handleJWTError()
      if(error.name==="TokenExpiredError") error=handleJWTExpiredError()
      sendErrorDev(error,res);


    }
 
   
 
 }