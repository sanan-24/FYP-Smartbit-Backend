const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const Profile = require('./src/models/profile.model');
const dotenv = require('dotenv');

dotenv.config();

const seedRider = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const riderEmail = "rider1@mfc.com";
        const existedRider = await User.findOne({ email: riderEmail });

        if (existedRider) {
            console.log("Rider already exists. Marking as available...");
            existedRider.isAvailable = true;
            existedRider.role = 'rider';
            await existedRider.save();
            
            // Ensure profile exists
            const profile = await Profile.findOne({ user: existedRider._id });
            if (!profile) {
                await Profile.create({
                    user: existedRider._id,
                    firstName: "Test",
                    lastName: "Rider",
                    phoneNumber: "03001112223",
                    profilePhoto: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
                });
            }
        } else {
            const rider = await User.create({
                email: riderEmail,
                password: "password123",
                role: 'rider',
                isVerified: true,
                isAvailable: true
            });

            await Profile.create({
                user: rider._id,
                firstName: "Test",
                lastName: "Rider",
                phoneNumber: "03001112223",
                profilePhoto: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
            });
            console.log("New Rider created successfully!");
        }

        console.log("Rider is now available for assignment.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding rider:", error);
        process.exit(1);
    }
};

seedRider();
