const express = require('express');
const Tour = require('../models/tourModel');
const APIFeatures=require('../utils/apiFeatures');
const catchAsync=require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory=require('./handlerFactory')

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour,{path:'reviews'});

exports.createTour = factory.createOne(Tour);

exports.updateTour =factory.updateOne(Tour); 

exports.deleteTour=factory.deleteOne(Tour);


// here we are using the aggrigation pipeling to get some stats of the data 
exports.getTourStats=  catchAsync( async (req,res,next)=>{

        const stats= await Tour.aggregate([
// filter documents by the ratingsAverage
          {$match:{ratingsAverage:{$gte:4.5}}},
          {
// now we have got the tours with ratingsAverage greater than 4.5 so we are going to 
// group them  on the basis of different parameters specified
            $group:{
              _id:'$difficulty', // group the data on baisis of difficulty
              // _id:'$ratingsAverage',
              num:{$sum:1}, // total number of documents
              numRatings:{$sum:'$ratingsQuantity'}, // total number of ratings
              avgRating:{$avg:'$ratingsAverage'}, // average of all the rating
              avgPrice:{$avg:'$price'}, // avg price of all the documents
              minPrice:{$min:'$price'}, // min price of all the tours
              maxPrice:{$max:'$price'} // max price of all the tours

            },
            
          },
          {
            $sort:{avgPrice:1} // sorting the data on the basis of avgPrice which we have declared above and 1 here specifies ascending order
          },
         // {$match:{_id:{$ne:'easy'}}} // this is to remove the doc where _id='easy'
            
        ]);


        res.status(200).json({
          status: 'success',
          data: {
            stats
          },
        });


    
    

})


// now suppose we want to calculate the month where the max number of tours are starting 

exports.getMonthlyPlan= catchAsync( async (req,res,next)=>{

  const year=req.params.year*1;
  const plan=await Tour.aggregate([
    {
      $unwind:'$startDates'
    },
    {
      $match:{
        startDates:{
          $gte:new Date(`${year}-01-01`),
          $lte:new Date(`${year}-12-31`)

        }
      },
      
    },
    {
      $group:{
        _id:{$month:'$startDates'},
        numTourStarts:{$sum:1},
        tour:{$push:'$name'} // push will give an array of names which have same start dates
      }
    },
    {
      $addFields:{month:'$_id'} // addFields is simply used to add field
    },
    {
      $project:{
        _id:0 // here in project we can put either 0 ot 1 if will put 0 for any field then that field will not show up in the api
      }
    },
    {
      $sort:{
         numTourStarts:-1 // 1 is for asscending and -1 foe descending 
      }
    }
    
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    },
  });

})

exports.getToursWithin= catchAsync( async (req,res,next)=>{

  const {distance,latlng,unit}=req.params;
  const [lat,lng]=latlng.split(',');

  const radius=unit==='mi'? distance/3963.2 : distance/ 6378.1;

  if(!lat || !lng){
    next(new AppError('Please provide latitude and longitude field',400))
  }

  console.log(distance,lat,lng,unit);

  const tours= await Tour.find({
    startLocation:
    {$geoWithin:
      {
        $centerSphere:[[lng,lat],radius]
      }
    }
  })

  res.status(200).json({
    status:'success',
    results:tours.length,
    data:{
      data:tours
    }

  })

})

exports.getDistances=catchAsync(async (req,res,next)=>{

    
  const {latlng,unit}=req.params;
  const [lat,lng]=latlng.split(',');

  const multiplier=unit==='mi'?0.000621371:0.001;

  if(!lat || !lng){
    next(new AppError('Please provide latitude and longitude field',400))
  }

 const distances= await Tour.aggregate([
  
    {
      $geoNear:{
        near:{
          type:'Point',
          coordinates:[lng*1,lat*1]
        },
        distanceField:'distance',
        distanceMultiplier:multiplier
      }
    },
    {
      $project:{
        distance:1,
        name:1
      }
    }
  
 ])

 res.status(200).json({
  status:'success', 
  data:{
    data:distances
  }

})


  })