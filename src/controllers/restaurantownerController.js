
const Restaurantowner = require('../models/restaurantownerModel.js')
const bcrypt = require('bcryptjs')
const jwt =require("jsonwebtoken")
const tokenGenerator = require('../utils/token');
const NODE_ENV = process.env.NODE_ENV;


const restaurantownerRegister = async (req, res, next) => {
    try {
        const { name, address, email, password, phone, profilePic, role } = req.body;


        if (!name || !address || !email || !password || !phone || !role) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

       
        const isperson = await  Restaurantowner.findOne({ email });
        if (isperson) {
            return res.status(400).json({ message: "person already exists", success: false });
        }
        
        
        const hashedPassword = bcrypt.hashSync(password, 10);
      
        const personData = new Restaurantowner({ name,address,email,password: hashedPassword,phone,profilePic,role});
        await personData.save();

        const token = tokenGenerator(personData._id,personData.role);
        res.cookie("token", token, {
            sameSite: NODE_ENV === "production" ? "None" : "Lax",
            secure: NODE_ENV === "production",
            httpOnly: NODE_ENV === "production",
        });
        if (personData.role === "admin") {
            return res.status(201).json({data: personData,message: "Admin account created successfully",success: true,});
        } else if (personData.role === "restaurantOwner") {
            return res.status(201).json({data: personData,message: "Restaurant owner account created successfully",success: true,});
        }
    } catch (error) {
        return res.status(500).json({message: error.message || "Internal server error",success: false,});
    }
};




const restaurantownerlogin = async (req,res,next)=>{
    try{
      
        const {  email, password} = req.body;

        if( !email || !password ){
            return res.status(400).json({message:"All fields are required"})
        }
            
           const UserExist = await  Restaurantowner.findOne({ email });
            if (!UserExist) {
                return res.status(404).json({ message: "user does not exist" });
            }
          
            const passwordMatch = bcrypt.compareSync(password, UserExist.password);

            if (!passwordMatch) {
                return res.status(401).json({ message: "user not authenticated" });
            }
    
            const token = tokenGenerator( UserExist._id, UserExist.role);
            res.cookie("token", token, {
                sameSite: NODE_ENV === "production" ? "None" : "Lax",
                secure: NODE_ENV === "production",
                httpOnly: NODE_ENV === "production",
            });
          

            if (UserExist.role === "restaurantOwner") {
                return res.status(200).json({data:  UserExist,message: "Restaurant owner logged in successfully",success: true,
                });
            }
          
            if (UserExist.role === "admin") {
                return res.status(200).json({data:UserExist, message: "Admin logged in successfully",success: true,
                });
            }
            
           
            return res.status(403).json({ message: "Access denied. Role not recognized.",success: false,
            });
    
          
        } catch (error) {
            return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
        }
    };



    const restaurantownerProfile = async (req, res, next) => {
        try {
            console.log("🔹 API Request Received - Fetching Profile");
    
           
            if (!req.person) {
                console.log("Authentication Failed: req.person is undefined");
                return res.status(401).json({ message: "Unauthorized: Invalid token" });
            }
    
            const personRole = req.person.role;
            const personId = req.person.id;
    
            console.log("🔹 User Role:", personRole);
            console.log("🔹 User ID:", personId);
    
          
            if (!personId) {
                return res.status(400).json({ message: "Invalid request: Missing user ID" });
            }
    
           
            const personData = await Restaurantowner.findById(personId).select("-password");
            if (!personData) {
                console.log("Profile Not Found in Database");
                return res.status(404).json({ message: "Profile not found", success: false });
            }
    
            console.log("Fetched Profile Data:", personData);
    
           
            if (personRole.toLowerCase() === "restaurantowner") {
                return res.status(200).json({
                    message: "Restaurant owner profile fetched successfully.",
                    data: personData,
                    success: true,
                });
            }
    
            if (personRole.toLowerCase() === "admin") {
                return res.status(200).json({
                    message: "Admin profile fetched successfully.",
                    data: personData,
                    success: true,
                });
            }
    
            console.log(" Access Denied: User does not have correct permissions");
            return res.status(403).json({ message: "Access denied. Insufficient permissions.", success: false });
    
        } catch (error) {
            console.error("Error Fetching Profile:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
    

    const restaurantowner = async (req, res) => {
        try {
          const owner = await Restaurantowner.findById(req.person.id).select("name email");
      
          if (!owner) {
            return res.status(404).json({ message: "Restaurant owner not found" });
          }
      
          res.json(owner);
        } catch (error) {
          console.error(" Error fetching owner details:", error);
          res.status(500).json({ message: "Internal server error" });
        }
      };


const restaurantownerLogout = async (req, res, next) => {
    try {
        res.clearCookie("token", {
            sameSite: NODE_ENV === "production" ? "None" : "Lax",
            secure: NODE_ENV === "production",
            httpOnly: NODE_ENV === "production",
        });

        return res.json({ message: "logout success" });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};


const updaterestaurantownerProfile = async (req, res, next) => {
    try {
        const personId = req.person.id;
        console.log("Request Body:", req.body);

        const { name, address, phone, profilePic, password } = req.body;

        const dealer = await Restaurantowner.findById(personId);
        if (!dealer) {
            return res.status(404).json({ message: "dealer not found" });
        }

        if (name) dealer.name = name;
        if (address) dealer.address = address;
        if (phone) dealer.phone = phone;
        if (profilePic) dealer.profilePic = profilePic;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            dealer.password = hashedPassword;
        }


        await dealer.save();


        return res.status(200).json({message: "Profile updated successfully",data: dealer });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};


const checkrestaurantowner = async (req, res, next) => {
    try {

        res.json({ success: true, message: "restaurantowner autherized" });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json(error.message || 'Internal server error')
    }
};

module.exports = {
    restaurantownerRegister,
    restaurantownerlogin,
    restaurantownerProfile,
    restaurantownerLogout,
    updaterestaurantownerProfile,
    checkrestaurantowner,
    restaurantowner
};
