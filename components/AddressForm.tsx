import React, { useState } from 'react';
import type { Address, CartItem, Currency, Language } from '../types';

interface AddressFormProps {
  t: any;
  onBack: () => void;
  onSubmit: (address: Address) => void;
  cartItems: CartItem[];
  currency: Currency;
  locale: string;
  language: Language;
}

const formatCurrency = (amount: number, currency: Currency, locale: string) => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency.toUpperCase() }).format(amount);
};

// Define InputField OUTSIDE the AddressForm component to prevent focus loss on re-render
interface InputFieldProps {
  id: keyof Address;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, value, onChange, error, type = 'text', autoComplete }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${error ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-secondary dark:focus:border-secondary`}
      aria-invalid={!!error}
      aria-describedby={`${id}-error`}
    />
    {error && <p id={`${id}-error`} className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
);

export const AddressForm: React.FC<AddressFormProps> = ({ t, onBack, onSubmit, cartItems, currency, locale, language }) => {
  const [address, setAddress] = useState<Address>({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [errors, setErrors] = useState<Partial<Address>>({});
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  
  const subtotal = cartItems.reduce((acc, item) => acc + item.price[currency], 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof Address]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Address> = {};
    if (!address.fullName.trim()) newErrors.fullName = t.fieldRequired;
    if (!address.email.trim()) {
        newErrors.email = t.fieldRequired;
    } else if (!/\S+@\S+\.\S+/.test(address.email)) {
        newErrors.email = t.emailInvalid;
    }
    if (!address.phone.trim()) {
        newErrors.phone = t.fieldRequired;
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(address.phone)) {
        newErrors.phone = t.phoneInvalid;
    }
    if (!address.street.trim()) newErrors.street = t.fieldRequired;
    if (!address.city.trim()) newErrors.city = t.fieldRequired;
    if (!address.postalCode.trim()) newErrors.postalCode = t.fieldRequired;
    if (!address.country.trim()) newErrors.country = t.fieldRequired;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(address);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col flex-grow min-h-0">
        <div className="flex-grow overflow-y-auto custom-scrollbar overscroll-contain scroll-smooth pr-2 min-h-0">
            <div className="mb-4 border-b dark:border-slate-700 pb-4">
                <button type="button" onClick={() => setIsSummaryExpanded(!isSummaryExpanded)} className="w-full flex justify-between items-center text-left font-semibold text-gray-700 dark:text-gray-300">
                    <span>{isSummaryExpanded ? t.hideOrderSummary : t.showOrderSummary}</span>
                    <div className="flex items-center">
                        <span className="mr-2 text-primary dark:text-secondary">{formatCurrency(subtotal, currency, locale)}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform duration-300 ${isSummaryExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isSummaryExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-2 text-sm">
                        {cartItems.map(item => (
                            <div key={item.cartId} className="flex justify-between items-start">
                                <span className="text-gray-600 dark:text-gray-400 pr-2">{item.name[language]}</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{formatCurrency(item.price[currency], currency, locale)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="p-4 border rounded-lg dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t.contactInfo}</h3>
                <div className="space-y-4">
                    <InputField id="fullName" label={t.fullName} autoComplete="name" value={address.fullName} onChange={handleChange} error={errors.fullName} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField id="email" label={t.email} type="email" autoComplete="email" value={address.email} onChange={handleChange} error={errors.email} />
                        <InputField id="phone" label={t.phone} type="tel" autoComplete="tel" value={address.phone} onChange={handleChange} error={errors.phone} />
                    </div>
                </div>
                
                <hr className="my-6 border-slate-200 dark:border-slate-600" />

                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t.deliveryAddress}</h3>
                <div className="space-y-4">
                    <InputField id="street" label={t.street} autoComplete="street-address" value={address.street} onChange={handleChange} error={errors.street} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <InputField id="city" label={t.city} autoComplete="address-level2" value={address.city} onChange={handleChange} error={errors.city} />
                       <InputField id="postalCode" label={t.postalCode} autoComplete="postal-code" value={address.postalCode} onChange={handleChange} error={errors.postalCode} />
                    </div>
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.country}</label>
                        <select
                            id="country"
                            name="country"
                            value={address.country}
                            onChange={handleChange}
                            autoComplete="country"
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${errors.country ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} dark:bg-slate-700 dark:text-white dark:focus:ring-secondary dark:focus:border-secondary`}
                            aria-invalid={!!errors.country}
                            aria-describedby="country-error"
                        >
                            <option value="" disabled>{t.selectCountry}</option>
                            <option value="Sweden">{t.countrySweden}</option>
                            <option value="Pakistan">{t.countryPakistan}</option>
                        </select>
                        {errors.country && <p id="country-error" className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.country}</p>}
                    </div>
                </div>
            </div>
        </div>
        
        <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-slate-700 flex-shrink-0">
            <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500"
            >
                {t.backToCart}
            </button>
            <button
                type="submit"
                className="bg-primary text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-secondary dark:text-slate-900 dark:hover:bg-primary"
            >
                {t.continueToPayment}
            </button>
        </div>
    </form>
  );
};