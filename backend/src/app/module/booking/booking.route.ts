import express from 'express';
import auth from '../../middleware/auth.js';
import { BookingControllers } from './booking.controller.js';

const router = express.Router();

router.post('/', auth('USER', 'ADMIN', 'MODERATOR'), BookingControllers.createBooking);
router.get('/my-bookings', auth('USER', 'ADMIN', 'MODERATOR'), BookingControllers.getMyBookings);
router.put('/:id/status', auth('USER', 'ADMIN', 'MODERATOR'), BookingControllers.updateBookingStatus);

export const BookingRoutes = router;
