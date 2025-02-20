const Stripe = require("stripe");
const Order = require("../models/orderModel.js");
const Payment = require("../models/paymentModel.js");

const stripe = new Stripe(process.env.STRIPE_PRIVATE_API_KEY);
const client_domain = process.env.CLIENT_DOMAIN;

const createsession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        console.log("🔵 Fetching Order for Payment:", orderId);

        // ✅ Fix: Ensure correct reference to menuItem
        const order = await Order.findById(orderId).populate("menuItem.menuItemId");

        if (!order) {
            console.error("❌ Order not found:", orderId);
            return res.status(404).json({ message: "Order not found" });
        }

        console.log("✅ Order Found:", order);

        // ✅ Fix: Ensure correct reference to menuItemId
        const lineItems = order.menuItem.map((item) => ({
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

        console.log("✅ Stripe Line Items:", lineItems);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${client_domain}/user/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${client_domain}/user/payment/cancel`,
        });

        console.log("✅ Stripe Session Created:", session.id);

        // ✅ Fix: Save session ID in order
        order.sessionId = session.id;
        await order.save();

        res.status(201).json({ success: true, sessionId: session.id });
    } catch (error) {
        console.error("❌ Error creating checkout session:", error);
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