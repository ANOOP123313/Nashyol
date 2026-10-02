import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  PackageX,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { returnsApi } from "../../services/api";

interface ReturnRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  orderData: {
    orderNumber: string;
    orderDate: string;
    rawId?: string;
    _id?: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }>;
  };
}

export function ReturnRefundModal({
  isOpen,
  onClose,
  onSuccess,
  orderData,
}: ReturnRefundModalProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const returnReasons = [
    "Product damaged or defective",
    "Wrong item received",
    "Item not as described",
    "Better price available",
    "Changed my mind",
    "Quality not as expected",
    "Size/fit issues",
    "Other",
  ];

  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setUploadedImages((prev) => [...prev, ...newImages]);
      toast.success(`${files.length} image(s) uploaded`);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to return");
      return;
    }
    if (!reason) {
      toast.error("Please select a reason for the return");
      return;
    }
    if (!additionalInfo.trim()) {
      toast.error("Please provide additional details about the return");
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = selectedItems.map((itemId) => {
        const itemObj = orderData.items.find((i) => i.id === itemId);
        return {
          productId: itemId,
          quantity: itemObj ? itemObj.quantity : 1,
          reason: `${reason}${additionalInfo ? `: ${additionalInfo}` : ""}`,
        };
      });

      const orderIdentifier = orderData.rawId || orderData._id || orderData.orderNumber;

      await returnsApi.create({
        orderId: orderIdentifier,
        items: itemsPayload,
      });

      toast.success("Return request submitted successfully!", {
        description: "We'll process your return and schedule pickup within 2-3 business days",
        duration: 5000,
      });
      onSuccess?.();
      onClose();
      // Reset form
      setSelectedItems([]);
      setReason("");
      setAdditionalInfo("");
      setUploadedImages([]);
    } catch (err: any) {
      toast.error("Failed to submit request: " + (err.message || "Error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateRefundAmount = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = orderData.items.find((i) => i.id === itemId);
      return total + (item ? item.price * item.quantity : 0);
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 w-[95vw] sm:w-full rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <RotateCcw className="size-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                Return Request
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Send items back for return & refund
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2 w-full max-w-full overflow-hidden">
          {/* Order Info Banner */}
          <div className="p-3.5 sm:p-4 bg-muted/60 border border-border rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Order Number</p>
                <p className="font-bold text-foreground text-sm sm:text-base">
                  {orderData.orderNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Order Date</p>
                <p className="font-semibold text-foreground text-xs sm:text-sm">
                  {orderData.orderDate}
                </p>
              </div>
            </div>
          </div>

          {/* Select Items */}
          <div>
            <Label className="text-sm sm:text-base font-semibold mb-2.5 block">
              Select Items to Return ({selectedItems.length} selected)
            </Label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {orderData.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedItems.includes(item.id)
                      ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  onClick={() => handleItemToggle(item.id)}
                >
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleItemToggle(item.id)}
                  />
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-14 sm:size-16 object-cover rounded-lg shrink-0 border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-xs sm:text-sm truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-foreground text-sm sm:text-base">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refund Amount */}
          {selectedItems.length > 0 && (
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-300 dark:border-emerald-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-foreground text-sm sm:text-base">
                    Estimated Refund Amount
                  </span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{calculateRefundAmount().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Separator />

          {/* Reason */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Reason for Return *
            </Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {returnReasons.map((reasonOption) => (
                  <div
                    key={reasonOption}
                    className={`flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      reason === reasonOption
                        ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setReason(reasonOption)}
                  >
                    <RadioGroupItem value={reasonOption} id={reasonOption} />
                    <Label
                      htmlFor={reasonOption}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {reasonOption}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Additional Info */}
          <div>
            <Label htmlFor="additionalInfo" className="text-base font-semibold mb-3 block">
              Additional Details *
            </Label>
            <Textarea
              id="additionalInfo"
              placeholder="Please provide more details about your request (minimum 20 characters)"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {additionalInfo.length}/500 characters
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Upload Images (Optional)
            </Label>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-[var(--primary-color)] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    Click to upload images
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 10MB each (Max 5 images)
                  </p>
                </label>
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 size-6 bg-red-600 text-inverse rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Important Info */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 dark:text-amber-300 space-y-1">
                <p className="font-semibold">Important Information:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Returns are processed within 2-3 business days</li>
                  <li>Refunds typically take 5-7 business days</li>
                  <li>Items must be in original condition</li>
                  <li>Free return shipping for defective items</li>
                  <li>
                    For other returns, shipping costs may apply (₹49)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 h-12 bg-gradient-to-r from-[var(--primary-color)] to-orange-600 hover:from-orange-600 hover:to-[var(--primary-color)]"
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>Submit Request</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


