const Restaurant = require ("../models/restaurantModel.js");
const  Review = require ( "../models/reviewModel.js");


 const addreview = async (req, res) => {
    try {
        const { restaurantId, rating, comment } = req.body;
        const userId = req.user.id;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "restaurant not found" });
        }

        if (rating > 5 || rating <= 1) {
            return res.status(400).json({ message: "Please provide a proper rating" });
        }

        const review = await Review.findOneAndUpdate({ userId, menuItemId }, 
            { rating, comment, restaurantId }, 
            { new: true, upsert: true });

        res.status(201).json({ data: review, message: "review added successfully" });
    } catch (error) {
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
        const { restaurantId } = req.params;

        const reviews = await Review.find({ restaurantId });

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this course" });
        }

        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

        res.status(200).json({ data: averageRating, message: "avg reviews fetched" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};


module.exports={
    addreview ,
    getrestaurantreview,
    deletereview ,
    getaveragerating

}