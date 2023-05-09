const mongoose =require ('mongoose');
const dotenv =require( 'dotenv');

process.on('uncaughtException',err=>{
  console.log('uncaught exception 💣 shutting down')
  console.log(err.name,err.message);
  
    process.exit(1);

})

dotenv.config({path:'./config.env'});
const app =require('./app');


const DB=process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD);
// to connect to a local database in place if db get the process.env.DATABASE_LOCAL



mongoose.connect(DB,{
  // these are to deal with the deprication warnings use them in every new project
  useUnifiedTopology:true,
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false
  // this connect method is going to return a promise so we use the the then() method 
  // to deal with the promose
}).then(con=>{
  //console.log(con.connections);
  console.log('DB connection successful')
})

//.catch(err=>console.log('Error'));

const port=process.env.PORT;

//8000 given in config.env file



/* 
const Tour=mongoose.model('Tour',tourSchema);

// this the document instance 
const testTour=new Tour({
  name:'sarang ggggg',
  price:45

 
})

// and with testTour.save() we have saved our data in our document and the save 
// method will return a promise that we can chain with the then() method
testTour.save().then(doc=>{
  console.log(doc)
}).catch(err=>{
  console.log('Error💣:',err);
}) */


const server=app.listen(port, () =>{
  console.log(`app running on port ${port}`);
});



process.on('unhandledRejection',err=>{
  console.log('unhandled rejection 💣 shutting down')
  console.log(err.name,err.message);
  server.close(()=>{
    process.exit(1);

  })
})





