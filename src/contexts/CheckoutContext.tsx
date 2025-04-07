import { createContext, useContext, useReducer, useEffect } from 'react';

interface Address {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface PaymentMethod {
  type: 'credit_card' | 'paypal';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  paypalEmail?: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

type CheckoutStep = 'cart-review' | 'shipping' | 'payment' | 'review';

interface CheckoutState {
  step: CheckoutStep;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  sameAsShipping: boolean;
  selectedShippingMethod: ShippingMethod | null;
  paymentMethod: PaymentMethod | null;
  savedAddresses: Address[];
  savedPaymentMethods: PaymentMethod[];
}

type CheckoutAction =
  | { type: 'SET_STEP'; payload: CheckoutState['step'] }
  | { type: 'SET_SHIPPING_ADDRESS'; payload: Address }
  | { type: 'SET_BILLING_ADDRESS'; payload: Address }
  | { type: 'SET_SAME_AS_SHIPPING'; payload: boolean }
  | { type: 'SET_SHIPPING_METHOD'; payload: ShippingMethod }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'ADD_SAVED_ADDRESS'; payload: Address }
  | { type: 'REMOVE_SAVED_ADDRESS'; payload: number }
  | { type: 'ADD_SAVED_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'REMOVE_SAVED_PAYMENT_METHOD'; payload: number }
  | { type: 'RESET_CHECKOUT' };

const initialState: CheckoutState = {
  step: 'cart-review',
  shippingAddress: null,
  billingAddress: null,
  sameAsShipping: true,
  selectedShippingMethod: null,
  paymentMethod: null,
  savedAddresses: [],
  savedPaymentMethods: [],
};

const checkoutReducer = (state: CheckoutState, action: CheckoutAction): CheckoutState => {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        step: action.payload,
      };

    case 'SET_SHIPPING_ADDRESS':
      return {
        ...state,
        shippingAddress: action.payload,
        billingAddress: state.sameAsShipping ? action.payload : state.billingAddress,
      };

    case 'SET_BILLING_ADDRESS':
      return {
        ...state,
        billingAddress: action.payload,
      };

    case 'SET_SAME_AS_SHIPPING':
      return {
        ...state,
        sameAsShipping: action.payload,
        billingAddress: action.payload ? state.shippingAddress : null,
      };

    case 'SET_SHIPPING_METHOD':
      return {
        ...state,
        selectedShippingMethod: action.payload,
      };

    case 'SET_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethod: action.payload,
      };

    case 'ADD_SAVED_ADDRESS':
      return {
        ...state,
        savedAddresses: [...state.savedAddresses, action.payload],
      };

    case 'REMOVE_SAVED_ADDRESS':
      return {
        ...state,
        savedAddresses: state.savedAddresses.filter((_, index) => index !== action.payload),
      };

    case 'ADD_SAVED_PAYMENT_METHOD':
      return {
        ...state,
        savedPaymentMethods: [...state.savedPaymentMethods, action.payload],
      };

    case 'REMOVE_SAVED_PAYMENT_METHOD':
      return {
        ...state,
        savedPaymentMethods: state.savedPaymentMethods.filter(
          (_, index) => index !== action.payload
        ),
      };

    case 'RESET_CHECKOUT':
      return initialState;

    default:
      return state;
  }
};

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    price: 5.99,
    estimatedDays: '5-7 business days',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    price: 14.99,
    estimatedDays: '2-3 business days',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    price: 29.99,
    estimatedDays: 'Next business day',
  },
];

interface CheckoutContextType {
  state: CheckoutState;
  setStep: (step: CheckoutStep) => void;
  currentStep: CheckoutState['step'];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  sameAsShipping: boolean;
  selectedShippingMethod: ShippingMethod | null;
  paymentMethod: PaymentMethod | null;
  savedAddresses: Address[];
  savedPaymentMethods: PaymentMethod[];
  nextStep: () => void;
  prevStep: () => void;
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address) => void;
  setSameAsShipping: (same: boolean) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  addSavedAddress: (address: Address) => void;
  removeSavedAddress: (index: number) => void;
  addSavedPaymentMethod: (method: PaymentMethod) => void;
  removeSavedPaymentMethod: (index: number) => void;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export const CheckoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const steps: CheckoutState['step'][] = ['cart-review', 'shipping', 'payment', 'review'];

  const nextStep = () => {
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex < steps.length - 1) {
      dispatch({ type: 'SET_STEP', payload: steps[currentIndex + 1] });
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_STEP', payload: steps[currentIndex - 1] });
    }
  };

  const setShippingAddress = (address: Address) => {
    dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: address });
  };

  const setBillingAddress = (address: Address) => {
    dispatch({ type: 'SET_BILLING_ADDRESS', payload: address });
  };

  const setSameAsShipping = (same: boolean) => {
    dispatch({ type: 'SET_SAME_AS_SHIPPING', payload: same });
  };

  const setShippingMethod = (method: ShippingMethod) => {
    dispatch({ type: 'SET_SHIPPING_METHOD', payload: method });
  };

  const setPaymentMethod = (method: PaymentMethod) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  };

  const addSavedAddress = (address: Address) => {
    dispatch({ type: 'ADD_SAVED_ADDRESS', payload: address });
  };

  const removeSavedAddress = (index: number) => {
    dispatch({ type: 'REMOVE_SAVED_ADDRESS', payload: index });
  };

  const addSavedPaymentMethod = (method: PaymentMethod) => {
    dispatch({ type: 'ADD_SAVED_PAYMENT_METHOD', payload: method });
  };

  const removeSavedPaymentMethod = (index: number) => {
    dispatch({ type: 'REMOVE_SAVED_PAYMENT_METHOD', payload: index });
  };

  const resetCheckout = () => {
    dispatch({ type: 'RESET_CHECKOUT' });
  };

  const setStep = (step: CheckoutStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  // Load saved addresses and payment methods from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('checkoutData');
    if (savedData) {
      const { savedAddresses, savedPaymentMethods } = JSON.parse(savedData);
      savedAddresses.forEach((address: Address) => {
        dispatch({ type: 'ADD_SAVED_ADDRESS', payload: address });
      });
      savedPaymentMethods.forEach((method: PaymentMethod) => {
        dispatch({ type: 'ADD_SAVED_PAYMENT_METHOD', payload: method });
      });
    }
  }, []);

  // Save addresses and payment methods to localStorage
  useEffect(() => {
    localStorage.setItem('checkoutData', JSON.stringify({
      savedAddresses: state.savedAddresses,
      savedPaymentMethods: state.savedPaymentMethods,
    }));
  }, [state.savedAddresses, state.savedPaymentMethods]);

  return (
    <CheckoutContext.Provider
      value={{
        state,
        setStep,
        currentStep: state.step,
        shippingAddress: state.shippingAddress,
        billingAddress: state.billingAddress,
        sameAsShipping: state.sameAsShipping,
        selectedShippingMethod: state.selectedShippingMethod,
        paymentMethod: state.paymentMethod,
        savedAddresses: state.savedAddresses,
        savedPaymentMethods: state.savedPaymentMethods,
        nextStep,
        prevStep,
        setShippingAddress,
        setBillingAddress,
        setSameAsShipping,
        setShippingMethod,
        setPaymentMethod,
        addSavedAddress,
        removeSavedAddress,
        addSavedPaymentMethod,
        removeSavedPaymentMethod,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
