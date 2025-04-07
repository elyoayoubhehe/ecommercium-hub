import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientNav } from '@/components/ClientNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/contexts/ProductsContext';
import { toast } from 'sonner';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  // Calculate cart totals
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const discount = 0; // No discount by default
  const total = subtotal + shipping - discount;

  // Check if stock is available before proceeding to checkout
  const handleProceedToCheckout = () => {
    let hasStockIssue = false;
    
    // Verify each item in cart has enough stock
    items.forEach(cartItem => {
      const product = products.find(p => p.id === cartItem.id);
      if (product && product.stock < cartItem.quantity) {
        toast.error(`Not enough stock for ${cartItem.name}. Only ${product.stock} available.`);
        hasStockIssue = true;
      }
    });

    if (!hasStockIssue) {
      navigate('/client/checkout');
    }
  };

  // Handle quantity changes with stock validation
  const handleQuantityChange = (id: string, newQuantity: number) => {
    const product = products.find(p => p.id === id);
    
    if (newQuantity <= 0) {
      return; // Don't allow quantity less than 1
    }
    
    if (product && newQuantity > product.stock) {
      toast.error(`Maximum available quantity is ${product.stock}`);
      // Set to maximum available quantity
      updateQuantity(id, product.stock);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  // Handle removing an item from the cart
  const handleRemoveItem = (id: string, name: string) => {
    removeFromCart(id);
    toast.success(`${name} removed from cart`);
  };

  // If cart is empty, show empty state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <ClientNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button 
              onClick={() => navigate('/client/products')}
              className="flex items-center gap-2"
            >
              Continue Shopping
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-muted p-4 rounded-md hidden md:grid grid-cols-12 font-medium">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Total</div>
            </div>
            
            {items.map(item => {
              const product = products.find(p => p.id === item.id);
              const isLowStock = product && product.stock <= 5 && product.stock > 0;
              const isOutOfStock = product && product.stock === 0;
              
              return (
                <Card key={item.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Product */}
                    <div className="md:col-span-6 flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-md shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        {isLowStock && (
                          <p className="text-xs text-yellow-600">Only {product.stock} left in stock</p>
                        )}
                        {isOutOfStock && (
                          <p className="text-xs text-red-600">Out of stock</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="md:col-span-2 text-center">
                      <div className="flex items-center justify-between md:justify-center">
                        <span className="md:hidden">Price:</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Quantity */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="md:hidden">Quantity:</span>
                      <div className="flex items-center">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value)) {
                              handleQuantityChange(item.id, value);
                            }
                          }}
                          className="h-8 w-12 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={product && item.quantity >= product.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Total */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                      <div className="flex md:hidden items-center gap-2">
                        <span>Total:</span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="hidden md:flex items-center gap-4">
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveItem(item.id, item.name)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Mobile Remove Button */}
                    <div className="md:hidden">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 w-full"
                        onClick={() => handleRemoveItem(item.id, item.name)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/client/products')}
              >
                Continue Shopping
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  clearCart();
                  toast.success('Cart has been cleared');
                }}
              >
                Clear Cart
              </Button>
            </div>
          </div>
          
          {/* Cart Summary */}
          <div>
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="outline">Apply</Button>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
