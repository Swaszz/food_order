const Order = require('../models/orderModel.js')
const Cart = require('../models/cartModel.js')
const bcrypt = require('bcryptjs')
const jwt =require("jsonwebtoken")
const tokenGenerator = require('../utils/token');
const mongoose = require("mongoose");

const getordersummary = async (req, res) => {
  try {
    const userId = req.user.id; 
    console.log(`Fetching order summary for user: ${userId}`);

    const orders = await Order.find({ userId })
      .populate("menuItem.menuItemId", "name image price") 
      .populate("deliveryAddress"); 

    console.log("MongoDB Query Result:", orders);

    if (!orders || orders.length === 0) {
      console.warn(` No orders found for user: ${userId}`);
      return res.status(404).json({ success: false, message: "No orders found" });
    }

    
    const formattedOrders = orders.map(order => ({
      cartId: order.cartId || `cart_${order._id}`,  
      orderId: order._id,
      menuItem: order.menuItem,
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount || 0, 
      appliedCoupon: order.appliedCoupon || null,
      deliveryAddress: order.deliveryAddress || null,
      status: order.status,
      createdAt: order.createdAt,
    }));

    res.status(200).json({ success: true, data: formattedOrders });

  } catch (error) {
    console.error(" Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const placeorder = async (req, res) => {
  try {
      const { cartId, userId, totalAmount, discountAmount, appliedCoupon, orderItems } = req.body;

      if (!cartId || !userId || !orderItems || orderItems.length === 0) {
          return res.status(400).json({ success: false, message: "Missing required fields" });
      }

     
      const newOrder = new Order({
          userId,
          cartId,
          menuItem: orderItems,
          totalAmount,
          discountAmount,
          appliedCoupon,
      });

      const savedOrder = await newOrder.save();
      console.log(" Order Created Successfully:", savedOrder);

     
      res.status(201).json({
          success: true,
          message: "Order placed successfully",
          orderId: savedOrder._id, 
          data: savedOrder
      });
  } catch (error) {
      console.error("Error placing order:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
  const getorderdetails = async (req, res) => {
    try {
      const { orderId } = req.body;
      console.log(orderId)
      const order = await Order.findById(orderId).populate("menuItem.menuItemId").populate("deliveryAddress");
  
      if (!order) return res.status(404).json({ message: "Order not found" });
  
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      console.error(" Error fetching order details:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  

 const cancelorder = async (req, res) => {
  try {
    console.log("Cancel Order API Hit");
    console.log("Request Headers:", req.headers);
    console.log("Request Params:", req.params);
    console.log("Request Body:", req.body);

    const { id } = req.params; 
    console.log("Order ID from params:", id);

    if (!id) {
      console.error("Order ID is missing in request parameters.");
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await Order.findById(id);
    console.log("Retrieved Order:", order);

    if (!order) {
      console.warn("Order not found:", id);
      return res.status(404).json({ success: false, message: "Order not found" });
    }

  
    order.status = "Cancelled";
    await order.save();

    console.log("Order successfully cancelled:", order);
    res.status(200).json({ success: true, message: "Order cancelled successfully", data: order });

  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
  };
  
  const getorderhistory = async (req, res) => {
    try {
      console.log("Authenticated User:", req.user);  

      if (!req.user || !req.user.id) { 
          console.log(" User ID is missing in req.user:", req.user);
          return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
      }

    
      const userId = new mongoose.Types.ObjectId(req.user.id);  

    
      const userOrders = await Order.find({ userId }).sort({ createdAt: -1 });

      console.log(`Orders for User ${req.user.id}:`, userOrders);

      if (userOrders.length === 0) {
          return res.status(200).json({ success: true, data: [], message: "No order history found." });
      }

      res.status(200).json({ success: true, data: userOrders });
  } catch (error) {
      console.error("Error fetching order history:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
};
  const updateorderstatus = async (req, res) => {
    try {
      const { orderId, status } = req.body;
      const order = await Order.findById(orderId);
  
      if (!order) return res.status(404).json({ message: "Order not found" });
  
      order.status = status;
      order.updatedAt = new Date();
      await order.save();
  
      res.status(200).json({ success: true, message: "Order status updated", data: order });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  const latestorder = async (req, res) => {
    try {
        console.log("Incoming Request - Headers:", req.headers);
        console.log("Incoming Request - User:", req.user);

        if (!req.user || !req.user.id) {
            console.error("Unauthorized Request: No user ID found.");
            return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
        }

        const userId = req.user.id;
        console.log("🔹 Fetching latest pending order for user:", userId);

        const order = await Order.findOne({ userId, status: "Pending" })
            .sort({ createdAt: -1 })
            .select("cartId menuItem totalAmount discountAmount appliedCoupon userId") 
            .populate({
                path: "menuItem.menuItemId",
                model: "MenuItem",
                select: "name image price"
            });

        console.log("🔹 MongoDB Query Result:", order);

        if (!order) {
            console.warn(" No pending orders found for user:", userId);
            return res.status(404).json({ message: "No pending orders found." });
        }

        if (!order.cartId) {
            console.warn(" Warning: `cartId` is missing in the latest order! Generating fallback.");
        }

       
        res.json({
            success: true,
            orderId: order._id, 
            cartId: order.cartId || `cart_${order._id}`, 
            orderItems: order.menuItem,
            totalAmount: order.totalAmount,
            discountAmount: order.discountAmount,
            appliedCoupon: order.appliedCoupon,
            userId: order.userId,
            ...order._doc,
        });

    } catch (error) {
        console.error("Error fetching latest order:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
  
module.exports  = {
    
    getordersummary,
    getorderdetails,
    updateorderstatus,
    placeorder,
    cancelorder,
    getorderhistory ,
    latestorder
}