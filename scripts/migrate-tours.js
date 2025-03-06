// Script to migrate existing tour pages to the tours collection
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const DB_NAME = "olgatravel";

async function main() {
    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect(process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`);
    const db = client.db(DB_NAME);

    console.log('Connected to MongoDB. Migrating tour pages...');

    try {
        // Get all pages with template 'tour'
        const tourPages = await db.collection('pages').find({ template: 'tour' }).toArray();

        console.log(`Found ${tourPages.length} tour pages to migrate.`);

        if (tourPages.length === 0) {
            console.log('No tour pages found. Checking for pages that might be tours...');

            // Look for pages that might be tours based on content structure
            const potentialTourPages = await db.collection('pages').find({
                $or: [
                    { 'content.en.price': { $exists: true } },
                    { 'content.es.price': { $exists: true } }
                ]
            }).toArray();

            console.log(`Found ${potentialTourPages.length} potential tour pages.`);

            if (potentialTourPages.length > 0) {
                // Update these pages to have the 'tour' template
                for (const page of potentialTourPages) {
                    await db.collection('pages').updateOne(
                        { _id: page._id },
                        { $set: { template: 'tour' } }
                    );
                }

                // Refresh the tour pages list
                tourPages.push(...potentialTourPages);
            }
        }

        // Process each tour page
        for (const page of tourPages) {
            console.log(`Processing tour: ${page.name} (${page.slug})`);

            // Check if a tour with this slug already exists in the tours collection
            const existingTour = await db.collection('tours').findOne({ slug: page.slug });

            if (existingTour) {
                console.log(`Tour with slug ${page.slug} already exists in tours collection. Skipping.`);
                continue;
            }

            // Extract tour information from the page content
            const now = new Date();

            // Get content with safe fallbacks
            const enContent = page.content?.en || {};
            const esContent = page.content?.es || {};

            const tour = {
                slug: page.slug,
                tourName: {
                    en: enContent.title || page.name || page.slug,
                    es: esContent.title || page.name || page.slug,
                },
                tourPrice: enContent.price || esContent.price || 0,
                status: page.status || 'active',
                description: {
                    en: enContent.description || '',
                    es: esContent.description || '',
                },
                duration: {
                    en: enContent.duration || '',
                    es: esContent.duration || '',
                },
                includes: {
                    en: enContent.includes || '',
                    es: esContent.includes || '',
                },
                meetingPoint: {
                    en: enContent.meetingPoint || '',
                    es: esContent.meetingPoint || '',
                },
                pageId: page._id.toString(),
                createdAt: page.createdAt || now,
                updatedAt: now,
            };

            // Insert the tour into the tours collection
            await db.collection('tours').insertOne(tour);
            console.log(`Tour ${tour.tourName.en} migrated successfully!`);
        }

        // Count tours in the tours collection
        const tourCount = await db.collection('tours').countDocuments();
        console.log(`Migration complete. Total tours in tours collection: ${tourCount}`);

    } catch (error) {
        console.error('Error migrating tours:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

main().catch(console.error); 