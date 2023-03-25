const mongoose=require('mongoose');
const slugify=require('slugify');

const tourSchema=mongoose.Schema({
    // in the required array the first argument the first one is true/false and the 
    // the second is the error string 
    name:{
      type:String,
      unique: true, // this is not working dont know why
      required:[true,'at tour must have a name'], 
      trim:true,
      // below are some validators for min and max length the first element in the array specifies there value the second element specifies the error message 
      maxlength:[40,' a tour name must have length less than or equal to 40'],
      minlength:[10,'a tour name must have length greater than or equal to 10']
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,' a tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'a tour must have group size']
      },
    difficulty:{
        type:String,
        required:[true,'a tour must have a difficulty size'],
        // enum is a validator, it will, if you want your data to have a value out of some fixed values  
        enum:{
          values:['easy','medium','difficult'],
          message:'Difficulty is either easy, medium, difficult'
        }
    },
    ratingsAverage:{
      type:Number,
      default:4.5,
      min:[1.0,'rating must be above 1.0'],
      max:[5,'rating must be below 5.0']
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
      type:Number,
      required:[true,'at tour must have a name']
    },
    priceDiscount:{
        type:Number,
        // below is a custom validator will work on create and not on update
        validate:{
          validator:function(val){
            return val<this.price // discount should be less than price
          },
          message:'Discount price ({VALUE}) should be less than the regular price'
        }
    },
    summary:{
        type:String,
        trim:true
        // trim will remove all the blank space from the beggining and end
    },
    description:{
        type:String,
        trim:true,
        required:[true,'a tour must have a summery']
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    startDates:[Date],
    secretTour:{
      type:Boolean,
      default:false
    },


  },
  

  {
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
  }
  );



  tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
  });

  // this is a document middleware and is invoked before .save() and .create()
  // this will not work on insert many

  tourSchema.pre('save',function(next){
    // 'this' keyword will have the document which we are trying to save 
    //console.log(this)

    this.slug=slugify(this.name,{lower:true});
    next();

    // this next function is same as we have seen in the express where we have req,res,next

  })

  // tourSchema.pre('save',function(next){
  //   console.log("will save doc........");
  //   next();
  // })

  // // post document middleware which is invoked when all the ore middleware have executed

  // tourSchema.post('save',function(doc,next){
  //   console.log(doc);
  //   next();
  // })

  
  // QUERY MIDDLEWARE 

  // this will work when a query is executed 

  //tourSchema.pre('find',function(next){
  tourSchema.pre(/^find/,function(next){

    //  "this" will have our query and we can chain different  methods on it 
    // here basically we have made some secret tours which we dont want to be visible to all 
    // so we are filerting it out for every query

    //console.log(this);
    this.find({secretTour:{$ne:true}});
    this.start=Date.now();
    next();

  })

  // tourSchema.pre('findOne',function(next){
  //   // find one is for when we are quering some doc with id and we dont want our secret query to be visible 
  //   // now instead of using findOne and just writing the same code we can make a regular expression in the find function
  //   //console.log(this);
  //     this.find({secretTour:{$ne:true}});
  //   next();
  // })

  // query POST MIDDLEWARE 
  
  tourSchema.post(/^find/,function(doc,next){
    // the doc shows the complete document 
    //console.log(doc);
    console.log(`query took ${Date.now()-this.start}`);
    next();



  })

  // AGGREGATE MIDDLEWARE 

tourSchema.pre('aggregate',function(next){
  // points to current aggregation object

  // from this.pipeline() we get the aggregation pipeline 

  this.pipeline().unshift({$match:{secretTour:{$ne:true}}});  
  // so from the this.pipeline() we get an array and we will add a condition to the front of the array using unshift so that secretTour is not visible
  
  //console.log(this.pipeline());
  next();

})





  const Tour=mongoose.model('Tour',tourSchema);

  module.exports=Tour;




  