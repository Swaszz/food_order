const express = require('express');
const { userRegister, userLogin, userProfile, userLogout,updateUserProfile,checkuser} = require('../controllers/userController.js');
const userAuth = require("../middlewares/userAuth.js");
const jwt =require("jsonwebtoken")

const userRouter = express.Router();

userRouter.post('/signup', userRegister);


userRouter.put('/login', userLogin);


userRouter.get('/logout', userAuth, userLogout);


userRouter.get('/profile', userAuth, userProfile);


userRouter.put('/updateprofile', userAuth,updateUserProfile );


userRouter.get("/checkuser", userAuth, checkuser);

module.exports = userRouter;