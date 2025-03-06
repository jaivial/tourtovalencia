// Script to test tour creation process using the API
import dotenv from 'dotenv';
import axios from 'axios';
import { MongoClient } from 'mongodb';

dotenv.config();

const DB_NAME = "olgatravel";
const API_URL = "http://localhost:3000/api/pages/create";

async function main() {
    console.log('Starting API-based tour creation test...');

    // Connect to MongoDB to verify results and clean up
    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect(process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`);
    const db = client.db(DB_NAME);

    // Create a test page with a price (which should automatically set template to 'tour')
    const testPageName = `API Test Tour ${new Date().toISOString()}`;

    const pageContent = {
        title: testPageName,
        price: 150, // This should trigger the template to be set to 'tour'
        description: 'Test tour description',
        duration: '4 hours',
        includes: 'Test inclusions',
        meetingPoint: 'Test meeting point'
    };

    try {
        // Create the page through the API
        console.log(`Creating test page through API: ${testPageName}`);

        const formData = new FormData();
        formData.append('name', testPageName);
        formData.append('content', JSON.stringify(pageContent));
        formData.append('status', 'active');

        const response = await axios.post(API_URL, formData);

        console.log('API Response:', response.data);

        if (response.data.success) {
            console.log(`Page created successfully with slug: ${response.data.page.slug}`);

            // Wait a moment to ensure any async processes complete
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check if the page was created in the database
            const page = await db.collection('pages').findOne({ slug: response.data.page.slug });

            if (page) {
                console.log('Page found in database:', page.name);
                console.log('Template value:', page.template);

                // Check if a corresponding tour was created
                console.log('Checking if tour was created...');
                const tour = await db.collection('tours').findOne({ slug: response.data.page.slug });

                if (tour) {
                    console.log('SUCCESS: Tour was automatically created!');
                    console.log('Tour details:', JSON.stringify(tour, null, 2));
                } else {
                    console.log('FAILURE: Tour was not created automatically.');
                    console.log('This indicates that the createTourFromPage function is not being called or is failing.');
                }

                // Clean up - delete the test page and tour
                console.log('Cleaning up...');
                await db.collection('pages').deleteOne({ _id: page._id });
                await db.collection('tours').deleteOne({ slug: response.data.page.slug });
                console.log('Test page and tour deleted.');
            } else {
                console.log('ERROR: Page not found in database despite successful API response.');
            }
        } else {
            console.log('API returned error:', response.data);
        }

    } catch (error) {
        console.error('Error during test:', error);
        if (error.response) {
            console.error('API response error:', error.response.data);
        }
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
        console.log('Test completed.');
    }
}

main().catch(console.error); 