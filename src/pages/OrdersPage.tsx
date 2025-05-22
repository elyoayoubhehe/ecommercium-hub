import React, { useEffect, useState } from 'react';
import { ClientNav } from '@/components/ClientNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useOrder, Order } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Package, FileText, ShoppingBag, Clock, Check, XCircle, Loader2 } from 'lucide-react';
import { format as dateFormat } from 'date-fns';

const OrdersPage = () => {
  const { fetchOrders, orders, isLoading, error, cancelOrder } = useOrder();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/client/orders' } });
      return;
    }

    const loadOrders = async () => {
      try {
        await fetchOrders();
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };
    
    loadOrders();
  }, [isAuthenticated, navigate, fetchOrders]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      setIsCancelling(true);
      try {
        await cancelOrder(orderId);
        toast.success('Order cancelled successfully');
        // If we're viewing this order's details, update the selected order
        if (selectedOrder?.id === orderId) {
          const updatedOrder = orders.find(o => o.id === orderId);
          if (updatedOrder) {
            setSelectedOrder(updatedOrder);
          }
        }
      } catch (err) {
        toast.error('Failed to cancel order');
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4 mr-1" /> },
      processing: { color: 'bg-blue-100 text-blue-800', icon: <Loader2 className="h-4 w-4 mr-1 animate-spin" /> },
      shipped: { color: 'bg-indigo-100 text-indigo-800', icon: <Package className="h-4 w-4 mr-1" /> },
      delivered: { color: 'bg-green-100 text-green-800', icon: <Check className="h-4 w-4 mr-1" /> },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4 mr-1" /> }
    };
    
    const config = statusConfig[status];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const format = (date: Date | string | number, formatStr: string): string => {
    try {
      return dateFormat(new Date(date), formatStr);
    } catch (e) {
      return new Date(date).toLocaleDateString();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    
    try {
      return format(new Date(dateString), 'PP');
    } catch (error) {
      console.warn('Error formatting date:', error);
      return dateString || 'Unknown date';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <Button asChild variant="outline">
            <Link to="/client/products">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <Card className="p-6 text-center bg-red-50 text-red-800 mb-6">
            <p>There was an error loading your orders. Please try again later.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => fetchOrders()}
            >
              Retry
            </Button>
          </Card>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">No Orders Yet</h2>
              <p className="text-muted-foreground">You haven't placed any orders yet.</p>
              <Button asChild className="mt-2">
                <Link to="/client/products">Start Shopping</Link>
              </Button>
            </div>
          </Card>
        )}

        {!isLoading && !error && orders.length > 0 && !selectedOrder && (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-5">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order #{typeof order.id === 'string' && order.id.includes('_') ? 
                      order.id.split('_')[1] : order.id}</p>
                    <p className="font-semibold">{formatDate(order.createdAt || order.created_at || '')}</p>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex-grow md:text-center">
                    <p className="text-sm">{order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}</p>
                    <p className="font-bold">${(order.total || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      View Details
                    </Button>
                    {order.status === 'pending' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={isCancelling}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {selectedOrder && (
          <div>
            <Button 
              variant="outline" 
              onClick={handleCloseDetails}
              className="mb-4"
            >
              Back to Orders
            </Button>
            
            <Card className="p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Order Details</h2>
                  <p className="text-sm text-muted-foreground">
                    Order #{typeof selectedOrder.id === 'string' && selectedOrder.id.includes('_') ? 
                      selectedOrder.id.split('_')[1] : selectedOrder.id} - {formatDate(selectedOrder.createdAt || selectedOrder.created_at || '')}
                  </p>
                </div>
                <div className="mt-2 md:mt-0">
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0">
                            {item.image_url ? (
                              <img 
                                src={item.image_url} 
                                alt={item.name || 'Product'} 
                                className="w-full h-full object-cover rounded-md" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                {item.category?.charAt(0) || 'P'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.name || 'Unknown Product'}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity || 1}</p>
                          </div>
                        </div>
                        <p className="font-medium">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <div className="text-sm">
                      {typeof selectedOrder.shipping_address === 'string' && (
                        (() => {
                          try {
                            const address = JSON.parse(selectedOrder.shipping_address);
                            return (
                              <>
                                <p>{address.fullName}</p>
                                <p>{address.streetAddress}</p>
                                <p>{address.city}, {address.state} {address.postalCode}</p>
                                <p>{address.country}</p>
                                <p className="mt-1">Phone: {address.phone}</p>
                              </>
                            );
                          } catch (e) {
                            return <p>{selectedOrder.shipping_address}</p>;
                          }
                        })()
                      )}
                      {typeof selectedOrder.shippingAddress === 'object' && selectedOrder.shippingAddress && (
                        <>
                          <p>{selectedOrder.shippingAddress?.fullName}</p>
                          <p>{selectedOrder.shippingAddress?.streetAddress}</p>
                          <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}</p>
                          <p>{selectedOrder.shippingAddress?.country}</p>
                          <p className="mt-1">Phone: {selectedOrder.shippingAddress?.phone}</p>
                        </>
                      )}
                      {!selectedOrder.shippingAddress && !selectedOrder.shipping_address && (
                        <p>No shipping address information available</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Payment</h3>
                    <div className="text-sm">
                      {typeof selectedOrder.payment_method === 'string' && (
                        (() => {
                          try {
                            const payment = JSON.parse(selectedOrder.payment_method);
                            return (
                              <>
                                <p>{payment.type === 'credit_card' ? 'Credit Card' : payment.type === 'paypal' ? 'PayPal' : payment.type}</p>
                                {payment.lastFour && (
                                  <p>•••• •••• •••• {payment.lastFour}</p>
                                )}
                                {payment.expiryDate && (
                                  <p>Expires: {payment.expiryDate}</p>
                                )}
                              </>
                            );
                          } catch (e) {
                            return <p>{selectedOrder.payment_method}</p>;
                          }
                        })()
                      )}
                      {typeof selectedOrder.paymentMethod === 'object' && selectedOrder.paymentMethod && (
                        <>
                          <p>{selectedOrder.paymentMethod?.type === 'credit_card' ? 'Credit Card' : selectedOrder.paymentMethod?.type === 'paypal' ? 'PayPal' : selectedOrder.paymentMethod?.type}</p>
                          {selectedOrder.paymentMethod?.lastFour && (
                            <p>•••• •••• •••• {selectedOrder.paymentMethod.lastFour}</p>
                          )}
                          {selectedOrder.paymentMethod?.expiryDate && (
                            <p>Expires: {selectedOrder.paymentMethod.expiryDate}</p>
                          )}
                        </>
                      )}
                      {!selectedOrder.paymentMethod && !selectedOrder.payment_method && (
                        <p>No payment information available</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${(selectedOrder.subtotal ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>${(selectedOrder.shipping ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${(selectedOrder.tax ?? 0).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${(selectedOrder.total ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedOrder.status === 'pending' && (
                <div className="mt-6">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Order'
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage; 