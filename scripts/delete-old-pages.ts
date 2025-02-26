import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const DB_NAME = "olgatravel";

async function deleteOldPages() {
  console.log("Starting deletion of old pages...");
  
  // Check if MongoDB URI is available
  if (!process.env.MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  let client: MongoClient | null = null;

  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log("Connected to MongoDB successfully");

    // Get database and collection
    const db = client.db(DB_NAME);
    const pagesCollection = db.collection("pages");

    // Count total documents before deletion
    const totalDocuments = await pagesCollection.countDocuments();
    console.log(`Total documents in pages collection: ${totalDocuments}`);

    if (totalDocuments <= 1) {
      console.log("There is only one or zero documents in the collection. No deletion needed.");
      return;
    }

    // Find the latest document based on updatedAt field (or createdAt as fallback)
    const latestPage = await pagesCollection
      .find({})
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(1)
      .toArray();

    if (latestPage.length === 0) {
      console.log("No documents found in the pages collection.");
      return;
    }

    const latestPageId = latestPage[0]._id;
    console.log(`Latest page ID: ${latestPageId}`);

    // Delete all documents except the latest one
    const deleteResult = await pagesCollection.deleteMany({
      _id: { $ne: latestPageId }
    });

    console.log(`Deleted ${deleteResult.deletedCount} documents from pages collection`);
    console.log(`Kept the latest document with ID: ${latestPageId}`);

    // Count remaining documents
    const remainingDocuments = await pagesCollection.countDocuments();
    console.log(`Remaining documents in pages collection: ${remainingDocuments}`);

  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    // Close the connection
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
}

// Run the function
deleteOldPages()
  .then(() => console.log("Script completed successfully"))
  .catch((error) => console.error("Script failed:", error)); 