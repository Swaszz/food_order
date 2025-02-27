const Order = require("../models/orderModel.js");
const Cart = require("../models/cartModel");
const Payment = require("../models/paymentModel.js");
const Stripe = require('stripe');
const stripe=  new Stripe(process.env.Stripe_Private_Api_Key);
const client_domain = process.env.CLIENT_DOMAIN;
const createsession = async (req, res) => {
    try {
        const { cartId } = req.body;
        if (!cartId) {
            console.error("Cart ID is missing in request");
            return res.status(400).json({ message: "Cart ID is required" });
        }

        console.log(" Fetching Cart for Payment:", cartId);
        const cart = await Cart.findById(cartId).populate("menuItem.menuItemId");
        if (!cart) {
            console.error("Cart not found:", cartId);
            return res.status(404).json({ message: "Cart not found" });
        }
        console.log("Cart Found:", cart);

        const order = await Order.findOne({ cartId: cartId });
        if (!order) {
            console.error(" Order not found for Cart ID:", cartId);
            return res.status(404).json({ message: "Order not found" });
        }

        let totalPrice = 0;
        let discountAmount = cart.discountAmount ?? 0;
        let discountInPaise = Math.round(discountAmount * 100); 
        let lineItems = [];

        cart.menuItem.forEach((item, index) => {
            let finalPrice = item.discountedPrice ?? item.price;
            let unitAmount = Math.round(finalPrice * 100); 
            totalPrice += unitAmount;

           
            if (index === 0 && discountInPaise > 0) {
                unitAmount -= discountInPaise;
                unitAmount = Math.max(unitAmount, 0); 
            }

            console.log(`Item: ${item.menuItemId?.name}, Price: ₹${unitAmount / 100}`);

            lineItems.push({
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: item.menuItemId?.name || "Unnamed Item",
                        images: item.menuItemId?.image ? [item.menuItemId.image] : [],
                        description: `Payment for ${item.quantity} ${item.menuItemId?.name || "items"}`,
                    },
                    unit_amount:  unitAmount,
                },
                quantity: item.quantity,
            });
        });

       
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${client_domain}/user/success`,
            cancel_url: `${client_domain}/user/cancel`,
        });

        console.log(" Stripe Session Created:", session.id);
        res.status(201).json({ success: true, sessionId: session.id, orderId: order._id });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(error.statusCode || 500).json({ message: "Internal Server Error" });
    }
};

const getsession = async (req, res) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        res.status(200).json({
            status: session?.status,
            customer_email: session?.customer_details?.email,
            session_data: session,
        });
    } catch (error) {
        console.error("Error retrieving session status:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
    }
};

module.exports = {
    createsession,
    getsession
};