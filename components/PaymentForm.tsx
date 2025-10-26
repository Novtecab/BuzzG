import React, { useState, useMemo } from 'react';
import type { Address, CartItem, Currency, Language, PaymentMethod, CardDetails } from '../types';

interface PaymentFormProps {
    t: any;
    onBack: () => void;
    onSubmit: (paymentMethod: PaymentMethod) => void;
    address: Address;
    cartItems: CartItem[];
    currency: Currency;
    locale: string;
    language: Language;
}

const formatCurrency = (amount: number, currency: Currency, locale: string) => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency.toUpperCase() }).format(amount);
};

// --- Card Icons ---
const VisaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.2,6.4H16.8L12.7,18H15l.8-2.2h3.2l.4,2.2h2.2L19.2,6.4M17.4,14L18,10l.6,4Z" />
        <path d="M9.2,12.3a2.1,2.1,0,0,1,1.1-1.9,3.7,3.7,0,0,0,1.3-.8,1.4,1.4,0,0,0,.2-1.2,1.2,1.2,0,0,0-1.3-1,2.3,2.3,0,0,0-1.8.8,1.4,1.4,0,0,1-1.6-1.4,4.4,4.4,0,0,1,3-1.2,3.3,3.3,0,0,1,3.4,3.3,2.6,2.6,0,0,1-.8,2,4.8,4.8,0,0,1-1.6.9,2.4,2.4,0,0,0-1.1.8,1,1,0,0,0-.2,1,1.4,1.4,0,0,0,1.4,1.1,2.8,2.8,0,0,0,2.2-.9l1.6,1.4a4.7,4.7,0,0,1-3.8,1.6A3.5,3.5,0,0,1,9.2,12.3Z" />
        <path d="M5.8,6.4H3V18H5.3V10.2l2.4,7.8H10L7.5,8.1a4.1,4.1,0,0,1,1-1.3l.3-.4Z" />
    </svg>
);

const MastercardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="7" cy="12" r="7" />
        <path d="M17,12a7,7,0,1,0-7,7,7,7,0,0,0,7-7Zm0,0a7,7,0,1,0-7-7,7,7,0,0,0,7,7Z" opacity=".8"/>
    </svg>
);

const AmexIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M7 12h3" />
        <path d="M14 12h3" />
        <path d="M10 9v6" />
        <path d="M17 9v6" />
    </svg>
);
const CreditCardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
);

const Spinner: React.FC<{ className?: string }> = ({ className = 'text-primary dark:text-secondary' }) => (
    <svg className={`animate-spin h-8 w-8 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

const detectCardBrand = (number: string): CardBrand => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return 'unknown';
};


export const PaymentForm: React.FC<PaymentFormProps> = ({ t, onBack, onSubmit, address, cartItems, currency, locale, language }) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
    const [cardDetails, setCardDetails] = useState<CardDetails>({
        cardholderName: address.fullName,
        cardNumber: '',
        expiryDate: '',
        cvc: '',
    });
    const [cardErrors, setCardErrors] = useState<Partial<CardDetails>>({});
    const [cardBrand, setCardBrand] = useState<CardBrand>('unknown');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isQrLoading, setIsQrLoading] = useState(false);
    
    const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price[currency], 0), [cartItems, currency]);

    const swishPayload = useMemo(() => {
        const payload = {
          version: 1,
          payee: { value: '0731442276' },
          amount: { value: subtotal, editable: false },
          message: { value: `Order from Buzz`, editable: false },
        };
        const encodedPayload = encodeURIComponent(JSON.stringify(payload));
        // Swish format for QR codes
        return `swish://payment?data=${encodedPayload}`;
    }, [subtotal]);

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(swishPayload)}`;

    const handleMethodChange = (method: PaymentMethod) => {
        setSelectedMethod(method);
        if (method === 'swish') {
            setIsQrLoading(true);
        }
    };

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;
    
        if (name === 'cardNumber') {
            const rawValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            const currentBrand = detectCardBrand(rawValue);
            setCardBrand(currentBrand); 

            const limit = currentBrand === 'amex' ? 15 : 16;
            const limitedValue = rawValue.substring(0, limit);
            const parts = [];
            for (let i = 0; i < limitedValue.length; i += 4) {
                parts.push(limitedValue.substring(i, i + 4));
            }
            formattedValue = parts.join(' ');
        }
    
        if (name === 'expiryDate') {
            let rawValue = value.replace(/\D/g, '');
            if (rawValue.length > 4) rawValue = rawValue.slice(0, 4);
            if (rawValue.length > 2) {
                formattedValue = `${rawValue.slice(0, 2)}/${rawValue.slice(2)}`;
            } else {
                formattedValue = rawValue;
            }
        }
    
        if (name === 'cvc') {
            const limit = cardBrand === 'amex' ? 4 : 3;
            formattedValue = value.replace(/\D/g, '').substring(0, limit);
        }
        
        setCardDetails(prev => ({...prev, [name]: formattedValue}));
        if (cardErrors[name as keyof CardDetails]) {
            setCardErrors(prev => ({...prev, [name]: undefined}));
        }
    };

    const validateCard = (): boolean => {
        if (selectedMethod !== 'card') return true;
        
        const newErrors: Partial<CardDetails> = {};
        if (!cardDetails.cardholderName.trim()) {
            newErrors.cardholderName = t.fieldRequired;
        }
        
        const rawCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
        if (!rawCardNumber) {
            newErrors.cardNumber = t.fieldRequired;
        } else if (cardBrand === 'amex' && rawCardNumber.length !== 15) {
            newErrors.cardNumber = 'Amex cards must be 15 digits';
        } else if (cardBrand !== 'amex' && rawCardNumber.length !== 16 && cardBrand !== 'unknown') {
            newErrors.cardNumber = 'Card must be 16 digits';
        } else if (cardBrand === 'unknown' && rawCardNumber.length > 0) {
            newErrors.cardNumber = 'Invalid card number';
        }

        if (!cardDetails.expiryDate.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
             newErrors.expiryDate = 'Invalid date';
        } else {
            const [monthStr, yearStr] = cardDetails.expiryDate.split('/');
            const month = parseInt(monthStr, 10);
            const year = parseInt(`20${yearStr}`, 10);
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;

            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                newErrors.expiryDate = 'Card has expired';
            }
        }
        
        const cvcLength = cardBrand === 'amex' ? 4 : 3;
        if (!cardDetails.cvc.match(new RegExp(`^\\d{${cvcLength}}$`))) {
            newErrors.cvc = `Must be ${cvcLength} digits`;
        }
        
        setCardErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const paymentOptions: { id: PaymentMethod; label: string; }[] = [
        { id: 'card', label: t.card },
        { id: 'swish', label: t.swish },
        { id: 'cod', label: t.cashOnDelivery },
        { id: 'googlepay', label: t.googlePay },
        { id: 'applepay', label: t.applePay },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateCard()) {
            onSubmit(selectedMethod);
        }
    };

    const CardBrandIcon: React.FC<{ brand: CardBrand, className?: string }> = ({ brand, className = "w-8 h-8" }) => {
      switch (brand) {
        case 'visa': return <VisaIcon className={className} />;
        case 'mastercard': return <MastercardIcon className={className} />;
        case 'amex': return <AmexIcon className={`${className} text-blue-600 dark:text-blue-400`} />;
        default: return <CreditCardIcon className={`${className} text-gray-400`} />;
      }
    };

    const payButtonText = t['Pay Amount'] 
        ? t['Pay Amount'].replace('{amount}', formatCurrency(subtotal, currency, locale))
        : t.placeOrder;

    return (
        <form onSubmit={handleSubmit} className="p-6 flex flex-col flex-grow min-h-0">
            <div className="overflow-y-auto space-y-6 flex-grow custom-scrollbar overscroll-contain pr-2 min-h-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t.deliveryAddress}</h3>
                  <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-md text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{address.fullName}</p>
                      <p>{address.email} | {address.phone}</p>
                      <p>{address.street}, {address.postalCode} {address.city}, {address.country}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t.orderSummary}</h3>
                    <div className="space-y-2 text-sm max-h-40 overflow-y-auto custom-scrollbar pr-2">
                        {cartItems.map(item => (
                            <div key={item.cartId} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <img src={item.imageUrl} alt={item.name[language]} className="w-10 h-10 object-cover rounded" />
                                  <span className="text-gray-600 dark:text-gray-400 truncate">{item.name[language]}</span>
                                </div>
                                <span className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{formatCurrency(item.price[currency], currency, locale)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t dark:border-slate-600">
                        <span className="text-gray-800 dark:text-gray-200">{t.subtotal}</span>
                        <span className="text-primary dark:text-secondary">{formatCurrency(subtotal, currency, locale)}</span>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.paymentMethod}</h3>
                    <div className="space-y-3">
                        {paymentOptions.map(option => (
                            <div key={option.id}>
                                <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 has-[:checked]:bg-accent dark:has-[:checked]:bg-secondary/20 has-[:checked]:border-primary dark:has-[:checked]:border-secondary">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={option.id}
                                        checked={selectedMethod === option.id}
                                        onChange={() => handleMethodChange(option.id as PaymentMethod)}
                                        className="h-4 w-4 text-primary focus:ring-primary dark:text-secondary dark:focus:ring-secondary dark:bg-slate-600 border-gray-300 dark:border-slate-500"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{option.label}</span>
                                </label>
                                {option.id === 'card' && selectedMethod === 'card' && (
                                    <div className="p-4 mt-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600 animate-fade-in-up">
                                        <div className="bg-white dark:bg-slate-900/50 border border-gray-300 dark:border-slate-700 rounded-lg shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/30 dark:focus-within:ring-secondary/30 focus-within:border-primary dark:focus-within:border-secondary">
                                            <div className="p-3 border-b dark:border-slate-700">
                                                <label htmlFor="cardholderName" className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t.cardholderName}</label>
                                                <input type="text" id="cardholderName" name="cardholderName" value={cardDetails.cardholderName} onChange={handleCardChange} autoComplete="cc-name" className="mt-1 w-full text-base bg-transparent border-none p-0 focus:ring-0 text-gray-800 dark:text-gray-200" />
                                            </div>
                                            <div className="p-3 relative">
                                                <label htmlFor="cardNumber" className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t.cardNumber}</label>
                                                <input type="text" id="cardNumber" name="cardNumber" value={cardDetails.cardNumber} onChange={handleCardChange} placeholder="0000 0000 0000 0000" autoComplete="cc-number" className="mt-1 w-full text-base bg-transparent border-none p-0 focus:ring-0 text-gray-800 dark:text-gray-200 pr-10 tracking-wider" />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <CardBrandIcon brand={cardBrand} />
                                                </div>
                                            </div>
                                            <div className="flex border-t dark:border-slate-700">
                                                <div className="w-1/2 p-3 border-r dark:border-slate-700">
                                                    <label htmlFor="expiryDate" className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t.expiryDate}</label>
                                                    <input type="text" id="expiryDate" name="expiryDate" value={cardDetails.expiryDate} onChange={handleCardChange} placeholder="MM/YY" autoComplete="cc-exp" className="mt-1 w-full text-base bg-transparent border-none p-0 focus:ring-0 text-gray-800 dark:text-gray-200" />
                                                </div>
                                                <div className="w-1/2 p-3">
                                                    <label htmlFor="cvc" className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t.cvc}</label>
                                                    <input type="text" id="cvc" name="cvc" value={cardDetails.cvc} onChange={handleCardChange} placeholder="123" autoComplete="cc-csc" className="mt-1 w-full text-base bg-transparent border-none p-0 focus:ring-0 text-gray-800 dark:text-gray-200" />
                                                </div>
                                            </div>
                                        </div>
                                        {cardErrors.cardholderName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{cardErrors.cardholderName}</p>}
                                        {cardErrors.cardNumber && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{cardErrors.cardNumber}</p>}
                                        {(cardErrors.expiryDate || cardErrors.cvc) && (
                                            <div className="flex mt-1 text-xs">
                                                <p className="w-1/2 text-red-600 dark:text-red-400">{cardErrors.expiryDate}</p>
                                                <p className="w-1/2 text-red-600 dark:text-red-400">{cardErrors.cvc}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {option.id === 'swish' && selectedMethod === 'swish' && (
                                    <div className="p-4 mt-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600 animate-fade-in-up text-center flex flex-col items-center">
                                        <p className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">{t.scanWithSwish}</p>
                                        <div className="relative w-[200px] h-[200px] flex items-center justify-center bg-gray-100 dark:bg-slate-600 rounded-lg">
                                            {isQrLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Spinner />
                                                </div>
                                            )}
                                            <img 
                                                src={qrCodeUrl} 
                                                alt="Swish QR Code" 
                                                width="200" 
                                                height="200" 
                                                className={`rounded-lg shadow-md transition-opacity duration-300 ${isQrLoading ? 'opacity-0' : 'opacity-100'}`}
                                                onLoad={() => setIsQrLoading(false)}
                                            />
                                        </div>
                                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            <p><span className="font-semibold">{t.swishNumber}:</span> 0731442276</p>
                                            <p><span className="font-semibold">{t.amountToPay}:</span> {formatCurrency(subtotal, currency, locale)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t dark:border-slate-600 flex-shrink-0 space-y-4">
                <div className="flex items-start">
                    <input
                        id="terms-checkbox"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="h-4 w-4 mt-1 rounded border-gray-300 text-primary focus:ring-primary dark:bg-slate-600 dark:border-slate-500"
                    />
                    <label htmlFor="terms-checkbox" className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                        {t['I agree to the']} <button type="button" onClick={() => alert(t.termsContent)} className="font-medium text-primary dark:text-secondary hover:underline">{t['Terms & Conditions']}</button>
                    </label>
                </div>
                <div className="flex justify-between items-center">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500"
                    >
                        {t.backToCart}
                    </button>
                    <button
                        type="submit"
                        disabled={!termsAccepted}
                        className="bg-primary text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-secondary dark:text-slate-900 dark:hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
                    >
                        {payButtonText}
                    </button>
                </div>
            </div>
        </form>
    );
};