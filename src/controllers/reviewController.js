const Restaurant = require ("../models/restaurantModel.js");
const  Review = require ( "../models/reviewModel.js");


 const addreview = async (req, res) => {
    try {
        const { restaurantId, menuItemId, rating, comment } = req.body;
        const userId = req.user.id;

        // Ensure menuItemId is provided
        if (!menuItemId) {
            return res.status(400).json({ message: "Menu item ID is required." });
        }

        // Ensure the restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Ensure rating is between 1 and 5
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5." });
        }

        // ✅ Check if the user has purchased this menu item
        const hasPurchased = await Order.findOne({
            userId,
            menuItem: menuItemId,  // Ensure menu item exists in their completed orders
            status: "Completed"
        });

        if (!hasPurchased) {
            return res.status(403).json({ message: "You can only review items you have purchased." });
        }

        const review = await Review.findOneAndUpdate(
            { userId, menuItemId }, 
            { rating, comment, restaurantId }, 
            { new: true, upsert: true } // Upsert allows updating or creating a new review
        );

        res.status(201).json({ data: review, message: "Review added successfully" });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

 const getrestaurantreview = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const reviews = await Review.find({ restaurantId }).populate("userId", "name").sort({ createdAt: -1 });

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this restaurant" });
        }

        res.status(200).json({ data: reviews, message: "reviews fetched successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};

const getMenuItemReview = async (req, res) => {
    try {
        const { menuItemId } = req.params;

        const reviews = await Review.find({ menuItemId })
            .populate("userId", "name")
            .sort({ createdAt: -1 });

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this menu item" });
        }

        res.status(200).json({ data: reviews, message: "Menu item reviews fetched successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};

 const deletereview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findOneAndDelete({ _id: reviewId, userId });

        if (!review) {
            return res.status(404).json({ message: "Review not found " });
        }

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};

 const getaveragerating = async (req, res) => {
    try {
        const { menuItemId } = req.params;

        const reviews = await Review.find({ menuItemId });

        if (!reviews.length) {
            return res.status(200).json({ data: 0, message: "No reviews found for this menu item." });
        }

        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

        res.status(200).json({ data: averageRating.toFixed(1), message: "Average rating fetched successfully." });
    } catch (error) {
        console.error("❌ Error fetching average rating:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};


module.exports={
    addreview ,
    getrestaurantreview,
    deletereview ,
    getaveragerating,
    getMenuItemReview

}