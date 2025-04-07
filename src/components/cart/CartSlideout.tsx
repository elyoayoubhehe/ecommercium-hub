import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, Trash2, Info } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductsContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export function CartSlideout() {
  const { items: cart, removeFromCart, updateQuantity } = useCart();
  const { products } = useProducts();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const subtotal = cart.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  // Count the total number of items in the cart
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleNavigateToCart = () => {
    setIsOpen(false);
    navigate('/client/cart');
  };

  // Handle quantity changes with stock validation
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      return; // Don't allow quantity less than 1
    }
    
    const product = products.find(p => p.id === id);
    
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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:scale-105 transition-transform"
        >
          <ShoppingCart className="h-6 w-6" />
          <AnimatePresence>
            {cartItemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Shopping Cart</SheetTitle>
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
            <div className="mt-8 space-y-4 h-[calc(100vh-250px)] overflow-y-auto pr-2">
              <AnimatePresence>
                {cart.map((item) => {
                  const product = products.find(p => p.id === item.id);
                  const isLowStock = product && product.stock <= 5 && product.stock > 0;
                  const isOutOfStock = product && product.stock === 0;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                    >
                      <Card className="p-4">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-semibold">{item.name}</h3>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveItem(item.id, item.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                            
                            {isLowStock && (
                              <Badge variant="outline" className="mt-1 text-yellow-600 border-yellow-600">
                                Only {product.stock} left
                              </Badge>
                            )}
                            {isOutOfStock && (
                              <Badge variant="outline" className="mt-1 text-destructive border-destructive">
                                Out of stock
                              </Badge>
                            )}
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-7 w-7 rounded-r-none"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <div className="h-7 px-2 flex items-center justify-center border-y">
                                  {item.quantity}
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-7 w-7 rounded-l-none"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  disabled={product && item.quantity >= product.stock}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="mt-6 space-y-4">
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleNavigateToCart}>
                  View Cart
                </Button>
                <Button onClick={() => {
                  setIsOpen(false);
                  navigate('/client/checkout');
                }}>
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
