import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function CartSheet() {
  const { items, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = items.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      // Don't allow more than stock
      if (delta > 0 && item.stock && newQuantity > item.stock) {
        return;
      }
      updateQuantity(id, newQuantity);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = items.length > 0 ? 10 : 0;
  const total = subtotal + shipping;

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.warning("Please log in to complete checkout", {
        description: "You'll need to sign in or create an account to continue."
      });
      navigate('/login', { state: { from: '/client/checkout' } });
      return;
    }
    navigate('/client/checkout');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-6 w-6" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-4 h-[calc(100vh-250px)] overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Link to="/client/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">{item.category}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        disabled={item.stock && item.quantity >= item.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 ml-auto text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Button 
            className="w-full mt-4" 
            disabled={items.length === 0}
            onClick={handleProceedToCheckout}
          >
            Proceed to Checkout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
