import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Property } from "./Property";

@Entity("bookings")
export class Booking {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: "renter_id" }) // Foreign key for renter
    renter!: User;

    @ManyToOne(() => Property, (property) => property.id)
    @JoinColumn({ name: "property_id" }) // Foreign key for property
    property!: Property;

    @Column({ type: "date", nullable: false })
    checkIn!: Date;

    @Column({ type: "date", nullable: false })
    checkOut!: Date;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    totaldays!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    totalamount!: number;

    @Column({
        type: "enum",
        enum: ["pending","confirmed", "cancelled"],
        default: "pending"
    })
    status!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
