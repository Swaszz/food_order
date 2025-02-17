const express = require('express');
const { addcart, getcart,  getCartDetails, proceedToCheckout,updateQuantity,emptycart,  deletecart} = require('../controllers/cartController.js');
const userAuth = require("../middlewares/userAuth.js");
const jwt =require("jsonwebtoken")

const cartRouter = express.Router();


cartRouter.post('/addcart',userAuth, addcart);

cartRouter.get('/getcart',userAuth, getcart);

cartRouter.get("/", userAuth, getCartDetails); 

cartRouter.post("/checkout", userAuth, proceedToCheckout); 

cartRouter.put('/updatequantity',userAuth, updateQuantity);

cartRouter.delete('/deletecart',userAuth,  deletecart);

cartRouter.delete('/emptycart',userAuth,  emptycart);

module.exports = cartRouter;