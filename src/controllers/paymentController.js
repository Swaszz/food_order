const Stripe = require("stripe");

const Order = require("../models/orderModel.js");
const Payment = require("../models/paymentModel.js")
const stripe = new Stripe(process.env.Stripe_Private_Api_Key);
const client_domain = process.env.CLIENT_DOMAIN;

const createsession = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.body; // Order ID from frontend

        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        const order = await Order.findById(orderId).populate("items.menuItemId");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const lineItems = order.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.menuItemId.name || "Unnamed Item",
                    images: item.menuItemId.image ? [item.menuItemId.image] : [],
                },
                unit_amount: Math.round(item.menuItemId.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${client_domain}/user/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${client_domain}/user/payment/cancel`,
        });

        // Update order with session ID
        order.sessionId = session.id;
        await order.save();

        res.status(201).json({ success: true, sessionId: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
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