import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const {
  MONGO_DB_USER,
  MONGO_DB_PW,
  MONGO_DB_CLUSTER,
  MONGO_DB_HOST,
  MONGO_DB_DBName,
} = process.env;

const mongoURI = `mongodb+srv://${encodeURIComponent(
  MONGO_DB_USER
)}:${encodeURIComponent(
  MONGO_DB_PW
)}@${MONGO_DB_CLUSTER}.${MONGO_DB_HOST}/?retryWrites=true&w=majority&appName=${MONGO_DB_CLUSTER}`;

const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function connectToDB() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  console.log("connect to DB ", process.env.MONGO_DB_DBName);
  const db = client.db(MONGO_DB_DBName);
  return db;
}
