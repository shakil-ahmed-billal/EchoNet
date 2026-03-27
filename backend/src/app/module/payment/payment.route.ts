import express from 'express';
import auth from '../../middleware/auth.js';
import { PaymentControllers } from './payment.controller.js';

const router = express.Router();

router.post('/initiate', auth('USER', 'ADMIN', 'MODERATOR'), PaymentControllers.initiatePayment);
router.post('/webhook', PaymentControllers.handleWebhook); // Public endpoint for Stripe

export const PaymentRoutes = router;
