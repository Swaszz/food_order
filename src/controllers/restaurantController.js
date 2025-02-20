const Restaurant = require('../models/restaurantModel.js')
const Review = require('../models/reviewModel.js')
const MenuItem = require('../models/menuModel.js')
const bcrypt = require('bcryptjs')
const jwt =require("jsonwebtoken")
const tokenGenerator = require('../utils/token');
const Restaurantowner = require("../models/restaurantownerModel.js");


const addrestaurant = async (req, res) => {
  try {
      const { name, address, phone, email } = req.body;

      console.log("Received Data:", req.body);

      if (!name || !address || !phone || !email) {
          return res.status(400).json({ message: "All fields are required" });
      }
     
      const newRestaurant = new Restaurant({
          name,
          address,
          phone,
          email,
      });

      await newRestaurant.save();

      res.status(201).json({
          message: "Restaurant added successfully",
          data: newRestaurant,
      });
  } catch (error) {
      console.error("Error adding restaurant:", error);
      res.status(500).json({ message: "Internal server error", error });
  }
};
  const getrestaurant = async (req, res) => {
    try {
      const restaurants = await Restaurant.find()
        .populate("restaurantownerId", "name email phone") 
        .lean();
  
      res.status(200).json({
        message: "Restaurants fetched successfully",
        data: restaurants,
      });
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  };



  const getrestaurantDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        
        const restaurantDetails = await Restaurant.findById(id)
            .populate("menuitem")  
            .lean();

        if (!restaurantDetails) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        const reviews = await Review.find({ restaurantId: restaurantDetails._id });

        
        const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : 0;

        restaurantDetails.averageRating = averageRating;

        console.log(restaurantDetails);
        return res.json({ data: restaurantDetails, message: "Restaurant details fetched successfully" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

const updaterestaurant = async (req, res) => {
  try {
      const { id } = req.params;
      const { name, address, phone, email, restaurantOwner } = req.body; 
      const restaurant = await Restaurant.findById(id);

      if (!restaurant) {
          return res.status(404).json({ message: "Restaurant not found" });
      }

      let owner = restaurant.restaurantownerId;
      if (restaurantOwner) {
          let existingOwner = await Restaurantowner.findOne({ name: restaurantOwner });
          if (!existingOwner) {
              existingOwner = new Restaurantowner({ name: restaurantOwner, email, phone });
              await existingOwner.save();
          }
          owner = existingOwner._id;
      }

 
      if (name) restaurant.name = name;
      if (address) restaurant.address = address;
      if (phone) restaurant.phone = phone;
      if (email) restaurant.email = email;
      restaurant.restaurantownerId = owner; 
      await restaurant.save();

      res.json({ message: "Restaurant updated successfully", data: restaurant });
  } catch (error) {
      console.error("Error updating restaurant:", error);
      res.status(500).json({ message: "Internal server error", error });
  }
};
const deleterestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedRestaurant = await Restaurant.findOneAndDelete({ _id: id });

        if (!deletedRestaurant) {
            return res.status(404).json({ message: "No Restaurant found to delete" });
        }

        return res.json({ data: deletedRestaurant, message: "Restaurant deleted successfully" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};
module.exports  = {
    addrestaurant,
    getrestaurant,
    getrestaurantDetails,
    updaterestaurant,
    deleterestaurant
}