const express = require('express')
const userRouter = require('./userRoutes.js')
const restaurantownerRouter = require('./restaurantownerRoutes.js')
const menuitemRouter = require('./menuItemRoutes.js')
const restaurantRouter = require('./restaurantRoutes.js')
const cartRouter = require('./cartRoutes.js')
const reviewRouter = require('./reviewRoutes.js')
const deliveryRouter = require('./deliveryRoutes.js')
const orderRouter = require('./orderRoutes.js')
const couponRouter = require('./couponRoutes.js')
const paymentRouter = require('./paymentRoutes.js')

const apiRouter = express.Router()

apiRouter.use('/user', userRouter)

apiRouter.use('/restaurantowner', restaurantownerRouter)

apiRouter.use('/menuitem', menuitemRouter)

apiRouter.use('/restaurant', restaurantRouter)

apiRouter.use('/cart', cartRouter)

apiRouter.use('/review', reviewRouter)

apiRouter.use('/delivery', deliveryRouter)

apiRouter.use('/order', orderRouter)

apiRouter.use('/coupon', couponRouter)

apiRouter.use('/payment', paymentRouter)

module.exports = apiRouter