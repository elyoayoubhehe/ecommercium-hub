import { useState } from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export const PaymentForm = () => {
  const { state, setPaymentMethod, setStep } = useCheckout();
  const [paymentType, setPaymentType] = useState<'credit_card' | 'paypal'>('credit_card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    paypalEmail: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCardNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      cardNumber: value,
    }));
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatExpiryDate(e.target.value);
    setFormData(prev => ({
      ...prev,
      expiryDate: value,
    }));
  };

  const validateCreditCard = () => {
    if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Invalid card number');
      return false;
    }
    if (formData.cardHolder.length < 3) {
      toast.error('Invalid card holder name');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      toast.error('Invalid expiry date');
      return false;
    }
    if (formData.cvv.length !== 3) {
      toast.error('Invalid CVV');
      return false;
    }
    return true;
  };

  const validatePaypal = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.paypalEmail)) {
      toast.error('Invalid PayPal email');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentType === 'credit_card') {
      if (!validateCreditCard()) return;
      setPaymentMethod({
        type: 'credit_card',
        cardNumber: formData.cardNumber,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
      });
    } else {
      if (!validatePaypal()) return;
      setPaymentMethod({
        type: 'paypal',
        paypalEmail: formData.paypalEmail,
      });
    }

    setStep('review');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Payment Method</h3>
        <RadioGroup
          value={paymentType}
          onValueChange={(value: 'credit_card' | 'paypal') => setPaymentType(value)}
          className="space-y-4"
        >
          <div className="flex items-center space-x-4">
            <RadioGroupItem value="credit_card" id="credit_card" />
            <Label htmlFor="credit_card" className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Credit Card</span>
            </Label>
          </div>

          <div className="flex items-center space-x-4">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>PayPal</span>
            </Label>
          </div>
        </RadioGroup>
      </Card>

      {paymentType === 'credit_card' ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>

          <div>
            <Label htmlFor="cardHolder">Card Holder Name</Label>
            <Input
              id="cardHolder"
              name="cardHolder"
              value={formData.cardHolder}
              onChange={handleInputChange}
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleExpiryDateChange}
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>

            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                type="password"
                placeholder="123"
                maxLength={3}
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <Label htmlFor="paypalEmail">PayPal Email</Label>
          <Input
            id="paypalEmail"
            name="paypalEmail"
            value={formData.paypalEmail}
            onChange={handleInputChange}
            type="email"
            placeholder="you@example.com"
          />
        </div>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('shipping')}
        >
          Back to Shipping
        </Button>
        <Button type="submit">
          Review Order
        </Button>
      </div>
    </form>
  );
};
