
export type Language = 'en' | 'sv';
export type Location = 'se' | 'pk';
export type Currency = 'sek' | 'pkr';
export type Category = 'home' | 'car' | 'bike' | 'storage' | 'pickup' | 'vending' | 'parking' | 'handyman' | 'business';
export type Theme = 'light' | 'dark';
export type View = 'home' | 'services';
export type PaymentMethod = 'cod' | 'swish' | 'card' | 'googlepay' | 'applepay';
export type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
export type PriceRange = string | null;
export type CheckoutStep = 'cart' | 'address' | 'payment' | 'processing' | 'confirmation';
export type HomeSubCategory = 'renovation' | 'installation' | 'demolition' | 'cleaning' | 'moving' | 'repair' | 'catering' | 'wellness' | 'pet' | 'education' | 'flooring' | 'construction';
export type CarSubCategory = 'inspection' | 'repair' | 'maintenance';
export type HandymanSubCategory = 'small-repairs' | 'assembly' | 'painting' | 'carpentry';

export interface Item {
  id: string;
  category: Category;
  subCategory?: HomeSubCategory | CarSubCategory | HandymanSubCategory;
  type: 'service' | 'product';
  name: {
    en: string;
    sv: string;
  };
  description: {
    en: string;
    sv: string;
  };
  longDescription?: {
    en: string;
    sv: string;
  };
  durationHours?: number;
  includes?: {
    en: string[];
    sv: string[];
  };
  price: {
    sek: number;
    pkr: number;
  };
  imageUrl: string;
}

export interface CartItem extends Item {
  cartId: string;
  bookingDate?: string;
  bookingTime?: string;
}

export interface Address {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CardDetails {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  address: Address;
  subtotal: number;
  paymentMethod: PaymentMethod;
  currency: Currency;
}