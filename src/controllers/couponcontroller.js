const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");

const createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, expirationDate } = req.body;

        if (!code || !discountPercentage || !expirationDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

     
        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon code already exists" });
        }

        const newCoupon = new Coupon({
            code,
            discountPercentage,
            expirationDate,
            isActive: true,
        });

        await newCoupon.save(); 

        console.log("Coupon Created Successfully:", newCoupon);
        res.status(201).json({ message: "Coupon created successfully", data: newCoupon });
    } catch (error) {
        console.error("Error creating coupon:", error);
        res.status(500).json({ message: "Error creating coupon", error });
    }
};


const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ isActive: true });
        if (!coupons.length) {
            return res.status(404).json({ message: "No active coupons found" });
        }

        console.log("Retrieved Coupons:", coupons);
        res.status(200).json({ message: "Coupons retrieved successfully", data: coupons });
    } catch (error) {
        console.error("Error fetching coupons:", error);
        res.status(500).json({ message: "Error fetching coupons", error });
    }
};

const applyCoupon = async (req, res) => {
    try {
        const { cartId, couponCode } = req.body;

        if (!cartId || !couponCode) {
            return res.status(400).json({ message: "Cart ID and Coupon Code are required" });
        }

        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        if (cart.coupon) {
            return res.status(400).json({ message: "Coupon already applied!" });
        }

        const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
        if (!coupon) {
            return res.status(400).json({ message: "Invalid coupon code" });
        }

        if (new Date() > coupon.expirationDate) {
            return res.status(400).json({ message: "Coupon has expired" });
        }

        const discountAmount = (cart.totalAmount * coupon.discountPercentage) / 100;
        const discountedPrice = cart.totalAmount - discountAmount;

        cart.coupon = couponCode;
        cart.discountAmount = discountAmount;
        cart.totalAmount = discountedPrice;
        cart.updatedAt = Date.now();

        await cart.save(); 

      
        const updatedCart = await Cart.findById(cartId);

        res.status(200).json({
            message: "Coupon applied successfully",
            cart: {
                cartId: updatedCart._id,
                cartItems: updatedCart.menuItem,
                totalAmount: updatedCart.totalAmount,
                discountAmount: updatedCart.discountAmount,
                appliedCoupon: updatedCart.coupon
            }
        });
    } catch (error) {
        console.error("Error applying coupon:", error);
        res.status(500).json({ message: "Error applying coupon", error: error.message });
    }
};
const removeCoupon = async (req, res) => {
    try {
        const { cartId } = req.body;

        if (!cartId) {
            return res.status(400).json({ message: "Cart ID is required" });
        }

        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

       
        cart.coupon = null;
        cart.discountAmount = 0;
        cart.totalAmount = cart.menuItem.reduce((acc, item) => acc + item.quantity * item.price, 0);
        cart.updatedAt = Date.now();

        await cart.save(); 

        console.log("Coupon Removed from Cart:", cart);

        res.status(200).json({ 
            message: "Coupon removed successfully", 
            cart: {
                cartId: cart._id,
                cartItems: cart.menuItem,
                totalAmount: cart.totalAmount,
                discountAmount: cart.discountAmount,
                appliedCoupon: null
            } 
        });
    } catch (error) {
        console.error("Error removing coupon:", error);
        res.status(500).json({ message: "Error removing coupon", error });
    }
};

const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params; 
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        if (!deletedCoupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        console.log("Coupon Deleted:", deletedCoupon);
        res.status(200).json({ message: "Coupon deleted successfully", data: deletedCoupon });
    } catch (error) {
        console.error("Error deleting coupon:", error);
        res.status(500).json({ message: "Error deleting coupon", error });
    }
};


const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, discountPercentage, expirationDate, isActive } = req.body;

        if (!code || !discountPercentage || !expirationDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

       
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            { code, discountPercentage, expirationDate, isActive },
            { new: true, runValidators: true } 
        );

        if (!updatedCoupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        console.log("Coupon Updated Successfully:", updatedCoupon);
        res.status(200).json({ message: "Coupon updated successfully", data: updatedCoupon });
    } catch (error) {
        console.error("Error updating coupon:", error);
        res.status(500).json({ message: "Error updating coupon", error });
    }
};



module.exports = {
    createCoupon,
    getAllCoupons,
    applyCoupon,
    removeCoupon,
    deleteCoupon,
    updateCoupon
};
