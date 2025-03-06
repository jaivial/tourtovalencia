// Script to test tour creation process
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const DB_NAME = "olgatravel";

async function main() {
    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect(process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`);
    const db = client.db(DB_NAME);

    console.log('Connected to MongoDB. Testing tour creation...');

    // Create a test page with tour template
    const testPageName = `Test Tour ${new Date().toISOString()}`;
    const testPageSlug = testPageName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const testPage = {
        name: testPageName,
        slug: testPageSlug,
        template: 'tour', // This is the key - setting template to 'tour'
        content: {
            en: {
                title: testPageName,
                price: 100,
                description: 'Test tour description',
                duration: '3 hours',
                includes: 'Test inclusions',
                meetingPoint: 'Test meeting point'
            },
            es: {
                title: testPageName,
                price: 100,
                description: 'Descripción del tour de prueba',
                duration: '3 horas',
                includes: 'Inclusiones de prueba',
                meetingPoint: 'Punto de encuentro de prueba'
            }
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    try {
        // Insert the test page
        console.log(`Creating test page: ${testPageName}`);
        const pageResult = await db.collection('pages').insertOne(testPage);
        console.log(`Test page created with ID: ${pageResult.insertedId}`);

        // Wait a moment to ensure any async processes complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if a corresponding tour was created
        console.log('Checking if tour was created...');
        const tour = await db.collection('tours').findOne({ slug: testPageSlug });

        if (tour) {
            console.log('SUCCESS: Tour was automatically created!');
            console.log('Tour details:', JSON.stringify(tour, null, 2));
        } else {
            console.log('FAILURE: Tour was not created automatically.');
            console.log('This indicates that the createTourFromPage function is not being called or is failing.');

            // Let's manually create the tour to simulate what should happen
            console.log('Manually creating the tour...');

            const manualTour = {
                slug: testPageSlug,
                tourName: {
                    en: testPage.content.en.title,
                    es: testPage.content.es.title
                },
                tourPrice: testPage.content.en.price,
                status: testPage.status,
                description: {
                    en: testPage.content.en.description,
                    es: testPage.content.es.description
                },
                duration: {
                    en: testPage.content.en.duration,
                    es: testPage.content.es.duration
                },
                includes: {
                    en: testPage.content.en.includes,
                    es: testPage.content.es.includes
                },
                meetingPoint: {
                    en: testPage.content.en.meetingPoint,
                    es: testPage.content.es.meetingPoint
                },
                pageId: pageResult.insertedId.toString(),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await db.collection('tours').insertOne(manualTour);
            console.log('Tour manually created.');
        }

        // Clean up - delete the test page and tour
        console.log('Cleaning up...');
        await db.collection('pages').deleteOne({ _id: pageResult.insertedId });
        await db.collection('tours').deleteOne({ slug: testPageSlug });
        console.log('Test page and tour deleted.');

    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

main().catch(console.error); 