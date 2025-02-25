// Script to add sample tours to the database
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const DB_NAME = "olgatravel";

async function main() {
    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect(process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`);
    const db = client.db(DB_NAME);

    console.log('Connected to MongoDB. Adding sample tours...');

    // Sample tours data
    const sampleTours = [
        {
            _id: new ObjectId(),
            slug: 'valencia-city-tour',
            name: 'Valencia City Tour',
            template: 'tour',
            content: {
                en: {
                    title: 'Valencia City Tour',
                    price: 25,
                    description: 'Explore the beautiful city of Valencia with our guided tour.',
                    duration: '3 hours',
                    includes: 'Professional guide, entrance fees',
                    meetingPoint: 'Plaza de la Virgen'
                },
                es: {
                    title: 'Tour por la Ciudad de Valencia',
                    price: 25,
                    description: 'Explora la hermosa ciudad de Valencia con nuestro tour guiado.',
                    duration: '3 horas',
                    includes: 'Guía profesional, entradas',
                    meetingPoint: 'Plaza de la Virgen'
                }
            },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            slug: 'albufera-natural-park',
            name: 'Albufera Natural Park',
            template: 'tour',
            content: {
                en: {
                    title: 'Albufera Natural Park',
                    price: 35,
                    description: 'Visit the stunning Albufera Natural Park and enjoy a boat ride on the lake.',
                    duration: '4 hours',
                    includes: 'Transportation, boat ride, professional guide',
                    meetingPoint: 'Valencia Bus Station'
                },
                es: {
                    title: 'Parque Natural de la Albufera',
                    price: 35,
                    description: 'Visita el impresionante Parque Natural de la Albufera y disfruta de un paseo en barca por el lago.',
                    duration: '4 horas',
                    includes: 'Transporte, paseo en barca, guía profesional',
                    meetingPoint: 'Estación de Autobuses de Valencia'
                }
            },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            slug: 'wine-tasting-tour',
            name: 'Wine Tasting Tour',
            template: 'tour',
            content: {
                en: {
                    title: 'Wine Tasting Tour',
                    price: 45,
                    description: 'Discover the local wines of Valencia region with our wine tasting tour.',
                    duration: '5 hours',
                    includes: 'Transportation, wine tasting, snacks, professional guide',
                    meetingPoint: 'Valencia North Station'
                },
                es: {
                    title: 'Tour de Cata de Vinos',
                    price: 45,
                    description: 'Descubre los vinos locales de la región de Valencia con nuestro tour de cata de vinos.',
                    duration: '5 horas',
                    includes: 'Transporte, cata de vinos, aperitivos, guía profesional',
                    meetingPoint: 'Estación del Norte de Valencia'
                }
            },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    try {
        // Check if tours already exist in pages collection
        const existingTours = await db.collection('pages').find({ template: 'tour' }).toArray();

        if (existingTours.length > 0) {
            console.log(`Found ${existingTours.length} existing tours in pages collection. Skipping insertion.`);
            console.log('Existing tours:');
            existingTours.forEach(tour => {
                console.log(`- ${tour.name} (${tour.slug})`);
            });
        } else {
            // Insert sample tours to pages collection
            const result = await db.collection('pages').insertMany(sampleTours);
            console.log(`${result.insertedCount} sample tours added to pages collection successfully!`);
        }

        // Now add the tours to the tours collection
        // First check if tours already exist in tours collection
        const existingToursInToursCollection = await db.collection('tours').find({}).toArray();

        if (existingToursInToursCollection.length > 0) {
            console.log(`Found ${existingToursInToursCollection.length} existing tours in tours collection. Skipping insertion.`);
            console.log('Existing tours in tours collection:');
            existingToursInToursCollection.forEach(tour => {
                console.log(`- ${tour.tourName?.en || tour.slug}`);
            });
        } else {
            // Create tours for the tours collection
            const toursCollectionData = sampleTours.map(page => {
                const now = new Date();
                return {
                    slug: page.slug,
                    tourName: {
                        en: page.content.en.title,
                        es: page.content.es.title
                    },
                    tourPrice: page.content.en.price,
                    status: page.status,
                    description: {
                        en: page.content.en.description,
                        es: page.content.es.description
                    },
                    duration: {
                        en: page.content.en.duration,
                        es: page.content.es.duration
                    },
                    includes: {
                        en: page.content.en.includes,
                        es: page.content.es.includes
                    },
                    meetingPoint: {
                        en: page.content.en.meetingPoint,
                        es: page.content.es.meetingPoint
                    },
                    pageId: page._id.toString(),
                    createdAt: now,
                    updatedAt: now
                };
            });

            // Insert to tours collection
            const toursResult = await db.collection('tours').insertMany(toursCollectionData);
            console.log(`${toursResult.insertedCount} sample tours added to tours collection successfully!`);
        }
    } catch (error) {
        console.error('Error adding sample tours:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

main().catch(console.error); 