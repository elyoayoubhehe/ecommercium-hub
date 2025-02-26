import { useState } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Star, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SearchFiltersProps {
  className?: string;
  onFilterChange?: () => void;
}

export const SearchFilters = ({
  className = '',
  onFilterChange,
}: SearchFiltersProps) => {
  const { state, setFilters, saveFilter, clearFilters } = useSearch();
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setFilters({
      ...state.filters,
      minPrice: value[0],
      maxPrice: value[1],
    });
    onFilterChange?.();
  };

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating === selectedRating ? null : rating);
    setFilters({
      ...state.filters,
      rating: rating === selectedRating ? undefined : rating,
    });
    onFilterChange?.();
  };

  const handleSortChange = (value: string) => {
    setFilters({
      ...state.filters,
      sortBy: value as any,
    });
    onFilterChange?.();
  };

  const handleInStockChange = (checked: boolean) => {
    setFilters({
      ...state.filters,
      inStock: checked,
    });
    onFilterChange?.();
  };

  const handleSaveFilters = () => {
    saveFilter(state.filters);
    toast.success('Filters saved successfully');
  };

  const handleClearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedRating(null);
    clearFilters();
    onFilterChange?.();
    toast.success('Filters cleared');
  };

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveFilters}
            className="flex items-center gap-1"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Sort By</Label>
          <Select
            value={state.filters.sortBy}
            onValueChange={handleSortChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sorting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Price Range</Label>
          <div className="pt-4">
            <Slider
              value={priceRange}
              min={0}
              max={1000}
              step={10}
              onValueChange={handlePriceChange}
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>

        <div>
          <Label>Rating</Label>
          <div className="space-y-2 mt-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={selectedRating === rating ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleRatingChange(rating)}
              >
                <div className="flex items-center">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-current text-yellow-400"
                    />
                  ))}
                  {Array.from({ length: 5 - rating }).map((_, i) => (
                    <Star
                      key={i + rating}
                      className="w-4 h-4 text-muted-foreground"
                    />
                  ))}
                  <span className="ml-2">{rating}+ Stars</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={state.filters.inStock}
            onCheckedChange={handleInStockChange}
          />
          <Label htmlFor="inStock">In Stock Only</Label>
        </div>
      </div>
    </Card>
  );
};
