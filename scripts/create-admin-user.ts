import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import * as bcrypt from "bcryptjs";

dotenv.config();

const DB_NAME = "tourtovalencia";
const ADMIN_USERNAME = "jaime";
const ADMIN_PASSWORD = "Jva-Mva-5171";

async function createAdminUser() {
  console.log("Creating admin user...");

  if (!process.env.MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined");
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const adminCollection = db.collection("adminuser");

    // Check if admin already exists
    const existingAdmin = await adminCollection.findOne({});
    if (existingAdmin) {
      console.log("Admin user already exists. Updating password...");
      
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await adminCollection.updateOne(
        { _id: existingAdmin._id },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          }
        }
      );
      console.log("✅ Admin password updated successfully");
      return;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    await adminCollection.insertOne({
      username: ADMIN_USERNAME,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("✅ Admin user created successfully");
    console.log(`   Username: ${ADMIN_USERNAME}`);
  } finally {
    await client.close();
  }
}

createAdminUser();