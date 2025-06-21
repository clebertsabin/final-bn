import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Property } from "./Property";
import { Booking } from "./Booking";
// import { Review } from "./Review";
@Entity('users')
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  FirstName!: string;

  @Column({ nullable: true })
  LastName!: string;

  @Column({ nullable: true })
  Dob?: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ enum: ["renters", "hosts", "admin"], default: "renters" })
  type!: string;

  @Column({ enum: ['active', 'inactive'], default: "active" })
  status!: string;

  @Column({ nullable: true, unique: true })
  googleId?: string;

  @Column({ nullable: true })
  picture?: string;

  @Column({ default: false })
  isGoogleAuth!: boolean;

  @Column({ nullable: true })
  lastLogin?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  refreshToken?: string;

  @OneToMany(() => Property, property => property.host)
  properties!: Property[];

  // ✅ Add OneToMany relationship with Booking (renter)
  @OneToMany(() => Booking, (booking) => booking.renter)
  bookings!: Booking[];

  // @OneToMany(() => Review, review => review.user)
  // reviews!: Review[];
}
