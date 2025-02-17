
const express = require('express');
const { createsession,
    getsession} = require('../controllers/paymentController.js');
const userAuth = require("../middlewares/userAuth.js");
const jwt =require("jsonwebtoken")

const paymentRouter = express.Router();


paymentRouter.post("/create-checkout-session", userAuth ,createsession)

paymentRouter.get("/session-status", getsession,)

module.exports = paymentRouter;















