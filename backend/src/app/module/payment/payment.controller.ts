import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { PaymentServices } from './payment.service.js';

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { orderId } = req.body;
  const result = await PaymentServices.initiatePayment(orderId, userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment initiated successfully',
    data: result,
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const result = await PaymentServices.handleWebhook((req as any).rawBody, sig);
  res.status(200).send({ received: true });
});

export const PaymentControllers = {
  initiatePayment,
  handleWebhook,
};
