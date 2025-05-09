import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const { MONGO_DB_URI } = process.env;

// const client = new MongoClient(mongoURI, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

export async function connectToDB() {
  try {
    await mongoose.connect(MONGO_DB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}
