import express from "express";
import { AppDataSource } from "./db/db";
import cors from "cors";
import { CorsOptions } from 'cors';
import userRoutes from "./routes/userRoutes";
import passport from "passport";
import session from "express-session";
import authRoutes from "./routes/authRoutes";
import propertyRoutes from "./routes/propertyRoutes"
import './config/passport'
import bookingRoutes from './routes/bookingRoutes'
import dotenv from "dotenv";
import leaveRoutes from "./routes/leaveRoutes";
import missionRoutes from "./routes/missionRoutes";
import settingRoutes from "./routes/settings";
dotenv.config();
const app = express();


const corsOptions: CorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/user", userRoutes);
app.use("/leave", leaveRoutes)
app.use("/mission", missionRoutes)
app.use("/settings", settingRoutes)

//initialize passport
app.use(session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/property", propertyRoutes)
app.use("/booking", bookingRoutes)


AppDataSource.initialize();
AppDataSource.initialize();

// Serve static files from the "uploads" directory
import path from "path";
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Remove duplicate or misplaced CORS middleware
// app.use(cors({
//   origin: "http://localhost:3000", // your frontend
//   credentials: true
// }));