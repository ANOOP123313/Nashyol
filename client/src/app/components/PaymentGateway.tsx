import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import {
  CreditCard,
  Banknote,
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentGatewayProps {
  amount: number;
  onPaymentComplete?: (paymentData: any) => void | Promise<void>;
  onBeforePayment?: () => boolean;
  onPaymentMethodChange?: (method: string) => void;
  codEnabled?: boolean;
  codCharge?: number;
  showTitle?: boolean;
  disabled?: boolean;
}

export function PaymentGateway({
  amount,
  onPaymentComplete,
  onBeforePayment,
  onPaymentMethodChange,
  codEnabled = true,
  codCharge = 0,
  showTitle = true,
  disabled = false,
}: PaymentGatewayProps) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment gateway options
  const paymentMethods = [
    {
      id: "card",
      name: "Pay Now",
      icon: CreditCard,
      description: "Pay securely via Stripe (Credit/Debit Card)",
      badge: "Secure",
      logos: ["💳"],
    },
    ...(codEnabled ? [{
      id: "cod",
      name: "Cash on Delivery",
      icon: Banknote,
      description: codCharge > 0 ? `Pay when you receive (+$${codCharge.toFixed(2)} COD fee)` : "Pay when you receive",
      badge: "Available",
      logos: ["💵"],
    }] : []),
  ];

  useEffect(() => {
    if (!codEnabled && paymentMethod === "cod") {
      setPaymentMethod("card");
      onPaymentMethodChange?.("card");
    }
  }, [codEnabled, paymentMethod, onPaymentMethodChange]);



  const validatePaymentMethod = () => {
    return true; // Stripe handles its own validation later
  };

  const processPayment = async () => {
    setIsProcessing(true);
    try {
      if (onBeforePayment && !onBeforePayment()) {
        setIsProcessing(false);
        return;
      }
      
      const paymentData = {
        method: paymentMethod,
        amount,
        timestamp: new Date().toISOString(),
      };

      if (onPaymentComplete) await onPaymentComplete(paymentData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to process checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (disabled) {
      toast.error("Please accept Terms & Conditions to continue");
      return;
    }

    if (onBeforePayment && !onBeforePayment()) return;

    if (!validatePaymentMethod()) return;

    processPayment();
  };

  const selectedMethod = paymentMethods.find((m) => m.id === paymentMethod);

  return (
    <Card className="p-4 sm:p-6 bg-card border-none shadow-none">
      {showTitle && (
        <>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Payment Gateway
            </h2>
            <Badge
              variant="outline"
              className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-xs"
            >
              <Shield className="size-3 mr-1" />
              Secure
            </Badge>
          </div>
          <Separator className="mb-4 sm:mb-6" />
        </>
      )}

      {/* Amount Display */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-[var(--primary-color)]/10 to-orange-500/10 dark:from-[var(--primary-color)]/20 dark:to-orange-500/20 rounded-lg border-2 border-[var(--primary-color)]/30">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Amount
          </span>
          <span className="text-xl sm:text-2xl font-bold text-[var(--primary-color)]">
            ${amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-4 sm:mb-6">
        <Label className="text-sm font-semibold mb-3 sm:mb-4 block text-foreground">
          Select Payment Method
        </Label>
        <RadioGroup value={paymentMethod} onValueChange={(method) => { setPaymentMethod(method); onPaymentMethodChange?.(method); }}>
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;

              return (
                <div
                  key={method.id}
                  className={`relative flex items-center space-x-3 border-2 rounded-xl p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md ${isSelected
                      ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5 dark:bg-[var(--primary-color)]/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-[var(--primary-color)]/50"
                    }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <RadioGroupItem value={method.id} id={method.id} className="flex-shrink-0" />
                  <Label
                    htmlFor={method.id}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div
                        className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${isSelected
                            ? "bg-[var(--primary-color)] text-inverse"
                            : "bg-muted text-muted-foreground"
                          }`}
                      >
                        <Icon className="size-4 sm:size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm sm:text-base text-foreground truncate">
                            {method.name}
                          </span>
                          {method.logos.map((logo, idx) => (
                            <span key={idx} className="text-base sm:text-lg flex-shrink-0">
                              {logo}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {method.description}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-muted flex-shrink-0 hidden sm:flex"
                      >
                        {method.badge}
                      </Badge>
                    </div>
                  </Label>
                  {isSelected && (
                    <CheckCircle2 className="absolute top-2 right-2 size-4 sm:size-5 text-[var(--primary-color)]" />
                  )}
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      <Separator className="my-4 sm:my-6" />

      {/* Payment Details Based on Selected Method */}
      <div className="space-y-6">
        {paymentMethod === "card" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-start gap-4">
                <CreditCard className="size-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Pay via Stripe
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You will be securely redirected to Stripe or a secure modal will appear to complete your card payment.
                  </p>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>💳 Visa</span>
                    <span>💳 Mastercard</span>
                    <span>💳 Amex</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "cod" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-start gap-4">
                <Banknote className="size-8 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Cash on Delivery
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Pay with cash when your order is delivered to your doorstep.
                  </p>
                  <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                    <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
                    <span>
                      COD orders may take 1-2 additional days for processing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator className="my-4 sm:my-6" />

      {/* Security Info */}
      <div className="mb-4 sm:mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="size-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-green-900 dark:text-green-300 mb-1">
              Secure Payment
            </p>
            <p className="text-green-700 dark:text-green-400">
              All transactions are encrypted and secure. Your payment information
              is never stored on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <Button
        size="lg"
        onClick={handlePayment}
        className={`w-full bg-gradient-to-r from-[var(--primary-color)] to-orange-600 hover:from-orange-600 hover:to-[var(--primary-color)] text-white h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all border-none ${disabled || isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
      >
        {isProcessing ? (
          <>
            <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="size-5 mr-2" />
            Pay ₹{amount.toFixed(2)} Securely
          </>
        )}
      </Button>


      {/* Trust Badges */}
      <div className="mt-4 sm:mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Shield className="size-3" />
          <span>SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock className="size-3" />
          <span>PCI DSS Compliant</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="size-3" />
          <span>Verified Merchant</span>
        </div>
      </div>
    </Card>
  );
}


