const express = require('express');
const { restaurantownerRegister, restaurantownerlogin, restaurantownerProfile, restaurantownerLogout,updaterestaurantownerProfile,checkrestaurantowner} = require('../controllers/restaurantownerController.js');
const restaurantownerAuth = require("../middlewares/restaurantownerAuth.js");
const jwt =require("jsonwebtoken")

const restaurantownerRouter = express.Router();

restaurantownerRouter.post('/signup', restaurantownerRegister);

restaurantownerRouter.put('/login', restaurantownerlogin);

restaurantownerRouter.get('/logout', restaurantownerAuth, restaurantownerLogout);

restaurantownerRouter.get('/profile',  restaurantownerAuth, restaurantownerProfile)


restaurantownerRouter.get('/updateprofile', restaurantownerAuth,updaterestaurantownerProfile );


restaurantownerRouter.get('/checkrestaurantowner', restaurantownerAuth,checkrestaurantowner );

module.exports = restaurantownerRouter;
