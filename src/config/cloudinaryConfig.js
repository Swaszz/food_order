const cloudinary =require("cloudinary")


cloudinary.config({ 
  cloud_name: process.env.cloud_Name, 
  api_key: process.env.api_keys, 
  api_secret:process.env.api_secrets })

  const cloudinaryInstance = cloudinary
  module.exports = cloudinaryInstance