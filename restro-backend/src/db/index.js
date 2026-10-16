import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log("Checking MONGO_URL:", process.env.MONGO_URL);
        const connectionInstance = await mongoose.connect(process.env.MONGO_URL);
        console.log(`\n☘️  MongoDB connected successfully! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB connection FAILED: ", error.message);
        process.exit(1);
    }
};

export default connectDB;