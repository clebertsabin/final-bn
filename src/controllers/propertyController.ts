import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { AppDataSource } from "../db/db";
import { uploadImages } from '../utils/cloudinary';
import { Property } from "../models/Property";



export class propertyController {
    static async createProperty(req: Request, res: Response): Promise<void> {
        try {
            const { Title, Description, price , location} = req.body;
            const { id } = req.params;

            if (!req.files || req.files.length === 0) {
                const errorResponse = { error: 'Files not found' };
                res.status(400).json(errorResponse);
                return;
            }
            const filePromises = (req.files as Express.Multer.File[]).map((file) => file.path);
            const uploadedImages = await uploadImages(filePromises);

            const newProperty = new Property();

            newProperty.Title = Title;
            newProperty.Description = Description;
            newProperty.price = price;
            newProperty.pictures = uploadedImages;
            newProperty.location = location;

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id } });
            if (!user) {
                res.status(400).json({ message: "User not found" });
                return;
            }
            newProperty.host = user;


            if (!Title) {
                res.status(400).json({ message: "Title is required" });
                return;
            }
            if (!Description) {
                res.status(400).json({ message: "Descriptio is required" });
                return;
            }
            if (!price) {
                res.status(400).json({ message: "Price is required" });
                return;
            }

            if (!id) {
                res.status(400).json({ message: "Owner is required" });
                return;
            }
            const propertyRepository = AppDataSource.getRepository(Property)
            if (await propertyRepository.findOne({ where: { Title, Description } })) {
                res.status(400).json({ message: "Property already exists" });
                return;
            }
            await AppDataSource.manager.save(newProperty);
            res.status(201).json(newProperty);
        } catch (error:any) {
            res.status(500).json({ message: "Error creating property", error: error.message });
        }
    }
    static async getAdminProperties(req: Request, res: Response) {
        try {
            const propertyRepository = AppDataSource.getRepository(Property)

            const allProperties = await propertyRepository.find()
            res.status(200).json({ message: "all  Products", data: allProperties })
        } catch (error) {
            res.status(500).json({ message: "Error fetching properties", error: error });
        }
    }
    static async getAllProperties(req: Request, res: Response) {
        try {
            const propertyRepository = AppDataSource.getRepository(Property)

            const allProperties = await propertyRepository.find({ where: { status: 'confirmed' } })
            res.status(200).json({ message: "all Confirmed Products", data: allProperties })
        } catch (error) {
            res.status(500).json({ message: "Error fetching properties", error: error });
        }
    }

    static async getSingleProperty(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const propertyRepository = AppDataSource.getRepository(Property)
            const existingProperty = await propertyRepository.findOne({
                where: {
                    id
                }
            })

            if (!id) {
                res.status(400).json({ message: "invalid property id" })
            }
            res.status(200).json({ message: "Single property Info!",  existingProperty })

        }
        catch (error) {
            res.status(500).json({ message: "Error fetching property", error: error });
        }
    }
    static async updateProperty(req: Request, res: Response) {
        try {
            const { id } = req.params
            const { Title, Description, price ,location} = req.body
            const propertyRepository = AppDataSource.getRepository(Property)
            const existingProperty = await propertyRepository.findOne(
                {
                    where: {
                        id: id
                    }
                }
            )
            if (!existingProperty) {
                res.status(400).json({ message: "Property does not exist" })
                return;
            }
            if (Title) existingProperty.Title = Title
            if (Description) existingProperty.Description = Description
            if (price) existingProperty.price = price
            if (location) existingProperty.location = location

            existingProperty.updatedAt = new Date();
            await propertyRepository.save(existingProperty)
            res.status(200).json({ message: "updated product", data: existingProperty })
        } catch (error) {
            res.status(500).json({ message: "Error fetching property", error: error });
        }
    }
    static async adminUpdateProperty(req: Request, res: Response) {
        try {
            const { id } = req.params
           
            const propertyRepository = AppDataSource.getRepository(Property)
            const existingProperty = await propertyRepository.findOne(
                {
                    where: {
                        id: id
                    }
                }
            )
            if (!existingProperty) {
                res.status(400).json({ message: "Property does not exist" })
                return;
            }
            existingProperty.status = 'confirmed'
            existingProperty.updatedAt = new Date();
            await propertyRepository.save(existingProperty)
            res.status(200).json({ message: "confirmed product", data: existingProperty })
        } catch (error) {
            res.status(500).json({ message: "Error fetching property", error: error });
        }
    }
    static async deleteProperty( req:Request,res:Response){
        try {
            const {id}= req.params
            const propertyRepository= AppDataSource.getRepository(Property)
            const existingProperty = await propertyRepository.findOne(
                {where:{
                    id
                }}
            )
            if(!existingProperty){
                res.status(400).json({message:"property with that id does not exist"})
            }
            await propertyRepository.delete(id)
            res.status(200).json({message:"prperty deleted successfully"})
        } catch (error) {
            res.status(500).json({ message: "Error deleting property", error: error });
        }
    }
    static async getHostProperties(req:Request, res:Response){
        try {
            const {id}= req.params;
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id } });
            if (!user) {
                res.status(400).json({ message: "User not found" });
                return;
            }
            const propertyRepository = AppDataSource.getRepository(Property);
            const hostProperties = await propertyRepository.find({
                where: {
                   host: user
                }
            });
            if (!hostProperties || hostProperties.length === 0) {
                res.status(400).json({ message: "There are no properties at the moment" });
                return;
            }
            res.status(200).json({ message: "Host Properties", data: hostProperties });
        } catch (error:any) {
            res.status(500).json({ message: "Error fetching host property", error: error.message });
        }
    }
}