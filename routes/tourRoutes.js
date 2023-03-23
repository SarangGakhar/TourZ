const Router = require('express');
const {getMonthlyPlan,getTourStats,aliasTopTours,getAllTours, createTour, getTour, updateTour, deleteTour } =require( '../controllers/tourController');

const router=Router();


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
 .get(getAllTours)
 .post(createTour)

router
 .route('/:id')
 .get(getTour)
 .patch(updateTour)
 .delete(deleteTour);



 module.exports=router;

