const Stripe = require("stripe");

const Order = require("../models/orderModel.js");
const Payment = require("../models/paymentModel.js")
const stripe = new Stripe(process.env.Stripe_Private_Api_Key);
const client_domain = process.env.CLIENT_DOMAIN;

const createsession = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { products } = req.body;

        const lineItems = products.map((product) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: product?.name,
                    images: [product?.image],
                },
                unit_amount: Math.round(product?.price * 100),
            },
            quantity: product?.quantity || 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${client_domain}/user/payment/success`,
            cancel_url: `${client_domain}/user/payment/cancel`,
        });

        const newOrder = new Order({ userId, sessionId: session.id });
        await newOrder.save();

        res.json({ success: true, sessionId: session.id });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

const getsession = async (req, res) => {
    try {
        const sessionId = req.query.session_id;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.send({
            status: session?.status,
            customer_email: session?.customer_details?.email,
            session_data: session,
        });
    } catch (error) {
        res.status(error?.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

module.exports = {
    createsession,
    getsession
};