const jwt = require("jsonwebtoken");

const restaurantownerAuth =  (req, res, next) => {
    try {
       
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: "not authorised", success: false });
        }

        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        if (!tokenVerified) {
            return res.status(401).json({ message: "user not authorised", success: false });
        }
        req.person = tokenVerified;

        if(tokenVerified.role != 'restaurantOwner' && tokenVerified.role !='admin'){
            return res.status(401).json({ message: "user not authorised", success: false });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: error.message || "user authorization failed", success: false });
    }
};



module.exports = restaurantownerAuth ;

