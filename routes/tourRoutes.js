const Router = require('express');

const router=Router();
const {getMonthlyPlan,getTourStats,aliasTopTours,getAllTours, createTour, getTour, updateTour, deleteTour } =require( '../controllers/tourController');
const authController=require('../controllers/authController')
const reviewRouter=require('./reviewRoutes')
const tourController=require( '../controllers/tourController');

router.use('/:tourId/reviews',reviewRouter);

router
.route('/top-5-cheap')
.get(aliasTopTours,getAllTours);

router
.route('/tour-stats')
.get(getTourStats)

router
.route('/monthly-plan/:year')
.get(authController.protect,authController.restrictTo('admin','lead-guide','guide'),getMonthlyPlan)

router
 .route('/')
 .get(getAllTours)
 .post(authController.protect,authController.restrictTo('admin','lead-guide', 'guide'),createTour)

router
 .route('/:id')
 .get(tourController.getTour)
 .patch(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.updateTour)
 .delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour);


 module.exports=router;

