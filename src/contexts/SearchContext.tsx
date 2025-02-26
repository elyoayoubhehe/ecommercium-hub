import { createContext, useContext, useReducer, useEffect } from 'react';

interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  inStock?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

interface SearchState {
  query: string;
  filters: SearchFilters;
  recentSearches: string[];
  savedFilters: SearchFilters[];
  results: Product[];
  isLoading: boolean;
}

type SearchAction =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: SearchFilters }
  | { type: 'ADD_RECENT_SEARCH'; payload: string }
  | { type: 'CLEAR_RECENT_SEARCHES' }
  | { type: 'SAVE_FILTER'; payload: SearchFilters }
  | { type: 'REMOVE_SAVED_FILTER'; payload: number }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_RESULTS'; payload: Product[] }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: SearchState = {
  query: '',
  filters: {},
  recentSearches: [],
  savedFilters: [],
  results: [],
  isLoading: false
};

const MAX_RECENT_SEARCHES = 10;

const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'SET_QUERY':
      return {
        ...state,
        query: action.payload,
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case 'ADD_RECENT_SEARCH': {
      const newRecentSearches = [
        action.payload,
        ...state.recentSearches.filter(search => search !== action.payload),
      ].slice(0, MAX_RECENT_SEARCHES);

      return {
        ...state,
        recentSearches: newRecentSearches,
      };
    }

    case 'CLEAR_RECENT_SEARCHES':
      return {
        ...state,
        recentSearches: [],
      };

    case 'SAVE_FILTER':
      return {
        ...state,
        savedFilters: [...state.savedFilters, action.payload],
      };

    case 'REMOVE_SAVED_FILTER':
      return {
        ...state,
        savedFilters: state.savedFilters.filter((_, index) => index !== action.payload),
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {},
      };

    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const SearchContext = createContext<{
  state: SearchState;
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  saveFilter: (filter: SearchFilters) => void;
  removeSavedFilter: (index: number) => void;
  clearFilters: () => void;
  search: (query: string) => Promise<void>;
}>({
  state: initialState,
  setQuery: () => {},
  setFilters: () => {},
  addRecentSearch: () => {},
  clearRecentSearches: () => {},
  saveFilter: () => {},
  removeSavedFilter: () => {},
  clearFilters: () => {},
  search: async () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  // Load search state from localStorage on mount
  useEffect(() => {
    const savedSearch = localStorage.getItem('search');
    if (savedSearch) {
      const { recentSearches, savedFilters } = JSON.parse(savedSearch);
      recentSearches.forEach((search: string) => {
        dispatch({ type: 'ADD_RECENT_SEARCH', payload: search });
      });
      savedFilters.forEach((filter: SearchFilters) => {
        dispatch({ type: 'SAVE_FILTER', payload: filter });
      });
    }
  }, []);

  // Save search state to localStorage on change
  useEffect(() => {
    localStorage.setItem('search', JSON.stringify({
      recentSearches: state.recentSearches,
      savedFilters: state.savedFilters,
    }));
  }, [state.recentSearches, state.savedFilters]);

  const setQuery = (query: string) => {
    dispatch({ type: 'SET_QUERY', payload: query });
  };

  const setFilters = (filters: SearchFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const addRecentSearch = (query: string) => {
    if (query.trim()) {
      dispatch({ type: 'ADD_RECENT_SEARCH', payload: query.trim() });
    }
  };

  const clearRecentSearches = () => {
    dispatch({ type: 'CLEAR_RECENT_SEARCHES' });
  };

  const saveFilter = (filter: SearchFilters) => {
    dispatch({ type: 'SAVE_FILTER', payload: filter });
  };

  const removeSavedFilter = (index: number) => {
    dispatch({ type: 'REMOVE_SAVED_FILTER', payload: index });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  // Mock search function - replace with actual API call
  const search = async (query: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock results - replace with actual API call
      const results: Product[] = [
        {
          id: '1',
          name: 'Sample Product 1',
          price: 99.99,
          image: 'https://via.placeholder.com/200',
          description: 'A sample product',
          category: 'Electronics'
        },
        {
          id: '2',
          name: 'Sample Product 2',
          price: 149.99,
          image: 'https://via.placeholder.com/200',
          description: 'Another sample product',
          category: 'Electronics'
        }
      ];
      
      dispatch({ type: 'SET_RESULTS', payload: results });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <SearchContext.Provider
      value={{
        state,
        setQuery,
        setFilters,
        addRecentSearch,
        clearRecentSearches,
        saveFilter,
        removeSavedFilter,
        clearFilters,
        search
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
