import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const User = mongoose.model('User', new mongoose.Schema({ role: String, email: String }, { strict: false }));
        
        const user = await User.findOneAndUpdate({}, { role: "admin" }, { new: true });
        
        if (user) {
            console.log(`Successfully upgraded ${user.email} to Admin!`);
            console.log("Please log out and log back in to see the changes.");
        } else {
            console.log("No users found in database.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
})();
