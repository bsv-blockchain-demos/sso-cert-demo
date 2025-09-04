import { MongoClient, ServerApiVersion, Db, Collection } from "mongodb";
import { config } from "dotenv";
config();

console.log({
  serverEnv: process.env
})

interface SignedCertificate {
  fields: Record<string, string>;
  type: string;
  serialNumber: string;
  subject: string;
  certifier: string;
  revocationOutpoint: string;
  signature: string;
}

export interface User {
  _id: string;
  updatedAt: Date;
  createdAt: Date;
  signedCertificate: SignedCertificate;
}

// Use environment variable for MongoDB URI or fallback to hardcoded value
const uri = process.env.MONGODB_URI as string;
const clusterName = process.env.MONGODB_CLUSTER_NAME as string;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database and collections
let db: Db;
let usersCollection: Collection<User>;

// Connect to MongoDB
async function connectToMongo() {
  if (!db) {
    try {
      // Connect the client to the server
      await client.connect();
      console.log("Connected to MongoDB!");
      
      // Initialize database and collections
      db = client.db(clusterName);
      usersCollection = db.collection("users");
      
      // Create indexes for better performance
      await usersCollection.createIndex({ "_id": 1 });
      await usersCollection.createIndex({ "signedCertificate": 1 });
      
      // Note: _id is automatically unique in MongoDB, no need for custom id field
      
      console.log("MongoDB indexes created successfully");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }
  return { db, usersCollection };
}

// Connect immediately when this module is imported
connectToMongo().catch(console.error);

// Handle application shutdown
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during MongoDB shutdown:', error);
    process.exit(1);
  }
});

export { connectToMongo, usersCollection };
