import { useState } from 'react';
import { useCheckout, SHIPPING_METHODS } from '@/contexts/CheckoutContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export const ShippingForm = () => {
  const {
    state,
    setShippingAddress,
    setBillingAddress,
    setSameAsShipping,
    setShippingMethod,
    setStep,
  } = useCheckout();

  const [formData, setFormData] = useState({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      country: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (Object.values(formData).some(value => !value)) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!state.selectedShippingMethod) {
      toast.error('Please select a shipping method');
      return;
    }

    setShippingAddress(formData);
    if (state.sameAsShipping) {
      setBillingAddress(formData);
    }

    setStep('payment');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="John Doe"
          />
        </div>

        <div>
          <Label htmlFor="streetAddress">Street Address</Label>
          <Input
            id="streetAddress"
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleInputChange}
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
            />
          </div>

          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="State"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="12345"
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Select
              value={formData.country}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Shipping Method</h3>
        <RadioGroup
          value={state.selectedShippingMethod?.id}
          onValueChange={(value) => {
            const method = SHIPPING_METHODS.find(m => m.id === value);
            if (method) setShippingMethod(method);
          }}
          className="space-y-4"
        >
          {SHIPPING_METHODS.map((method) => (
            <div key={method.id} className="flex items-center space-x-4">
              <RadioGroupItem value={method.id} id={method.id} />
              <Label htmlFor={method.id} className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {method.estimatedDays}
                    </div>
                  </div>
                  <div className="font-medium">
                    ${method.price.toFixed(2)}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="sameAsShipping"
          checked={state.sameAsShipping}
          onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
        />
        <Label htmlFor="sameAsShipping">
          Billing address same as shipping
        </Label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Continue to Payment
        </Button>
      </div>
    </form>
  );
};
