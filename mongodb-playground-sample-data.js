// MongoDB Playground - Sample Data Insertion
// Use this script to populate the olgatravel database with sample data

// Select the database
use('olgatravel');

// Drop existing collections to start fresh
db.bookings.drop();
db.bookingLimits.drop();
db.pages.drop();
db.payments.drop();

// Sample data for bookings collection
const sampleBookings = [
    {
        name: "John Smith",
        email: "john@example.com",
        date: new Date("2024-05-15"),
        tourType: "San Juan Caves",
        numberOfPeople: NumberInt(2),
        status: "confirmed",
        phoneNumber: "+1234567890",
        specialRequests: "Vegetarian meals",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Maria García",
        email: "maria@example.com",
        date: new Date("2024-05-16"),
        tourType: "San Juan Caves",
        numberOfPeople: NumberInt(4),
        status: "pending",
        phoneNumber: "+34612345678",
        specialRequests: "Early pickup requested",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "David Wilson",
        email: "david@example.com",
        date: new Date("2024-05-17"),
        tourType: "San Juan Caves",
        numberOfPeople: NumberInt(3),
        status: "confirmed",
        phoneNumber: "+44123456789",
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Sample data for bookingLimits collection
const sampleBookingLimits = [
    {
        date: new Date("2024-05-15"),
        maxBookings: NumberInt(20),
        currentBookings: NumberInt(2),
        isBlocked: false
    },
    {
        date: new Date("2024-05-16"),
        maxBookings: NumberInt(20),
        currentBookings: NumberInt(4),
        isBlocked: false
    },
    {
        date: new Date("2024-05-17"),
        maxBookings: NumberInt(0),
        currentBookings: NumberInt(0),
        isBlocked: true,
        reason: "Holiday"
    }
];

// Sample data for pages collection
const samplePages = [
    {
        slug: "san-juan-caves",
        template: "tour",
        content: {
            en: {
                title: "San Juan Caves Tour",
                description: "Explore the beautiful caves of San Juan",
                sections: [
                    {
                        type: "hero",
                        content: {
                            heading: "Discover the San Juan Caves",
                            subheading: "A unique experience in Valencia",
                            imageUrl: "/images/san-juan-caves.jpg"
                        }
                    },
                    {
                        type: "features",
                        content: {
                            features: [
                                { title: "Expert Guides", description: "Professional English-speaking guides" },
                                { title: "Small Groups", description: "Maximum 10 people per group" },
                                { title: "All Inclusive", description: "Equipment and refreshments included" }
                            ]
                        }
                    }
                ]
            },
            es: {
                title: "Tour por las Cuevas de San Juan",
                description: "Explora las hermosas cuevas de San Juan",
                sections: [
                    {
                        type: "hero",
                        content: {
                            heading: "Descubre las Cuevas de San Juan",
                            subheading: "Una experiencia única en Valencia",
                            imageUrl: "/images/san-juan-caves.jpg"
                        }
                    },
                    {
                        type: "features",
                        content: {
                            features: [
                                { title: "Guías Expertos", description: "Guías profesionales de habla hispana" },
                                { title: "Grupos Pequeños", description: "Máximo 10 personas por grupo" },
                                { title: "Todo Incluido", description: "Equipamiento y refrigerios incluidos" }
                            ]
                        }
                    }
                ]
            }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: true
    }
];

// Insert collections that don't depend on other data first
db.bookings.insertMany(sampleBookings);
db.bookingLimits.insertMany(sampleBookingLimits);
db.pages.insertMany(samplePages);

// Get the inserted booking IDs
const johnBooking = db.bookings.findOne({ email: "john@example.com" });
const mariaBooking = db.bookings.findOne({ email: "maria@example.com" });

// Create payments with the actual booking IDs
const samplePayments = [
    {
        bookingId: johnBooking._id,
        amount: NumberDecimal("150.00"),
        currency: "EUR",
        status: "completed",
        stripePaymentId: "pi_1234567890",
        stripeCustomerId: "cus_1234567890",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        bookingId: mariaBooking._id,
        amount: NumberDecimal("300.00"),
        currency: "EUR",
        status: "pending",
        stripePaymentId: "pi_0987654321",
        stripeCustomerId: "cus_0987654321",
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Insert payments after we have the booking IDs
db.payments.insertMany(samplePayments);

// Print confirmation
print('Sample data has been inserted successfully!'); 