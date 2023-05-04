const Router= require('express');
const {deleteMe,updateMe, getAllUsers, createUser, getUser, updateUser, deleteUser } =require('../controllers/userController');
const authController=require('../controllers/authController')
const reviewController=require('../controllers/reviewController')
const userController=require('../controllers/userController')

const router=Router();

// login and signup routes

router.post('/signup',authController.signup)
router.post('/login',authController.login)


// forgot and reset password

router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetpassword/:token',authController.resetPassword)


router.get('/me',authController.protect,userController.getMe,userController.getUser )
router.patch('/updateMe',authController.protect,updateMe)
router.delete('/deleteMe',authController.protect,deleteMe)


router.patch('/updateMyPassword',authController.protect,authController.updatePassword)





router
 .route('/')
 .get(authController.protect,authController.restrictTo('admin'),getAllUsers)
 .post(authController.protect,authController.restrictTo('admin'),createUser)

router
 .route('/:id')
 .get(authController.protect,authController.restrictTo('admin'),getUser)
 .patch(authController.protect,authController.restrictTo('admin'),updateUser)
 .delete(authController.protect,authController.restrictTo('admin'),deleteUser)




 module.exports=router;