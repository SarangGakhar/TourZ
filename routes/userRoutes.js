const Router= require('express');
const { getAllUsers, createUser, getUser, updateUser, deleteUser } =require('../controllers/userController');
const authController=require('../controllers/authController')


const router=Router();

// login and signup routes

router.post('/signup',authController.signup)
router.post('/login',authController.login)


// forgot and reset password

router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetpassword/:token',authController.resetPassword)

router
 .route('/')
 .get(getAllUsers)
 .post(createUser)

router
 .route('/:id')
 .get(getUser)
 .patch(updateUser)
 .delete(deleteUser)

 module.exports=router;