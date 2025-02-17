const MenuItem = require('../models/menuModel.js')
const Restaurant = require('../models/restaurantModel.js')
const Review = require('../models/reviewModel.js');
const bcrypt = require('bcryptjs')
const jwt =require("jsonwebtoken")
const tokenGenerator = require('../utils/token');
const cloudinaryInstance = require('../config/cloudinaryConfig.js');



const createmenuItem = async (req,res,next)=>{
    try{
        const { name, description,price,category, availability ,restaurantId } = req.body;
        console.log("Request Body:", req.body);
        let  cloudinaryResponse 

        if( !name || !description || !price || !category || ! availability ){
            return res.status(400).json({message:"All fields are required"})
        }

        console.log('image ===',req.file)

        if(req.file){
             cloudinaryResponse = await cloudinaryInstance.uploader.upload(req.file.path);
        }
      
        console.log("response ===" , cloudinaryResponse)
           const menuitemData = new MenuItem ({name, description,price,category,image:cloudinaryResponse.url, availability ,restaurantId, });
          
            await menuitemData.save();
    
    
            return res.json({ data: menuitemData, message: "Menuitem created" });
        
    }catch(error){
        return res.status(error.statusCode || 500).json({message: error.message || "internal server error"})
    }
}



const getmenuItem = async (req,res,next)=>{
    try{
         const menuitemList = await MenuItem.find() .select("-description")
           
            return res.json({ data: menuitemList, message: "Menuitem fetched" });
        
    }catch(error){
        return res.status(error.statusCode || 500).json({message: error.message || "internal server error"})
    }
}


const getmenuItemDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const menuItemDetails = await MenuItem.findById(id).populate("restaurantId").lean();

       const reviews = await Review.find({ restaurantId: menuItemDetails.restaurantId?._id });

        const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : "No rating yet";

        menuItemDetails.restaurantRating = averageRating;
        console.log('Populated Single MenuItem:', menuItemDetails );
        return res.json({ data: menuItemDetails, message: "Menuitem Details  fetched " });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};



const updatemenuItem = async (req, res, next) => {
    try {
      
        const { id} = req.params;
        const {name, description, price, category, availability} = req.body; 

        let  cloudinaryResponse 

        console.log('image ===',req.file)

        if(req.file){
             cloudinaryResponse = await cloudinaryInstance.uploader.upload(req.file.path);
        }
      
        console.log("response ===" , cloudinaryResponse)

    
        const updateData = await MenuItem.findById(id);

        if (!updateData) {
            return res.status(404).json({ message: "Menu item not found" });
        }


        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = price;
        if (category) updateData.category = category;
        if (availability) updateData.availability = availability;
        if (cloudinaryResponse) updateData.image = cloudinaryResponse.url;

        await updateData.save();

        return res.json({ data: updateData, message: "Menu item updated successfully" });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

const getmenuItemcategory = async (req, res) => {
    try {

        const category = await MenuItem.aggregate([
            { $sort: { createdAt: -1 } },  
            { $group: { _id: "$category", image: { $first: "$image" } } }
        ]);

        if (!category.length) {
            return res.status(404).json({ message: "No categories found" });
        }

        res.status(200).json({ data: category, message: "Categories fetched successfully" });

    } catch (error) {
        console.error("Error fetching menu items by category:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

const getMenuItemCategorydetails = async (req, res) => {
    try {
        const { categoryName } = req.params; 

        if (!categoryName) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const menuItems = await MenuItem.find({ category: categoryName });

        if (!menuItems.length) {
            return res.status(404).json({ message: "No menu items found for this category" });
        }

        res.status(200).json({ data: menuItems, message: "Menu items fetched successfully" });

    } catch (error) {
        console.error("Error fetching menu items by category:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};



const deletemenuItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedMenuItem = await MenuItem.findOneAndDelete({ _id: id });

        if (!deletedMenuItem) {
            return res.status(404).json({ message: "No menu items found to delete" });
        }

        return res.json({ data: deletedMenuItem, message: "Menu item deleted successfully" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};
const searchMenuItems = async (req, res) => {
    try {
        const { query } = req.query; 

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

      
        const menuItems = await MenuItem.find({
            $or: [
                { name: { $regex: query, $options: "i" } }, 
                { description: { $regex: query, $options: "i" } }, 
                { restaurant: { $regex: query, $options: "i" } } 
            ]
        });

        if (menuItems.length === 0) {
            return res.status(404).json({ message: "No matching menu items found" });
        }

        return res.status(200).json({ data: menuItems, message: "Search results fetched successfully" });
    } catch (error) {
        console.error("Error searching menu items:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports  = {
    createmenuItem,
    getmenuItem,
    getmenuItemDetails,
    updatemenuItem,
    getmenuItemcategory,
    deletemenuItem,
    searchMenuItems,
    getMenuItemCategorydetails
}