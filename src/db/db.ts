import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "../models/User";
import { Property } from "../models/Property";
import { Booking } from "../models/Booking";
import { UserTable } from "../models/UserTable";
import { CampusTable } from "../models/CampusTable";
import { SchoolTable } from "../models/SchoolTable";
import { MissionTable } from "../models/MissionTable";
import { LeaveTable } from "../models/LeaveTable";
import { DepTable } from "../models/DepartmentTable";
// import { Review } from "../models/Review";
config();
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: false,
  entities: [
    UserTable, CampusTable, SchoolTable,DepTable, MissionTable,LeaveTable
  ],
 
});

//initialize the database
AppDataSource.initialize()
  .then(() => {
    console.log("Database initialized");
  })
  .catch((err) => {
    console.error("Error initializing database", err);
  });
