import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AppDataSource } from '../db/db';
import { User } from '../models/User';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const workflowRepository = AppDataSource.getRepository(User);
      
      // Find or create user
      let user = await workflowRepository.findOne({ 
        where: { email: profile.emails?.[0].value } 
      });

      if (!user) {
        user = new User();
        user.email = profile.emails?.[0].value!;
        user.FirstName = profile.name?.givenName || '';
        user.LastName = profile.name?.familyName || '';
        user.googleId = profile.id;
        user.picture = profile.photos?.[0].value;
        user.status = 'active';
        user.createdAt = new Date();
        user.updatedAt = new Date();

        await workflowRepository.save(user);
      } else {
        // Update existing user's Google information
        user.googleId = profile.id;
        user.picture = profile.photos?.[0].value;
        user.updatedAt = new Date();
        await workflowRepository.save(user);
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error, undefined);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const workflowRepository = AppDataSource.getRepository(User);
    const user = await workflowRepository.findOne({ where: { id: id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
