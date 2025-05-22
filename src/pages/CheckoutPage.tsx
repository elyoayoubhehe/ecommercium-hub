import React, { useState, useEffect } from 'react';
import { ClientNav } from '@/components/ClientNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useCheckout, SHIPPING_METHODS } from '@/contexts/CheckoutContext';
import { useOrder, Address } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ChevronRight, 
  ChevronLeft, 
  CreditCard, 
  Truck, 
  ShoppingBag, 
  CheckCircle,
  Loader2,
  Wallet,
  Image as ImageIcon
} from 'lucide-react';

// Checkout page with steps
const CheckoutPage = () => {
  const { items, clearCart } = useCart();
  const { 
    currentStep,
    shippingAddress, 
    billingAddress,
    sameAsShipping, 
    selectedShippingMethod,
    paymentMethod,
    nextStep,
    prevStep,
    setShippingAddress,
    setBillingAddress,
    setSameAsShipping, 
    setShippingMethod,
    setPaymentMethod,
    resetCheckout 
  } = useCheckout();
  const { createOrder } = useOrder();
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [formShippingAddress, setFormShippingAddress] = useState<Address>({
    fullName: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    phone: ''
  });
  const [formBillingAddress, setFormBillingAddress] = useState<Address>({
    fullName: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    phone: ''
  });
  const [selectedPaymentType, setSelectedPaymentType] = useState<'credit_card' | 'paypal'>('credit_card');

  // Update form values when user info changes
  useEffect(() => {
    if (user?.first_name && user?.last_name) {
      const fullName = `${user.first_name} ${user.last_name}`;
      setFormShippingAddress(prev => ({ ...prev, fullName }));
      setFormBillingAddress(prev => ({ ...prev, fullName }));
    }
  }, [user]);

  // Check authentication on page load
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Please log in to complete checkout', {
        description: 'You need to be logged in to place an order.'
      });
    }
  }, [isAuthenticated]);

  // Calculate order totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = selectedShippingMethod ? selectedShippingMethod.price : 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Handle address form changes
  const handleShippingAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleBillingAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormBillingAddress(prev => ({ ...prev, [name]: value }));
  };

  // Save shipping address and go to next step
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingAddress(formShippingAddress);
    if (sameAsShipping) {
      setBillingAddress(formShippingAddress);
    }
    nextStep();
  };

  // Save payment and go to next step
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setPaymentMethod({
      type: selectedPaymentType,
      // Use a placeholder for display purposes
      lastFour: selectedPaymentType === 'credit_card' ? '1234' : undefined,
      expiryDate: selectedPaymentType === 'credit_card' ? '12/28' : undefined,
      paypalEmail: selectedPaymentType === 'paypal' ? user?.email : undefined
    });
    
    nextStep();
  };

  // Place the order
  const handleCompleteOrder = async () => {
    if (!isAuthenticated || !token) {
      toast.error('You must be logged in to complete your order');
      navigate('/login', { state: { from: '/client/checkout' } });
      return;
    }
    
    if (!shippingAddress || !paymentMethod || !selectedShippingMethod) {
      toast.error('Please complete all required information');
      return;
    }
    
    setIsProcessing(true);
    setOrderError(null);
    
    try {
      // Map cart items to order items
      const orderItems = items.map(item => ({
        id: parseInt(item.id.toString()), // Ensure ID is a number
        name: item.name,
        price: Number(item.price), // Ensure price is a number
        quantity: Number(item.quantity), // Ensure quantity is a number
        // Include other fields for order history
        image_url: item.image_url || '',
        category: item.category || 'Uncategorized'
      }));
      
      // Verify all cart items have the required fields
      for (const item of orderItems) {
        if (!item.id || isNaN(item.id)) {
          throw new Error(`Invalid product ID: ${item.id}`);
        }
        if (!item.price || isNaN(item.price)) {
          throw new Error(`Invalid price for product: ${item.name}`);
        }
        if (!item.quantity || isNaN(item.quantity)) {
          throw new Error(`Invalid quantity for product: ${item.name}`);
        }
      }
      
      // Create the order
      const orderData = {
        items: orderItems,
        subtotal: Number(subtotal),
        shipping: Number(shipping),
        tax: Number(tax),
        total: Number(total),
        status: 'pending' as const,
        shippingAddress: shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress, // Use shipping address if same
        paymentMethod: {
          type: paymentMethod.type,
          lastFour: paymentMethod.type === 'credit_card' ? paymentMethod.lastFour || '1234' : undefined,
          paypalEmail: paymentMethod.type === 'paypal' ? user?.email : undefined
        }
      };
      
      console.log('Sending order data:', orderData);
      const order = await createOrder(orderData);
      
      // Clear cart and reset checkout after successful order
      clearCart();
      resetCheckout();
      
      // Show success message
      toast.success('Order placed successfully!', {
        description: `Your order #${order.id} has been received and is being processed.`
      });
      
      // Redirect to order confirmation
      navigate(`/client/orders/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderError(error instanceof Error ? error.message : 'There was a problem placing your order');
      toast.error('Failed to place order', {
        description: 'Please try again or contact customer support.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Redirect if cart is empty
  if (items.length === 0) {
  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <Card className="p-8 text-center">
            <p className="mb-4">Your cart is empty. Please add items before proceeding to checkout.</p>
            <Button asChild>
              <Link to="/client/products">Browse Products</Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }
  
  // Step indicators
  const renderStepIndicator = () => {
    const steps = [
      { id: 'cart-review', label: 'Cart Review', icon: <ShoppingBag className="h-5 w-5" /> },
      { id: 'shipping', label: 'Shipping', icon: <Truck className="h-5 w-5" /> },
      { id: 'payment', label: 'Payment', icon: <CreditCard className="h-5 w-5" /> },
      { id: 'review', label: 'Review', icon: <CheckCircle className="h-5 w-5" /> }
    ];
    
    return (
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
          
          return (
            <div 
              key={step.id} 
              className={`flex flex-col items-center ${index > 0 ? 'flex-1' : ''}`}
            >
              <div className="flex items-center w-full">
                <div 
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCurrent ? 'bg-primary text-white' : 
                    isCompleted ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`h-1 flex-1 ${
                      isCompleted ? 'bg-green-300' : 'bg-muted'
                    }`}
                  ></div>
                )}
              </div>
              <span 
                className={`text-sm mt-2 ${
                  isCurrent ? 'text-primary font-semibold' : 
                  isCompleted ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render different step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'cart-review':
        return (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0">
                      {item.image_url || item.image ? (
                        <img 
                          src={item.image_url || item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover rounded-md" 
                          onError={(e) => {
                            // Replace with a div containing an icon instead of external placeholder
                            const parent = e.currentTarget.parentNode;
                            if (parent) {
                              const fallbackDiv = document.createElement('div');
                              fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-muted text-muted-foreground';
                              fallbackDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
                              parent.replaceChild(fallbackDiv, e.currentTarget);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="mt-6 flex justify-between">
              <Link to="/client/cart">
                <Button variant="outline">Edit Cart</Button>
              </Link>
              <Button onClick={nextStep}>
                Continue to Shipping <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        );
        
      case 'shipping':
        return (
          <form onSubmit={handleShippingSubmit}>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    value={formShippingAddress.fullName}
                    onChange={handleShippingAddressChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    value={formShippingAddress.phone}
                    onChange={handleShippingAddressChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input 
                  id="streetAddress" 
                  name="streetAddress"
                  value={formShippingAddress.streetAddress}
                  onChange={handleShippingAddressChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    name="city"
                    value={formShippingAddress.city}
                    onChange={handleShippingAddressChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    name="state"
                    value={formShippingAddress.state}
                    onChange={handleShippingAddressChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input 
                    id="postalCode" 
                    name="postalCode"
                    value={formShippingAddress.postalCode}
                    onChange={handleShippingAddressChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    name="country"
                    value={formShippingAddress.country}
                    onChange={handleShippingAddressChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-3">Shipping Method</h3>
                <div className="space-y-3">
                  {SHIPPING_METHODS.map((method) => (
                    <label 
                      key={method.id} 
                      className={`flex items-center justify-between p-3 border rounded-md cursor-pointer ${
                        selectedShippingMethod?.id === method.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="shippingMethod" 
                          value={method.id}
                          checked={selectedShippingMethod?.id === method.id}
                          onChange={() => setShippingMethod(method)}
                          className="accent-primary"
                          required
                        />
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.estimatedDays}</p>
                        </div>
                      </div>
                      <span className="font-bold">${method.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit">
                  Continue to Payment <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </form>
        );
        
      case 'payment':
        return (
          <form onSubmit={handlePaymentSubmit}>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-4 mb-6">
                <label
                  className={`flex items-center justify-between p-4 border rounded-md cursor-pointer ${
                    selectedPaymentType === 'credit_card' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentType"
                      value="credit_card"
                      checked={selectedPaymentType === 'credit_card'}
                      onChange={() => setSelectedPaymentType('credit_card')}
                      className="accent-primary"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Credit Card</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src="/visa.svg" alt="Visa" className="h-6" />
                    <img src="/mastercard.svg" alt="Mastercard" className="h-6" />
                    <img src="/amex.svg" alt="American Express" className="h-6" />
                  </div>
                </label>
                
                <label
                  className={`flex items-center justify-between p-4 border rounded-md cursor-pointer ${
                    selectedPaymentType === 'paypal' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentType"
                      value="paypal"
                      checked={selectedPaymentType === 'paypal'}
                      onChange={() => setSelectedPaymentType('paypal')}
                      className="accent-primary"
                    />
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">PayPal</span>
                    </div>
                  </div>
                  <img src="/paypal.svg" alt="PayPal" className="h-6" />
                </label>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-6">
                <p className="text-sm text-amber-700">
                  For demonstration purposes, no actual payment information is required. 
                  All transactions are simulated.
                </p>
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit">
                  Review Order <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </form>
        );
        
      case 'review':
        return (
          <>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0">
                        {item.image_url || item.image ? (
                          <img 
                            src={item.image_url || item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded-md" 
                            onError={(e) => {
                              // Replace with a div containing an icon instead of external placeholder
                              const parent = e.currentTarget.parentNode;
                              if (parent) {
                                const fallbackDiv = document.createElement('div');
                                fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-muted text-muted-foreground';
                                fallbackDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
                                parent.replaceChild(fallbackDiv, e.currentTarget);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </Card>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
                {shippingAddress && (
                  <div className="text-sm">
                    <p className="font-medium">{shippingAddress.fullName}</p>
                    <p>{shippingAddress.streetAddress}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                    <p>{shippingAddress.country}</p>
                    <p className="mt-1">Phone: {shippingAddress.phone}</p>
              </div>
            )}
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-3">Payment Method</h2>
                {paymentMethod && (
                  <div className="text-sm">
                    <p className="font-medium">
                      {paymentMethod.type === 'credit_card' ? 'Credit Card' : 'PayPal'}
                    </p>
                    {paymentMethod.type === 'credit_card' && (
                      <p>•••• •••• •••• 1234</p>
                    )}
                    {paymentMethod.type === 'paypal' && user?.email && (
                      <p>{user.email}</p>
                    )}
                  </div>
                )}
              </Card>
              </div>
            
            {orderError && (
              <Card className="p-4 mb-6 border-red-300 bg-red-50">
                <p className="text-red-600">{orderError}</p>
                <p className="text-sm text-red-500 mt-1">
                  Please try again or contact customer support if the problem persists.
                </p>
              </Card>
            )}
            
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={handleCompleteOrder} 
                disabled={isProcessing}
                className="bg-primary hover:bg-primary/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
              </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        {renderStepIndicator()}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content - changes based on step */}
          <div className="md:col-span-2">
            {renderStepContent()}
          </div>

          {/* Order Summary - stays constant */}
          <div>
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Total</h2>
              <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                  <span>
                    {selectedShippingMethod
                      ? `$${selectedShippingMethod.price.toFixed(2)}`
                      : 'TBD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
              </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                All transactions are secure and encrypted
              </p>
              
              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-700">
                    Please <Link to="/login" className="underline font-medium">log in</Link> to complete your purchase.
                  </p>
            </div>
              )}
          </Card>
        </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
