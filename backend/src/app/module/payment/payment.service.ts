import Stripe from 'stripe';
import prisma from '../../lib/prisma.js';
import { sendEmail } from '../../utils/email.js';
import config from '../../config/index.js';

const stripe = new Stripe(config.stripe_secret_key as string);

const initiatePayment = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { 
      buyer: true,
      items: {
        include: { product: true }
      }
    }
  });

  if (!order) throw new Error('Order not found');

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: order.items.map((item) => {
        const images = item.product.images
          .map((img) => {
            if (!img) return null;
            if (img.startsWith('http')) return img;
            const baseUrl = config.backend_url;
            const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            const cleanImg = img.startsWith('/') ? img : `/${img}`;
            return `${cleanBase}${cleanImg}`;
          })
          .filter((img): img is string => !!img)
          .slice(0, 1);

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.product.title,
              description: item.product.description.substring(0, 100),
              images: images.length > 0 ? images : undefined,
            },
            unit_amount: Math.round(Number(item.unitPrice) * 100),
          },
          quantity: item.quantity,
        };
      }),
      mode: 'payment',
      success_url: `${config.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontend_url}/payment/cancel`,
      metadata: {
        orderId: order.id,
        userId: userId,
      },
      customer_email: order.buyer.email,
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        transactionId: session.id,
        amount: order.totalAmount,
        provider: 'STRIPE',
        status: 'PENDING'
      }
    });

    return { url: session.url };
  } catch (stripeError: any) {
    console.error('STRIKE SESSION ERROR DETAILS:', {
      message: stripeError.message,
      type: stripeError.type,
      raw: stripeError.raw,
    });
    throw stripeError;
  }
};

const handleWebhook = async (payload: any, sig: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      config.stripe_webhook_secret as string
    );
  } catch (err: any) {
    throw new Error(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { orderId: orderId },
          data: { 
            status: 'SUCCESS', 
            paidAt: new Date(),
            metadata: session as any
          }
        });

        await tx.order.update({
          where: { id: orderId },
          data: { status: 'PAID', paymentRef: session.id }
        });
      });

      // Send Confirmation Email
      const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { buyer: true }
      });
      
      if (order && order.buyer.email) {
          try {
              await sendEmail(
                  order.buyer.email,
                  'Payment Confirmation - EchoNet Marketplace',
                  `
                  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                      <h2 style="color: #000;">Payment Successful!</h2>
                      <p>Hello <strong>${order.buyer.name}</strong>,</p>
                      <p>Your payment for order <strong>#${order.id.substring(0, 8)}</strong> has been received successfully.</p>
                      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                          <p style="margin: 0;"><strong>Amount Paid:</strong> $${order.totalAmount}</p>
                          <p style="margin: 0;"><strong>Transaction ID:</strong> ${session.id}</p>
                      </div>
                      <p>Thank you for shopping on EchoNet Marketplace!</p>
                  </div>
                  `
              );
          } catch (emailErr) {
              console.error('Failed to send confirmation email:', emailErr);
          }
      }
    }
  }

  return { success: true };
};

export const PaymentServices = {
  initiatePayment,
  handleWebhook,
};

