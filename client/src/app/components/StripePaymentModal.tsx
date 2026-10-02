"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { paymentsApi } from "@/services/api";

// Initialize Stripe outside of component to avoid recreating the object on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function CheckoutForm({ orderId, onPaymentSuccess }: { orderId: string | null; onPaymentSuccess: (paymentIntentId?: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      if (orderId) {
        try {
          await paymentsApi.verify(orderId, paymentIntent.id);
          toast.success("Payment successful!");
          onPaymentSuccess(paymentIntent.id);
        } catch (err: any) {
          toast.error(err.message || "Payment verification failed.");
          onPaymentSuccess(paymentIntent.id);
        }
      } else {
        // If orderId is missing, verification happens during order creation
        toast.success("Payment successful!");
        onPaymentSuccess(paymentIntent.id);
      }
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {message && <div className="text-sm text-red-500 font-medium">{message}</div>}
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-[var(--primary-color)] to-orange-600 hover:from-orange-600 hover:to-[var(--primary-color)] text-white h-12 text-lg shadow-lg hover:shadow-xl transition-all"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
}

export function StripePaymentModal({
  isOpen,
  clientSecret,
  orderId,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  clientSecret: string | null;
  orderId?: string | null;
  onClose: () => void;
  onSuccess: (paymentIntentId?: string) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Enter your card details securely via Stripe.
          </DialogDescription>
        </DialogHeader>
        {clientSecret && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm orderId={orderId || null} onPaymentSuccess={onSuccess} />
          </Elements>
        ) : (
          <div className="py-8 flex justify-center">
            <div className="size-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
