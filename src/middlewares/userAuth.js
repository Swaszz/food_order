const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
    try {
        const { token } = req.cookies;
        console.log("Token in Cookie:", token)
       
        if (!token) {
            console.log("Token in Cookie:", token)
            return res.status(401).json({ message: "user not authorised", success: false });
        }

        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
      if (!tokenVerified) {
         return res.status(401).json({ message: "user not authorised", success: false });
        }

        req.user = tokenVerified;
        console.log("Authenticated User:", req.user);
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message || "user authorization failed", success: false });
    }
};



module.exports = userAuth