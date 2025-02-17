const express = require('express');
const { addrestaurant, getrestaurant, getrestaurantDetails, updaterestaurant, deleterestaurant} = require('../controllers/restaurantController.js');
const restaurantownerAuth = require("../middlewares/restaurantownerAuth.js");
const userAuth = require("../middlewares/userAuth.js");
const jwt =require("jsonwebtoken")

const restaurantRouter = express.Router();


restaurantRouter.post('/addrestaurant',restaurantownerAuth, addrestaurant);

restaurantRouter.get('/getrestaurant', getrestaurant);

restaurantRouter.get('/getrestaurantdetails/:id', getrestaurantDetails);

restaurantRouter.put('/updaterestaurant/:id', restaurantownerAuth, updaterestaurant);

restaurantRouter.delete('/deleterestaurant/:id',restaurantownerAuth,  deleterestaurant);

module.exports = restaurantRouter;
