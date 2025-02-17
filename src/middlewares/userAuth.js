const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: "user not authorised", success: false });
        }

        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        if (!tokenVerified) {
            return res.status(401).json({ message: "user not authorised", success: false });
        }

        req.user = tokenVerified;

        next();
    } catch (error) {
        return res.status(401).json({ message: error.message || "user authorization failed", success: false });
    }
};



module.exports = userAuth