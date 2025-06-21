import { Router } from "express";
import { bookingcontroller } from "../controllers/bookingController";

const router = Router();

router.post("/book/:userId/:propId", bookingcontroller.createBooking)
router.get("/bookings/:userId", bookingcontroller.rentersBookings)
router.get("/booking-details/:id", bookingcontroller.bookingDetails)
router.put("/booking-cancel/:id", bookingcontroller.cancelBooking)
router.put("/confirm/:id", bookingcontroller.hostUpdatingBooking)
router.get("/host-bookings/:id", bookingcontroller.hostBookings)





export default router;