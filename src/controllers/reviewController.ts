// import { Request, Response } from "express";
// import { AppDataSource } from "../db/db";
// import { Review } from "../models/Review";
// import { Property } from "../models/Property";
// import { User } from "../models/User";

// export class ReviewController {
//     /**
//      * Create a review for a property
//      */
//     static async createPropertyReview(req: Request, res: Response) {
//         try {
//             const { propertyId } = req.params;
//             const { comment, rating, userId } = req.body;

//             // Validate rating
//             if (rating < 1 || rating > 5) {
//                 return res.status(400).json({ 
//                     message: "Rating must be between 1 and 5" 
//                 });
//             }

//             const propertyRepository = AppDataSource.getRepository(Property);
//             const userRepository = AppDataSource.getRepository(User);
//             const reviewRepository = AppDataSource.getRepository(Review);

//             // Find property and user
//             const property = await propertyRepository.findOne({ 
//                 where: { id: propertyId } 
//             });
//             const user = await userRepository.findOne({ 
//                 where: { id: userId } 
//             });

//             if (!property) {
//                 return res.status(404).json({ 
//                     message: "Property not found" 
//                 });
//             }

//             if (!user) {
//                 return res.status(404).json({ 
//                     message: "User not found" 
//                 });
//             }

//             // Create new review
//             const review = new Review();
//             review.property = property;
//             review.host = user;
//             review.comment = comment;
//             review.rating = rating;

//             await reviewRepository.save(review);

//             return res.status(201).json({
//                 message: "Review created successfully",
//                 data: review
//             });

//         } catch (error: any) {
//             return res.status(500).json({
//                 message: "Error creating review",
//                 error: error.message
//             });
//         }
//     }

//     /**
//      * Get all reviews for a property
//      */
//     static async getPropertyReviews(req: Request, res: Response) {
//         try {
//             const { propertyId } = req.params;
//             const reviewRepository = AppDataSource.getRepository(Review);

//             const reviews = await reviewRepository.find({
//                 where: { property: { id: propertyId } },
//                 relations: ['user'], // Include user details
//                 order: { createdAt: 'DESC' }
//             });

//             return res.status(200).json({
//                 message: "Property reviews retrieved successfully",
//                 data: reviews
//             });

//         } catch (error: any) {
//             return res.status(500).json({
//                 message: "Error fetching property reviews",
//                 error: error.message
//             });
//         }
//     }

//     /**
//      * Create a review for a host
//      */
//     static async createHostReview(req: Request, res: Response) {
//         try {
//             const { hostId } = req.params;
//             const { comment, rating, userId } = req.body;

//             // Validate rating
//             if (rating < 1 || rating > 5) {
//                 return res.status(400).json({ 
//                     message: "Rating must be between 1 and 5" 
//                 });
//             }

//             const userRepository = AppDataSource.getRepository(User);
//             const reviewRepository = AppDataSource.getRepository(Review);

//             // Find host and user
//             const host = await userRepository.findOne({ 
//                 where: { id: hostId, type: 'hosts' } 
//             });
//             const user = await userRepository.findOne({ 
//                 where: { id: userId } 
//             });

//             if (!host) {
//                 return res.status(404).json({ 
//                     message: "Host not found" 
//                 });
//             }

//             if (!user) {
//                 return res.status(404).json({ 
//                     message: "User not found" 
//                 });
//             }

//             // Create new review
//             const review = new Review();
//             review.host = host;
//             review.host = user;
//             review.comment = comment;
//             review.rating = rating;

//             await reviewRepository.save(review);

//             return res.status(201).json({
//                 message: "Host review created successfully",
//                 data: review
//             });

//         } catch (error: any) {
//             return res.status(500).json({
//                 message: "Error creating host review",
//                 error: error.message
//             });
//         }
//     }

//     /**
//      * Get all reviews for a host
//      */
//     static async getHostReviews(req: Request, res: Response) {
//         try {
//             const { hostId } = req.params;
//             const reviewRepository = AppDataSource.getRepository(Review);
//             const reviews = await reviewRepository.find({
//                 where: { host: { id: hostId, type: 'hosts' } },
//                 relations: ['user'], // Include user details
//                 order: { createdAt: 'DESC' }
//             });

//             return res.status(200).json({
//                 message: "Host reviews retrieved successfully",
//                 data: reviews
//             });

//         } catch (error: any) {
//             return res.status(500).json({
//                 message: "Error fetching host reviews",
//                 error: error.message
//             });
//         }
//     }
// }