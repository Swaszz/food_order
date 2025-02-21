const express = require('express');
const {addreview ,getrestaurantreview,deletereview ,getaveragerating,getMenuItemReview} = require('../controllers/reviewController.js');
const restaurantownerAuth = require("../middlewares/restaurantownerAuth.js");
const userAuth = require("../middlewares/userAuth.js");
const jwt =require("jsonwebtoken")

const reviewRouter = express.Router();


reviewRouter.post('/addreview',userAuth, addreview);

reviewRouter.get('/getrestaurantreview/:restaurantId',userAuth, getrestaurantreview);


reviewRouter.delete('/deletereview/:reviewId',userAuth, deletereview);

reviewRouter.get('//getaveragerating/:menuItemId',userAuth,  getaveragerating);

reviewRouter.get('/getMenuItemReview/:menuItemId',userAuth, getMenuItemReview);


module.exports = reviewRouter;getMenuItemReview