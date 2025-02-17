const Order = require('../models/orderModel.js')
const bcrypt = require('bcryptjs')
const jwt =require("jsonwebtoken")
const tokenGenerator = require('../utils/token');

const getordersummary = async (req, res) => {
    try {
      const userId = req.user.id; 
      const orders = await Order.find({ userId }).populate("menuItem.menuItemId").populate("deliveryAddress");
  
      if (!orders) return res.status(404).json({ message: "No orders found" });
  
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      console.error(" Error fetching orders:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  
const  placeorder = async (req, res) => {
    try {
      console.log("🛒 Order Received:", req.body);

    const newOrder = new Order({
      menuItem: req.body.menuItem.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: req.body.totalAmount,
      discountAmount: req.body.discountAmount || 0,
      appliedCoupon: req.body.appliedCoupon || null,
      deliveryAddress: req.body.deliveryAddress, 
    });

    await newOrder.save();

    console.log(" Order Saved in DB:", newOrder);
    res.status(201).json({ success: true, data: newOrder });

  } catch (error) {
    console.error("Error Placing Order:", error);
    res.status(500).json({ error: "Failed to place order" });
    }
  };

  const getorderdetails = async (req, res) => {
    try {
      const { orderId } = req.body;
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
      const { orderId } = req.body;
      const order = await Order.findById(orderId);
  
      if (!order) return res.status(404).json({ message: "Order not found" });
  
      order.status = "Cancelled";
      await order.save();
  
      res.status(200).json({ success: true, message: "Order cancelled successfully", data: order });
    } catch (error) {
      console.error(" Error canceling order:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  const getorderhistory = async (req, res) => {
    try {
      console.log("Authenticated User ID:", req.user.id); // ✅ Debugging
  
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
      }
  
      const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  
      console.log(`Orders for User ${req.user.id}:`, orders); // ✅ Debugging
  
      res.status(200).json({ success: true, data: orders });
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
module.exports  = {
    
    getordersummary,
    getorderdetails,
    updateorderstatus,
    placeorder,
    cancelorder,
    getorderhistory 
}