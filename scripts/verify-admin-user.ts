import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import * as bcrypt from "bcryptjs";

dotenv.config();

const DB_NAME = "tourtovalencia";

async function verifyAdminUser() {
  console.log("Verifying admin user exists...");

  if (!process.env.MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined");
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const adminCollection = db.collection("adminuser");

    const admin = await adminCollection.findOne({});
    
    if (!admin) {
      console.log("❌ RED: Admin user does not exist");
      process.exit(1);
    }

    console.log("✅ GREEN: Admin user exists");
    console.log(`   Username: ${admin.username}`);
    console.log(`   Created: ${admin.createdAt}`);

    // Verify password can be checked
    const testPassword = "Jva-Mva-5171";
    const isValid = await bcrypt.compare(testPassword, admin.password);
    
    if (isValid) {
      console.log("✅ GREEN: Password verification works");
    } else {
      console.log("❌ RED: Password does not match");
      process.exit(1);
    }

    process.exit(0);
  } finally {
    await client.close();
  }
}

verifyAdminUser();