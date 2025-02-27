# MongoDB Setup Script for demoolgatravel

// Select the database
use('demoolgatravel');

    // Drop existing collections if they exist (be careful with this in production)
    db.bookingLimits.drop();
db.tours.drop();
db.pages.drop();
db.translations.drop();
db.bookings.drop();

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

// Create tours collection
db.createCollection('tours');

// Create pages collection
db.createCollection('pages');

// Create translations collection
db.createCollection('translations');

// Create bookings collection
db.createCollection('bookings');

// Create indexes
db.bookingLimits.createIndex({ date: 1 }, { unique: true });
db.tours.createIndex({ slug: 1 }, { unique: true });
db.pages.createIndex({ slug: 1 }, { unique: true });
db.translations.createIndex({ key: 1 }, { unique: true });
db.bookings.createIndex({ bookingId: 1 }, { unique: true });

// Insert a sample booking limit
db.bookingLimits.insertOne({
    date: new Date(),
    maxBookings: 20,
    currentBookings: 0,
    isBlocked: false
});

// Log completion
print('Database setup completed for demoolgatravel');
