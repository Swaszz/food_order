const express = require('express');

const { createCoupon, getAllCoupons, applyCoupon, deleteCoupon,updateCoupon,  removeCoupon} = require('../controllers/couponcontroller.js');
const userAuth = require("../middlewares/userAuth.js");
const jwt =require("jsonwebtoken")
const restaurantownerAuth = require("../middlewares/restaurantownerAuth.js");


const couponRouter = express.Router();


couponRouter.post("/create",restaurantownerAuth, createCoupon );

couponRouter.get('/get',userAuth,getAllCoupons);

couponRouter.post("/apply",userAuth, applyCoupon); 

couponRouter.delete("/delete/:id", restaurantownerAuth, deleteCoupon);

couponRouter.put("/update/:id", restaurantownerAuth, updateCoupon);


module.exports = couponRouter