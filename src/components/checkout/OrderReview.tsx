import { useCheckout } from '@/contexts/CheckoutContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const OrderReview = () => {
  const { state: checkoutState, setStep, resetCheckout } = useCheckout();
  const { state: cartState, clearCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cartState.total;
  const shippingCost = checkoutState.selectedShippingMethod?.price || 0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shippingCost + tax;

  const handlePlaceOrder = async () => {
    try {
      // In a real app, this would make an API call to create the order
      // For now, we'll just simulate success
      toast.success('Order placed successfully!');
      
      // Clear cart and checkout state
      clearCart();
      resetCheckout();
      
      // Navigate to order confirmation
      navigate('/client/orders/confirmation');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Order Summary</h3>
        <div className="space-y-4">
          {cartState.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-muted-foreground">Subtotal</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Shipping</p>
              <p>${shippingCost.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Tax</p>
              <p>${tax.toFixed(2)}</p>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <p>Total</p>
              <p>${total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Shipping Information</h3>
        <div className="space-y-2">
          <p>{checkoutState.shippingAddress?.fullName}</p>
          <p>{checkoutState.shippingAddress?.streetAddress}</p>
          <p>
            {checkoutState.shippingAddress?.city}, {checkoutState.shippingAddress?.state} {checkoutState.shippingAddress?.postalCode}
          </p>
          <p>{checkoutState.shippingAddress?.country}</p>
          <p>{checkoutState.shippingAddress?.phone}</p>
        </div>
        <div className="mt-4">
          <p className="font-medium">{checkoutState.selectedShippingMethod?.name}</p>
          <p className="text-sm text-muted-foreground">
            {checkoutState.selectedShippingMethod?.estimatedDays}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Payment Information</h3>
        {checkoutState.paymentMethod?.type === 'credit_card' ? (
          <div>
            <p>Credit Card</p>
            <p className="text-muted-foreground">
              **** **** **** {checkoutState.paymentMethod.cardNumber?.slice(-4)}
            </p>
            <p className="text-sm text-muted-foreground">
              Expires: {checkoutState.paymentMethod.expiryDate}
            </p>
          </div>
        ) : (
          <div>
            <p>PayPal</p>
            <p className="text-muted-foreground">
              {checkoutState.paymentMethod?.paypalEmail}
            </p>
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('payment')}
        >
          Back to Payment
        </Button>
        <Button
          onClick={handlePlaceOrder}
          className="px-8"
        >
          Place Order
        </Button>
      </div>
    </div>
  );
};
