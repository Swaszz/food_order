const express = require('express');
const { getordersummary,
    getorderdetails,
    updateorderstatus,
    placeorder,   latestorder,
    getorderhistory,
    cancelorder} = require('../controllers/orderController.js');
const userAuth = require("../middlewares/userAuth.js");
const restaurantownerAuth = require("../middlewares/restaurantownerAuth.js");
const jwt =require("jsonwebtoken")

const orderRouter = express.Router();



orderRouter.get('/getorder',userAuth, getordersummary);

orderRouter.get("/latest", userAuth,   latestorder)

orderRouter.get('/history',userAuth, getorderhistory);

orderRouter.post('/placeorder',userAuth, placeorder);

orderRouter.post('/orderdetails',userAuth, getorderdetails);

orderRouter.put('/updatestatus',restaurantownerAuth, updateorderstatus);

orderRouter.delete('/cancel/:id',userAuth, cancelorder);







module.exports = orderRouter;