import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/contexts/SearchContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search as SearchIcon, History, X } from 'lucide-react';

interface SearchBarProps {
  variant?: 'default' | 'minimal';
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({
  variant = 'default',
  onSearch,
  placeholder = 'Search products...',
  className = '',
}: SearchBarProps) => {
  const navigate = useNavigate();
  const { state, setQuery, addRecentSearch, clearRecentSearches } = useSearch();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setQuery(inputValue);
    addRecentSearch(inputValue);
    setOpen(false);

    if (onSearch) {
      onSearch(inputValue);
    } else {
      // Default behavior: navigate to search results
      navigate(`/client/products?search=${encodeURIComponent(inputValue)}`);
    }
  };

  const handleRecentSearchClick = (search: string) => {
    setInputValue(search);
    setQuery(search);
    setOpen(false);

    if (onSearch) {
      onSearch(search);
    } else {
      navigate(`/client/products?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className={`pl-10 ${variant === 'minimal' ? 'w-[200px]' : 'w-[300px] md:w-[400px]'}`}
              onFocus={() => setOpen(true)}
            />
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4"
                onClick={() => setInputValue('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] md:w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Type to search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {state.recentSearches.length > 0 && (
                <CommandGroup heading="Recent Searches">
                  {state.recentSearches.map((search, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => handleRecentSearchClick(search)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <History className="mr-2 h-4 w-4 text-muted-foreground" />
                        {search}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newRecentSearches = state.recentSearches.filter(
                            (_, i) => i !== index
                          );
                          clearRecentSearches();
                          newRecentSearches.forEach(addRecentSearch);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </form>
  );
};
