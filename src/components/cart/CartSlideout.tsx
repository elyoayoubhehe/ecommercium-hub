import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';

export function CartSlideout() {
  const { items: cart, removeFromCart, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const subtotal = cart.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );
  const shipping = 10; // You can make this dynamic based on your needs
  const total = subtotal + shipping;

  const handleQuickCheckout = async () => {
    setIsCheckingOut(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsCheckingOut(false);
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:scale-105 transition-transform"
        >
          <ShoppingCart className="h-6 w-6 text-[#9b87f5]" />
          <AnimatePresence>
            {cart.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-[#9b87f5] text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                {cart.length}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-[#9b87f5]">Shopping Cart</SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="text-lg font-medium">Your cart is empty</p>
            <Button 
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                navigate('/client/products');
              }}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-4 h-[calc(100vh-250px)] overflow-y-auto">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <Card className="p-4">
                      <div className="flex gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 ml-auto text-red-500"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
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
                className="w-full mt-4 bg-[#9b87f5] hover:bg-[#8b77e5]"
                onClick={handleQuickCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
