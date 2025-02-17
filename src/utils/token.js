
const jwt =require("jsonwebtoken")

 const tokenGenerator = (id, role ) => {
    try {
        const token = jwt.sign({ id: id, role: role  }, process.env.JWT_SECRET_KEY);
        return token;
    } catch (error) {
        console.log(error);
    }
};


module.exports= tokenGenerator;