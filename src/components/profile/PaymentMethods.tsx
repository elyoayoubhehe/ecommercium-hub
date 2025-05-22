import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreditCard, Plus, Trash2, Check } from "lucide-react";

interface PaymentMethod {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cardHolder: string;
  isDefault: boolean;
  brand: "visa" | "mastercard" | "amex";
}

// Mock data - replace with real payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    cardNumber: "****-****-****-4242",
    expiryDate: "12/25",
    cardHolder: "John Doe",
    isDefault: true,
    brand: "visa"
  },
  {
    id: "2",
    cardNumber: "****-****-****-5555",
    expiryDate: "10/24",
    cardHolder: "John Doe",
    isDefault: false,
    brand: "mastercard"
  }
];

const cardBrandLogos = {
  visa: "/visa-logo.svg",
  mastercard: "/mastercard-logo.svg",
  amex: "/amex-logo.svg"
};

export function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, you would send this data to your payment processor
      const formData = new FormData(e.currentTarget);
      const newCard: PaymentMethod = {
        id: Math.random().toString(36).substr(2, 9),
        cardNumber: "****-****-****-" + formData.get("cardNumber")?.toString().slice(-4),
        expiryDate: formData.get("expiryDate")?.toString() || "",
        cardHolder: formData.get("cardHolder")?.toString() || "",
        isDefault: false,
        brand: "visa" // In reality, this would be determined by the card number
      };

      setPaymentMethods(prev => [...prev, newCard]);
      toast.success("Payment method added successfully");
      setIsAddingCard(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error("Failed to add payment method");
      console.error("Error adding payment method:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    toast.success("Payment method removed successfully");
  };

  const setDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    toast.success("Default payment method updated");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Payment Methods</h2>
        <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Payment Method</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  required
                  maxLength={19}
                  pattern="\d*"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    required
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    type="password"
                    placeholder="123"
                    required
                    maxLength={4}
                    pattern="\d*"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardHolder">Card Holder Name</Label>
                <Input
                  id="cardHolder"
                  name="cardHolder"
                  placeholder="John Doe"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Adding Card..." : "Add Card"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.cardNumber}</span>
                    {method.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expires {method.expiryDate}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deletePaymentMethod(method.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {!method.isDefault && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => setDefaultPaymentMethod(method.id)}
              >
                <Check className="mr-2 h-4 w-4" />
                Set as Default
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
