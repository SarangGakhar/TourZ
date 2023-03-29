const Router = require('express');

const router=Router();
const {getMonthlyPlan,getTourStats,aliasTopTours,getAllTours, createTour, getTour, updateTour, deleteTour } =require( '../controllers/tourController');
const authController=require('../controllers/authController')


router
.route('/top-5-cheap')
.get(aliasTopTours,getAllTours);

router
.route('/tour-stats')
.get(getTourStats)

router
.route('/monthly-plan/:year')
.get(getMonthlyPlan)

router
 .route('/')
 .get(authController.protect,getAllTours)
 .post(createTour)

router
 .route('/:id')
 .get(getTour)
 .patch(updateTour)
 .delete(deleteTour);



 module.exports=router;

