import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { ClientNav } from '@/components/ClientNav';
import { Button } from '@/components/ui/button';
import { Steps } from '@/components/ui/steps';
import { Card } from '@/components/ui/card';

const Checkout = () => {
  const { items: cartItems } = useCart();
  const { currentStep, nextStep, prevStep } = useCheckout();
  const navigate = useNavigate();

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/client/cart');
    }
  }, [cartItems.length, navigate]);

  const renderStepStatus = (stepName: string): 'upcoming' | 'current' | 'complete' | 'pending' => {
    const stepOrder = ['cart-review', 'shipping', 'payment'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepName);

    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const steps = [
    {
      title: 'Cart Review',
      description: 'Review your items',
      status: renderStepStatus('cart-review')
    },
    {
      title: 'Shipping',
      description: 'Enter shipping details',
      status: renderStepStatus('shipping')
    },
    {
      title: 'Payment',
      description: 'Complete payment',
      status: renderStepStatus('payment')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <Steps steps={steps} className="mb-8" />

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {currentStep === 'cart-review' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Cart Review</h2>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 'shipping' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Shipping Details</h2>
                {/* Add shipping form here */}
              </div>
            )}

            {currentStep === 'payment' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Payment</h2>
                {/* Add payment form here */}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <Card className="p-4">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 'cart-review'}
          >
            Previous
          </Button>
          <Button
            onClick={nextStep}
            disabled={currentStep === 'payment'}
          >
            {currentStep === 'payment' ? 'Place Order' : 'Next'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
