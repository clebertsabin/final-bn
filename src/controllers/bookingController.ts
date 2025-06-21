import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { AppDataSource } from "../db/db";
import { uploadImages } from '../utils/cloudinary';
import { Property } from "../models/Property";
import { Booking } from "../models/Booking";


export class bookingcontroller {
    static async createBooking(req: Request, res: Response) {
        try {
            const { userId, propId } = req.params;
            const { checkIn, checkOut } = req.body;
            const userRepository = AppDataSource.getRepository(User)
            const propertyRepository = AppDataSource.getRepository(Property)
            if (!checkIn) {
                res.status(400).json({ message: "checkin dates are reequired" })
                return;
            }
            if (!checkOut) {
                res.status(400).json({ message: "checkout dates are reequired" })
                return;

            }

            const user = await userRepository.find({
                where: {
                    id: userId
                }
            })
            if (!user) {
                res.status(400).json({ message: "User does not exist!" })
                return;

            }
            const property = await propertyRepository.find({
                where: {
                    id: propId
                }
            })
            if (!property || property[0].status == 'booked') {
                res.status(400).json({ message: "you cant book this property" })
                return;

            }
            const calculateDaysBetweenDates = (startDate: string, endDate: string): number => {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const differenceInTime = end.getTime() - start.getTime();
                return differenceInTime / (1000 * 3600 * 24); // Convert milliseconds to days
            };
            const days = calculateDaysBetweenDates(checkIn, checkOut);
            const amount = Number(property[0].price) * days;
            const newBooking = new Booking()
            newBooking.renter = user[0];
            newBooking.property = property[0];
            newBooking.checkIn = checkIn;
            newBooking.checkOut = checkOut;
            newBooking.totalamount = amount;
            newBooking.totaldays = days;
            newBooking.createdAt = new Date();
            newBooking.updatedAt = new Date()

            const bookingRepository = AppDataSource.getRepository(Booking)
            // change property status
            property[0].status = 'booked';
            await propertyRepository.save(property)

            await bookingRepository.save(newBooking)
            res.status(200).json({ message: "You have successfully bookend a property", data: newBooking })
        } catch (error: any) {
            res.status(500).json({ message: "Error creating booking", error: error.message });
        }
    }
    static async rentersBookings(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const bookingRepository = AppDataSource.getRepository(Booking);

            const existingBookings = await bookingRepository.find({
                where: {
                    renter: { id }
                },
                relations: ["property", "renter"]
            });
            res.status(200).json({ message: "Renter's bookings", data: existingBookings });
        } catch (error: any) {
            res.status(500).json({ message: "Error fetching renter's bookings", error: error.message });
        }
    }
    static async bookingDetails(req:Request, res:Response){
        try {
            const {id}= req.params;
            const bookingRepository = AppDataSource.getRepository(Booking)
            const booking = await bookingRepository.findOne({
                where:{
                    id
                }
            })
            if(!booking){
                res.status(400).json({message:"Booking not found"})
                return;
            }
            res.status(200).json({message:"Booking details", data:booking})
        } catch (error:any) {
            res.status(500).json({ message: "Error fetching booking details", error: error.message });
        }
    }
    /**
     * Cancels a booking and updates the associated property status
     * @param req Request object containing booking ID in params
     * @param res Response object
     */
    static async cancelBooking(req: Request, res: Response):Promise<void> {
        try {
            // Extract booking ID from request parameters
            const { id } = req.params;
            
            // Get repositories for both Booking and Property entities
            const bookingRepository = AppDataSource.getRepository(Booking)
            const propertyRepository = AppDataSource.getRepository(Property)

            // Find booking with its associated property
            const booking = await bookingRepository.findOne({
                where: { id },
                relations: ['property'] // Include property relation for updating
            })

            // Return error if booking not found
            if (!booking) {
                 res.status(400).json({ message: "Booking not found" })
                 return
            }

            // Update booking status to cancelled
            booking.status = 'cancelled';
            await bookingRepository.save(booking)

            // Update property status to confirmed if property exists
            if (booking.property) {
                booking.property.status = 'confirmed';
                await propertyRepository.save(booking.property)
            }

            // Return success response with updated booking
            res.status(200).json({
                message: "Booking cancelled successfully", 
                data: booking
            })

        } catch (error: any) {
            // Handle any errors that occur during the process
            res.status(500).json({ 
                message: "Error cancelling booking", 
                error: error.message 
            });
        }
    }
    /**
     * Entity Relations Required:
     * - Booking entity should have:
     *   @ManyToOne(() => Property)
     *   property: Property;
     */
    static async hostUpdatingBooking(req:Request, res:Response){
        try {
            const {id}= req.params;
            const bookingRepository = AppDataSource.getRepository(Booking)
            const booking = await bookingRepository.findOne({
                where:{
                    id
                }
            })
            if(!booking){
                res.status(400).json({message:"Booking not found"})
                return;
            }
            booking.status = 'confirmed';
            await bookingRepository.save(booking)   
            res.status(200).json({message:"Booking confirmed successfully", data:booking})
        } catch (error:any) {
            res.status(500).json({ message: "Error confirming booking", error: error.message });
        }
    }
    static async hostBookings(req: Request, res: Response) {
        try {
            const { id } = req.params; // host/user id
            const bookingRepository = AppDataSource.getRepository(Booking)
            
            // Find bookings with property and host relations
            const bookings = await bookingRepository
                .createQueryBuilder('booking')
                .leftJoinAndSelect('booking.property', 'property')
                .leftJoinAndSelect('property.host', 'host')
                .where('host.id = :hostId', { hostId: id })
                .andWhere('property.status = :status', { status: 'booked' })
                .getMany();
    
            // if (!bookings.length) {
            //      res.status(404).json({ 
            //         message: "No bookings found for this host" 
            //     });
            //     return;
            // }
    
             res.status(200).json({
                message: "Host bookings retrieved successfully",
                bookings
            });
            return
    
        } catch (error: any) {
             res.status(500).json({ 
                message: "Error retrieving host bookings", 
                error: error.message 
            });
            return
        }
    }
}