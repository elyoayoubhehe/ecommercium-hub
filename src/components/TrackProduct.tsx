import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { productApi } from '../lib/api';
import { TrackingRequest } from '../types/product';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

export function TrackProduct() {
  const [productUrl, setProductUrl] = useState('');
  const [productName, setProductName] = useState('');

  const trackMutation = useMutation({
    mutationFn: (request: TrackingRequest) => productApi.trackProduct(request),
    onSuccess: () => {
      toast.success('Product tracking started successfully');
      setProductUrl('');
      setProductName('');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to track product'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productUrl.trim() || !productName.trim()) return;

    trackMutation.mutate({
      url: productUrl,
      productName: productName,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Track New Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Track Product Price</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="productName" className="text-sm font-medium">
              Product Name
            </label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., iPhone 13 Pro Max"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="productUrl" className="text-sm font-medium">
              Product URL
            </label>
            <Input
              id="productUrl"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://www.amazon.com/product..."
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={trackMutation.isPending}
          >
            {trackMutation.isPending ? 'Starting Tracking...' : 'Start Tracking'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 