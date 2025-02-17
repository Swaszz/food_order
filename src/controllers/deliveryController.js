
const DeliveryAddress = require('../models/deliveryModel.js')
const bcrypt = require('bcryptjs')
const jwt =require("jsonwebtoken")
const tokenGenerator = require('../utils/token');
const mongoose = require ("mongoose");


const adddeliveryaddress = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(400).json({ message: "User not authenticated" });
        }

        const { street, city, state, zipCode, country, isDefault } = req.body;

        if (!street || !city || !state || !zipCode || !country) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let userAddress = await DeliveryAddress.findOne({ userId: req.user.id });

        if (userAddress) {
          
            if (isDefault) {
                userAddress.addresses.forEach(addr => addr.isDefault = false);
            }

            userAddress.addresses.push({ street, city, state, zipCode, country, isDefault });
            await userAddress.save();
        } else {
        
            userAddress = await DeliveryAddress.create({
                userId: req.user.id,
                addresses: [{ street, city, state, zipCode, country, isDefault }]
            });
        }

        res.status(201).json({ message: "Delivery address added successfully", data: userAddress });
    } catch (error) {
        console.error("Error adding delivery address:", error);
        res.status(500).json({ message: "Error adding delivery address", error });
    }
};

const getdeliveryaddress = async (req, res) => {
    try {
        const userId = req.user?.id; 
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        }

        const userAddresses = await DeliveryAddress.findOne({ userId });

        if (!userAddresses || userAddresses.addresses.length === 0) {
            return res.status(404).json({ message: "No delivery addresses found" });
        }

       
        res.status(200).json({ message: "Delivery addresses fetched successfully", data: userAddresses.addresses });

    } catch (error) {
        console.error("Error fetching delivery address:", error);
        res.status(500).json({ message: "Error fetching delivery address", error: error.message });
    }
};

const updatedeliveryaddress = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(400).json({ message: "User not authenticated" });
        }

        const { addressId, street, city, state, zipCode, country, isDefault } = req.body;

        if (!addressId) {
            return res.status(400).json({ message: "Address ID is required" });
        }

        const userAddress = await DeliveryAddress.findOne({ userId: req.user.id });

        if (!userAddress) {
            return res.status(404).json({ message: "User has no saved addresses" });
        }

       
        const addressIndex = userAddress.addresses.findIndex(addr => addr._id.toString() === addressId);

        if (addressIndex === -1) {
            return res.status(404).json({ message: "Address not found" });
        }

       
        if (street) userAddress.addresses[addressIndex].street = street;
        if (city) userAddress.addresses[addressIndex].city = city;
        if (state) userAddress.addresses[addressIndex].state = state;
        if (zipCode) userAddress.addresses[addressIndex].zipCode = zipCode;
        if (country) userAddress.addresses[addressIndex].country = country;

       
        if (isDefault) {
            userAddress.addresses.forEach(addr => addr.isDefault = false);
            userAddress.addresses[addressIndex].isDefault = true;
        }

        await userAddress.save();

        res.status(200).json({ message: "Delivery address updated successfully", data: userAddress });
    } catch (error) {
        console.error("Error updating delivery address:", error);
        res.status(500).json({ message: "Error updating delivery address", error });
    }
};


const deletedeliveryaddress = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(400).json({ message: "User not authenticated" });
        }

        const { addressId } = req.params; 
        console.log("Received addressId:", addressId); 

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({ message: "Invalid address ID format" });
        }

       
        const userAddress = await DeliveryAddress.findOne({ userId: req.user.id });

        if (!userAddress) {
            return res.status(404).json({ message: "User has no saved addresses" });
        }

      
        const addressIndex = userAddress.addresses.findIndex(addr => addr._id.toString() === addressId);

        if (addressIndex === -1) {
            return res.status(404).json({ message: "Address not found" });
        }

        userAddress.addresses.splice(addressIndex, 1); 

        await userAddress.save(); 

        res.status(200).json({ message: "Delivery address deleted successfully", data: userAddress });
    } catch (error) {
        console.error("Error deleting delivery address:", error);
        res.status(500).json({ message: "Error deleting delivery address", error });
    }
};

module.exports ={
    adddeliveryaddress,
    getdeliveryaddress,
    updatedeliveryaddress,
    deletedeliveryaddress 
}