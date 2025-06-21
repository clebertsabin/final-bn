import { AppDataSource } from "../db/db";
import { User } from "../models/User";

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            scope: ["profile", "email"],
        },
        async (
            accessToken: string,
            refreshToken: string,
            profile: any,
            done: (error: any, user?: User | null) => void
        ) => {
            try {
                console.log("Google Profile:", profile);

                const userRepository = AppDataSource.getRepository(User);

                // Check if user exists
                let user = await userRepository.findOne({
                    where: { email: profile.emails?.[0]?.value || profile._json?.email },
                });

                if (!user) {
                    console.log("User not found, creating new user...");

                    // Create new user with your specific model properties
                    const newUser = new User();
                    newUser.FirstName = profile.name?.givenName || profile._json?.given_name;
                    newUser.LastName = profile.name?.familyName || profile._json?.family_name;
                    newUser.email = profile.emails?.[0]?.value || profile._json?.email;
                    newUser.googleId = profile.id;
                    newUser.picture = profile.photos?.[0]?.value || profile._json?.picture;
                    newUser.isGoogleAuth = true;
                    newUser.password = ""; // No password for Google Auth
                    newUser.type = "renters"; // default type
                    newUser.status = "active"; // default status
                    newUser.createdAt = new Date();
                    newUser.updatedAt = new Date();
                    newUser.lastLogin = new Date();

                    // Save the new user to the database
                    user = await userRepository.save(newUser);
                    console.log("User saved:", user);
                } else {
                    // Update last login time for existing user
                    user.lastLogin = new Date();
                    await userRepository.save(user);
                }

                done(null, user);
            } catch (error) {
                console.error("Error in Google Auth:", error);
                done(error, null);
            }
        }
    )
);

passport.serializeUser((user: User, done: (error: any, id?: string) => void) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done: (error: any, user?: User | null) => void) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ 
            where: { id },
            relations: ['properties', 'bookings'] // Include related entities if needed
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});