class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    filter() {
      // here we cannot directly assign the object beacuse if we change the
      //queryObj then req.query will also get changed
  
      // build query
      //console.log(this.query);
      const queryObj = { ...this.queryString };
  
      // in our queries we may have the to exclude the below things
      const excludeFields = ['page', 'sort', 'limit', 'fields'];
  
      excludeFields.forEach((el) => delete queryObj[el]);
  
      // suppose we want to filter and get data on the baisis of some values
      // like we want the data with difficulty=easy and duration=5 and there can
      // be other things as well so in the route we will have to write-
  
      // http://127.0.0.1:8000/api/v1/tours/?duration=5&difficulty=easy
  
      // now the req.query has an object of all the queries
  
      // advanced filtering
  
      // suppose we want to filter data using the expressions like greater than less
      // than etc so in the route we pass duration[gte]=5, this is equivalet to duration>=5
      // so in the req.query we will get {duration:{gte:'5'}} so now we have to convert
      // it into the mongodb format that is {duration:{'$gte':'5'}}
      // convert all gte,gt,lte,lt by adding $ in their front which we have done in the code below
  
      let queryStr = JSON.stringify(queryObj);
  
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  
      //console.log(JSON.parse(queryStr));
  
      //let query= Tour.find(JSON.parse(queryStr));
      this.query = this.query.find(JSON.parse(queryStr));
  
      return this;
    }
  
    sort() {
      //         sorting
  
      // you want to sort data according to a value we can write sort=value_name now on query
      // object we can use a method called sort and we will pass the sorting parameter through
      // req.query.sort and it will sort in ascenidng order if we want to sort in descending
      // order we will put a negative sign in front of the parameter string in the route
      // now suppose our first parameter is same for two enteries then we can also specify
      // a second parameter so that paraneter string will become 'p1 p2' where p1 and p2 are
      // the parameters, we have written them by giving a space but in the route we cannor give
      // space so we will have to seperate them by a comma(,) and then we have that string with
      // comma and then we will replace that comma by space and then put it in the sort function
  
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ');
        //console.log(sortBy);
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt');
      }
  
      return this;
    }
  
    limitFields() {
      // field limiting
  
      /* 
  suppose we dont want all the data from the tour and we want to hide some of the 
  data the we can do is-
  http://127.0.0.1:8000/api/v1/tours/?fields=name,duration,difficulty,price
  
  so now in the fields we have the name,duration,difficulty,price so we will only get 
  these values. suppose we want to get all the data except particular fields, so for 
  that we can add a negative sign in front of the field and then it will be excluded 
  from our request
  
  */
  
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select('-__v');
      }
  
      return this;
    }
  
    pagination() {
      // pagination
  
      // the route will be like-
      // http://127.0.0.1:8000/api/v1/tours/?page=1&limit=3
  
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      const skip = (page - 1) * limit;
      // here query.skip indicates the amount of documents we want to skip
      // limit tells us the number of documents in a page
  
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
    }
  }

  module.exports=APIFeatures;