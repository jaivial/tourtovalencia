// MongoDB Playground
// Use Ctrl+Alt+L to open a new playground

// Select the database to use
use('olgatravel');

// Drop existing collections if they exist
db.bookings.drop();
db.bookingLimits.drop();
db.pages.drop();
db.payments.drop();

// Create bookings collection with schema validation
db.createCollection('bookings', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'email', 'date', 'tourType', 'numberOfPeople', 'status'],
            properties: {
                name: { bsonType: 'string' },
                email: { bsonType: 'string' },
                date: { bsonType: 'date' },
                tourType: { bsonType: 'string' },
                numberOfPeople: { bsonType: 'int' },
                status: { bsonType: 'string', enum: ['pending', 'confirmed', 'cancelled'] },
                phoneNumber: { bsonType: 'string' },
                specialRequests: { bsonType: 'string' },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
            }
        }
    }
});

// Create bookingLimits collection with schema validation
db.createCollection('bookingLimits', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['date', 'maxBookings', 'currentBookings'],
            properties: {
                date: { bsonType: 'date' },
                maxBookings: { bsonType: 'int' },
                currentBookings: { bsonType: 'int' },
                isBlocked: { bsonType: 'bool' },
                reason: { bsonType: 'string' }
            }
        }
    }
});

// Create pages collection with schema validation
db.createCollection('pages', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['slug', 'template', 'content'],
            properties: {
                slug: { bsonType: 'string' },
                template: { bsonType: 'string' },
                content: {
                    bsonType: 'object',
                    required: ['en', 'es'],
                    properties: {
                        en: { bsonType: 'object' },
                        es: { bsonType: 'object' }
                    }
                },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' },
                isPublished: { bsonType: 'bool' }
            }
        }
    }
});

// Create payments collection with schema validation
db.createCollection('payments', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['bookingId', 'amount', 'currency', 'status', 'stripePaymentId'],
            properties: {
                bookingId: { bsonType: 'objectId' },
                amount: { bsonType: 'decimal' },
                currency: { bsonType: 'string' },
                status: { bsonType: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
                stripePaymentId: { bsonType: 'string' },
                stripeCustomerId: { bsonType: 'string' },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
            }
        }
    }
});

// Create indexes
db.bookings.createIndex({ date: 1 });
db.bookings.createIndex({ email: 1 });
db.bookings.createIndex({ status: 1 });

db.bookingLimits.createIndex({ date: 1 }, { unique: true });

db.pages.createIndex({ slug: 1 }, { unique: true });
db.pages.createIndex({ "content.en.title": "text", "content.es.title": "text" });

db.payments.createIndex({ bookingId: 1 });
db.payments.createIndex({ stripePaymentId: 1 }, { unique: true });

// Insert sample booking limit
db.bookingLimits.insertOne({
    date: new Date(),
    maxBookings: 20,
    currentBookings: 0,
    isBlocked: false
}); 