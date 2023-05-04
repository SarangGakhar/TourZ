const catchAsync=require('../utils/catchAsync');
const AppError=require('../utils/appError')
const APIFeatures=require('../utils/apiFeatures');


exports.deleteOne=(Model)=> catchAsync( async (req, res,next) => {
  
    const doc = await Model.findByIdAndDelete(req.params.id);
    console.log(doc);
    if(!doc){
        
      return next(new AppError('no document found with that ID',404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  
})

exports.updateOne= (Model)=>catchAsync( async (req, res,next) => {

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      // this new:true will help up return the updated document
    });

    if(!doc){
      return next(new AppError('no document found with id',404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  
})

exports.createOne=(Model)=> catchAsync(async (req, res,next) => {

    const newTour = await Model.create(req.body);
  
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  
  })

 exports.getOne=(Model,popOptions)=>catchAsync( async (req, res,next) => {
  
  let query=Model.findById(req.params.id);

  if(popOptions){
    console.log(popOptions)
    query=query.populate(popOptions)
  }
  const doc = await query;

  if(!doc){
   return  next(new AppError('no document found with that id ',404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });

});

exports.getAll=Model=>catchAsync( async (req, res,next) => {
  
  // execute query

  // to allow for the nested get reviews on tours
  let filter={};
  if(req.params.tourId) {
      filter={tour:req.params.tourId}
  }
  
  
  const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  //const tours= await query;
  const doc = await features.query;

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc,
    },
  });

}
)
