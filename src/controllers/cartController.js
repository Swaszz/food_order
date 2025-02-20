const Cart = require('../models/cartModel.js')
const MenuItem = require('../models/menuModel.js')
const User = require('../models/userModel.js')
const bcrypt = require('bcryptjs')
const jwt =require("jsonwebtoken")
const tokenGenerator = require('../utils/token');
const Restaurant = require('../models/restaurantModel.js');
const Coupon = require('../models/couponModel.js');
const mongoose = require("mongoose");

const addcart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { menuItemId, quantity } = req.body;

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({ message: "MenuItem not found" });
        }

        let cart = await Cart.findOne({ userId }).populate("menuItem.menuItemId");

        if (!cart) {
            cart = new Cart({ userId, menuItem: [] });
        }

        if (!cart.menuItem) cart.menuItem = [];

       
        const existingItem = cart.menuItem.find((item) => item.menuItemId === menuItemId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.menuItem.push({ menuItemId, price: menuItem.price, quantity });
        }

       
        cart.totalAmount = cart.menuItem.reduce((acc, item) => acc + item.quantity * item.price, 0);

       
        await cart.save();

       
        const updatedCart = await Cart.findOne({ userId }).populate("menuItem.menuItemId");

       
        res.status(200).json({ data: updatedCart, message: "Item added to cart successfully" });

    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

const getcart = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            console.error("User ID is missing from request.");
            return res.status(400).json({ message: "User authentication failed" });
        }
        const userId = req.user.id;
        console.log(userId)
        const cart = await Cart.findOne({ userId }).populate({path : "menuItem.menuItemId", model: "MenuItem"});
        if (!cart) {
            console.warn("Cart not found for user:", userId);
            return res.status(404).json({ message: "Cart is empty" });
        }

        console.log("Cart data retrieved:", cart);
    

       if (!cart.menuItem || cart.menuItem.length === 0) {
        console.warn("No items found in cart for user:", userId);
        return res.status(404).json({ message: "Cart has no items" });
    }
    const transformedCart = {
        cartId: cart._id,
        cartItems: cart.menuItem.map((item) => {
            
            if (!item.menuItemId) {
                console.warn("Missing menuItemId for cart item:", item);
                return null; 
            }

            return {
                _id: item.menuItemId._id,
                name: item.menuItemId.name,
                image: item.menuItemId.image || "/placeholder.jpg",
                price: item.menuItemId.price,
                quantity: item.quantity,
            };
        }).filter(item => item !== null), 

        totalAmount: cart.totalAmount || 0,
        appliedCoupon: cart.coupon || null,
    };

       console.log(transformedCart)
        res.status(200).json({ data: transformedCart, message: "Cart fetched successfully" });;
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};



const getCartDetails = async (req, res) => {
    try {
        const userId = req.user.id; 

        const cart = await Cart.findOne({ userId }).populate("menuItem.menuItemId");

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const cartItems = cart.menuItem.map((item) => ({
            _id: item.menuItemId._id,
            name: item.menuItemId.name || "Unnamed Item",
            image: item.menuItemId.image || "/placeholder.jpg",
            price: item.price,
            quantity: item.quantity
        }));

        res.status(200).json({
            cartId: cart._id, 
            cartItems: cartItems,
            totalAmount: cart.totalPrice || 0, 
            totalQuantity: cart.menuItem.reduce((acc, item) => acc + item.quantity, 0),
        });

        console.log(" Cart API Response:", {
            cartId: cart._id,
            cartItems: cartItems,
            totalAmount: cart.totalPrice,
            totalQuantity: cart.menuItem.length,
        }); 
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};
const deletecart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { menuItemId } = req.body;

     
        if (!menuItemId || typeof menuItemId !== "string" || !menuItemId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid or missing menuItemId" });
        }

        let cart = await Cart.findOne({ userId }).populate("menuItem.menuItemId");

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

       
        const itemIndex = cart.menuItem.findIndex(item => item.menuItemId._id.toString() === menuItemId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        cart.menuItem.splice(itemIndex, 1);

        if (cart.menuItem.length === 0) {
            await Cart.findByIdAndDelete(cart._id);
            return res.status(200).json({ message: "Cart is now empty and has been deleted" });
        }

        cart.totalAmount = cart.menuItem.reduce((acc, item) => acc + item.quantity * item.price, 0);
        cart.totalQuantity = cart.menuItem.reduce((acc, item) => acc + item.quantity, 0);

        console.log("Recalculated Total Amount:", cart.totalAmount);
        console.log("Recalculated Total Quantity:", cart.totalQuantity);

        await cart.save();

        res.status(200).json({
            message: "Menu item removed from cart",
            data: {
                cartId: cart._id,
                cartItems: cart.menuItem,
                totalAmount: cart.totalAmount,
                totalQuantity: cart.totalQuantity,
            },
        });

        console.log("Updated Cart Response:", cart);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
const updateQuantity = async (req, res) => {
    try {
        const { cartId, menuItemId, quantity } = req.body;

        if (!cartId || !menuItemId || quantity < 1) {
            return res.status(400).json({ message: "Invalid request parameters" });
        }

        const cart = await Cart.findById(cartId).populate("menuItem.menuItemId");
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const item = cart.menuItem.find(item => item.menuItemId._id.toString() === menuItemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        item.quantity = quantity;

        cart.totalAmount = cart.menuItem.reduce((acc, item) => acc + item.quantity * item.menuItemId.price, 0);
        await cart.save();

        res.status(200).json({ data: cart, message: "Quantity updated successfully" });

    } catch (error) {
        console.error("Error updating quantity:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

const proceedToCheckout = async (req, res) => {
    try {
      

        const { cartId } = req.body;
        const userId = req.user.id;

        const cart = await Cart.findOne({ _id: cartId, userId }).populate("menuItem.menuItemId");

        if (!cart) {
            console.log("Cart NOT FOUND!");
            return res.status(404).json({ message: "Cart not found" });
        }

        if (!cart.menuItem.length) {
            console.log("Cart is empty!");
            return res.status(400).json({ message: "Cart is empty. Add items before checkout." });
        }

        console.log("Checkout Success!");
        res.status(200).json({
            message: "Checkout successful!",
            data: {
                cartId: cart._id,
                userId: cart.userId,
                totalAmount: cart.totalAmount,
                totalQuantity: cart.totalQuantity,
                cartItems: cart.menuItem.map(item => ({
                    name: item.menuItemId.name,
                    price: item.menuItemId.price,
                    quantity: item.quantity
                }))
            }
        });
    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

const emptycart = async (req, res) => {
    try {
        const { cartId } = req.body;
        const userId = req.user.id; 

        const cart = await Cart.findOne({ _id: cartId, userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

      
        cart.menuItem = [];  
        cart.totalAmount = 0;
        cart.discountAmount = 0; 
        cart.coupon = null; 

        await cart.save();

        res.status(200).json({
            message: "Cart emptied successfully",
            data: cart,
        });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports  = {
    addcart,
    getcart,
    getCartDetails,
    proceedToCheckout,
    updateQuantity,
    deletecart,
    emptycart,
   
}





 

 