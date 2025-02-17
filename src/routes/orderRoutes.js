const express = require('express');
const { getordersummary,
    getorderdetails,
    updateorderstatus,
    placeorder,
    getorderhistory,
    cancelorder} = require('../controllers/orderController.js');
const userAuth = require("../middlewares/userAuth.js");
const restaurantownerAuth = require("../middlewares/restaurantownerAuth.js");
const jwt =require("jsonwebtoken")

const orderRouter = express.Router();



orderRouter.get('/getorder',userAuth, getordersummary);

orderRouter.post('/placeorder',userAuth, placeorder);

orderRouter.post('/orderdetails',userAuth, getorderdetails);

orderRouter.delete('/cancelorder',userAuth, cancelorder);

orderRouter.get('/history',userAuth, getorderhistory);

orderRouter.put('/updatestatus',restaurantownerAuth, updateorderstatus);




module.exports = orderRouter;