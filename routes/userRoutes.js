const Router= require('express');
const { getAllUsers, createUser, getUser, updateUser, deleteUser } =require('../controllers/userController');
const authController=require('../controllers/authController')


const router=Router();

router.post('/signup',authController.signup)
router.post('/login',authController.login)

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