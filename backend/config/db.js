const mongoose=require("mongoose");
const connectDB=async()=>{
    try {
        const conn=await mongoose.connect(process.env.MONGO_URI)
        console.log("mongodb Connector")
    } catch (error) {
        console.log(`Database Connection Error ${error.message}`)
    }
}
module.exports=connectDB