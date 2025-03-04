
const  User = require('../models/userModel.js')
const bcrypt = require('bcryptjs')
const jwt =require("jsonwebtoken")
const tokenGenerator = require('../utils/token');
const NODE_ENV = process.env.NODE_ENV;

const userRegister = async (req,res,next)=>{
    try{
        const { name, address, email, password, phone, profilePic } = req.body;

        if( !name || !address || !email || !password || !phone ){
            return res.status(400).json({message:"All fields are required"})
        }
            
           const isUserExist = await User.findOne({ email });
            if (isUserExist) {
                return res.status(400).json({ message: "user already exist" });
            }
    
            const hashedPassword = bcrypt.hashSync(password, 10);
    
            const userData = new User({ name,address, email, password: hashedPassword, phone, profilePic });
            await userData.save();
    
            const token = tokenGenerator(userData._id);
            res.cookie("token", token, {
                sameSite: NODE_ENV === "production" ? "None" : "Lax",
                secure: NODE_ENV === "production",
                httpOnly: NODE_ENV === "production",
            });
    
            return res.json({ data: userData, message: "user account created" });
        
    }catch(error){
        return res.status(error.statusCode || 500).json({message: error.message || "internal server error"})
    }
}





const userLogin= async (req,res,next)=>{
    try{
        const {  email, password} = req.body;

        if( !email || !password ){
            return res.status(400).json({message:"All fields are required"})
        }
            
           const UserExist = await User.findOne({ email });
            if (!UserExist) {
                return res.status(404).json({ message: "user does not exist" });
            }
    
            const passwordMatch = bcrypt.compareSync(password, UserExist.password);

            if (!passwordMatch) {
                return res.status(401).json({ message: "user not authenticated" });
            }
    
            const token = tokenGenerator( UserExist._id);
            res.cookie("token", token, {
                sameSite: NODE_ENV === "production" ? "None" : "Lax",
                secure: NODE_ENV === "production",
                httpOnly: NODE_ENV === "production",
            });
            
            return res.json({ data:  UserExist, message: "user Signin success" });
        } catch (error) {
            return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
        }
    };


 const userProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const userData = await User.findById(userId).select("-password");
        return res.json({ data: userData, message: "user profile found " });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};




const userLogout = async (req, res, next) => {
    try {
        res.clearCookie("token",  {
            sameSite: NODE_ENV === "production" ? "None" : "Lax",
            secure: NODE_ENV === "production",
            httpOnly: NODE_ENV === "production",
         
        });

        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Error destroying session:", err);
                    return res.status(500).json({ message: "Error logging out" });
                }
            });
        }

        return res.json({ message: "user logout success" });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};


const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.id; 

        const { name, address, phone, profilePic, password } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name;
        if (address) user.address = address;
        if (phone) user.phone = phone;
        if (profilePic) user.profilePic = profilePic;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        
        await user.save();

        return res.status(200).json({
            message: "User profile updated successfully",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                address: user.address,
                phone: user.phone,
                profilePic: user.profilePic,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};



 const checkuser = async (req, res, next) => {
    try {
        return res.json({ message: "user autherized" });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};
  
module.exports = {
    userRegister,
    userLogin,
    userProfile,
    userLogout,
    updateUserProfile,
    checkuser
};
