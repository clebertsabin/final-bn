import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { Booking } from "./Booking";
// import { Review } from "./Review";
@Entity('properties')
export class Property {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ nullable: false })
    Title!: string;

    @Column({ nullable: false })
    Description!: string;

    @Column({ nullable: false })
    price!: string;
    @Column({ nullable: true })
    location!: string;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: "host_id" })
    host!: User;

    @Column("simple-array")
    pictures!: string[];

    @Column({
        type: "enum",
        enum: ["pending", "confirmed", "cancelled", "booked"],
        default: "pending"
    })
    status!: string;

    // ✅ Add OneToMany relationship with Booking
    @OneToMany(() => Booking, (booking) => booking.property)
    bookings!: Booking[];

    // @OneToMany(() => Review, review => review.property)
    // reviews!: Review[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}