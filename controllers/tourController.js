const express = require('express');
const Tour = require('../models/tourModel');
const APIFeatures=require('../utils/apiFeatures');
const catchAsync=require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync( async (req, res,next) => {
  
    // execute query
    
    const features = new APIFeatures(Tour, req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    //const tours= await query;
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  
}
)

exports.getTour = catchAsync( async (req, res,next) => {
  
    const tour = await Tour.findById(req.params.id);

    if(!tour){
     return  next(new AppError('no tour found with that id ',404))
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  
});



exports.createTour = catchAsync(async (req, res,next) => {

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });

  // try {
   
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
}
)

exports.updateTour = catchAsync( async (req, res,next) => {

    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      // this new:true will help up return the updated document
    });

    if(!updatedTour){
      return next(new AppError('no tour found with id',404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  
})

exports.deleteTour = catchAsync( async (req, res,next) => {
  
    const updatedTour = await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  
})


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