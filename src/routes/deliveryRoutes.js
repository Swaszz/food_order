const express = require('express');
const { adddeliveryaddress, getdeliveryaddress,updatedeliveryaddress, deletedeliveryaddress} = require('../controllers/deliveryController.js');
const userAuth = require("../middlewares/userAuth.js");
const jwt =require("jsonwebtoken")

const deliveryRouter = express.Router();


deliveryRouter.post('/adddelivery',userAuth, adddeliveryaddress);

deliveryRouter.get('/getdelivery',userAuth, getdeliveryaddress);


deliveryRouter.put('/updatedelivery',userAuth, updatedeliveryaddress);

deliveryRouter.delete("/deletedelivery/:addressId",userAuth,  deletedeliveryaddress);


module.exports = deliveryRouter;