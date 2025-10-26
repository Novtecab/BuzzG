import React, { useState, useEffect, useRef } from 'react';
import type { CartItem, Language, Currency, Address, PaymentMethod, CheckoutStep, Order } from '../types';
import { AddressForm } from './AddressForm';
import { PaymentForm } from './PaymentForm';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (cartId: string) => void;
  onPlaceOrder: (address: Address, paymentMethod: PaymentMethod) => void;
  language: Language;
  currency: Currency;
  locale: string;
  t: any;
  checkoutStep: CheckoutStep;
  setCheckoutStep: (step: CheckoutStep) => void;
  order: Order | null;
}

const formatCurrency = (amount: number, currency: Currency, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.124 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const Spinner: React.FC = () => (
  <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CheckoutStepper: React.FC<{ currentStep: CheckoutStep, t: any }> = ({ currentStep, t }) => {
    const steps = [
        { id: 'cart', label: t.stepCart },
        { id: 'address', label: t.stepDelivery },
        { id: 'payment', label: t.stepPayment },
        { id: 'confirmation', label: t.stepConfirmation },
    ];
    const currentStepIndex = steps.findIndex(step => step.id === currentStep);

    if (currentStep === 'confirmation') return null;

    return (
        <div className="px-6 py-4 border-b dark:border-slate-700">
            <div className="flex items-start">
                {steps.map((step, index) => {
                    if (step.id === 'confirmation') return null;
                    const isActive = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center flex-shrink-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-primary dark:bg-secondary' : 'bg-gray-200 dark:bg-slate-600'}`}>
                                    {isActive ? (
                                        <svg className="w-5 h-5 text-white dark:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span className="text-gray-500 dark:text-gray-300 font-bold">{index + 1}</span>
                                    )}
                                </div>
                                <p className={`mt-2 text-xs text-center font-semibold transition-colors duration-300 w-20 ${isCurrent ? 'text-primary dark:text-secondary' : isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>{step.label}</p>
                            </div>
                            {index < steps.length - 2 && (
                                <div className={`flex-auto border-t-2 transition-colors duration-300 mx-2 mt-4 ${isActive ? 'border-primary dark:border-secondary' : 'border-gray-200 dark:border-slate-600'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cartItems, onRemoveItem, onPlaceOrder, language, currency, locale, t, checkoutStep, setCheckoutStep, order }) => {
  const [address, setAddress] = useState<Address | null>(null);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const drawerRef = useRef<HTMLDivElement>(null);

  const toggleDetails = (cartId: string) => {
    setExpandedDetails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cartId)) {
        newSet.delete(cartId);
      } else {
        newSet.add(cartId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsDrawerVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsDrawerVisible(false);
      const timer = setTimeout(() => {
        setAddress(null);
        setExpandedDetails(new Set());
      }, 300); // After transition
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleRemove = (cartId: string) => {
    setRemovingItems(prev => new Set(prev).add(cartId));
    setTimeout(() => {
        onRemoveItem(cartId);
        setRemovingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(cartId);
            return newSet;
        });
    }, 300);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price[currency], 0);

  const handleAddressSubmit = (submittedAddress: Address) => {
    setAddress(submittedAddress);
    setCheckoutStep('payment');
  };

  const handleFinalizeOrder = (paymentMethod: PaymentMethod) => {
    if (!address) return; 
    setCheckoutStep('processing');
    setTimeout(() => {
      onPlaceOrder(address, paymentMethod);
    }, 1500);
  };
  
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (firstElement) {
          firstElement.focus();
        }

        const handleTabKey = (event: KeyboardEvent) => {
            if (event.key === 'Tab') {
                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };

        const currentDrawer = drawerRef.current;
        currentDrawer.addEventListener('keydown', handleTabKey);

        return () => {
            currentDrawer.removeEventListener('keydown', handleTabKey);
        };
    }
  }, [isOpen, checkoutStep, cartItems]); // Re-run when content changes

  const renderContent = () => {
    switch (checkoutStep) {
      case 'address':
        return <AddressForm 
          t={t} 
          onBack={() => setCheckoutStep('cart')} 
          onSubmit={handleAddressSubmit}
          cartItems={cartItems}
          currency={currency}
          locale={locale}
          language={language}
        />;
      case 'payment':
        if (!address) {
          setCheckoutStep('address');
          return null;
        }
        return (
          <PaymentForm
            t={t}
            onBack={() => setCheckoutStep('address')}
            onSubmit={handleFinalizeOrder}
            address={address}
            cartItems={cartItems}
            currency={currency}
            locale={locale}
            language={language}
          />
        );
      case 'confirmation':
        if (!order) return null;
        return (
            <div className="p-6 text-center flex-grow flex flex-col justify-start items-center overflow-y-auto custom-scrollbar overscroll-contain min-h-0">
                <div className="flex justify-center items-center mx-auto bg-green-100 dark:bg-green-900/50 rounded-full h-16 w-16 my-4 flex-shrink-0">
                    <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-dark dark:text-gray-200 mb-2">{t.orderSuccessTitle}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t.orderSuccessMessage}</p>
                <p className="text-lg font-semibold bg-gray-100 dark:bg-slate-700 text-primary dark:text-secondary py-2 px-4 rounded-md inline-block mb-6 tracking-wider">{order.id}</p>
                
                <div className="mt-4 text-left w-full border-t dark:border-slate-700 pt-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.deliveryAddress}</h4>
                    <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-md text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{order.address.fullName}</p>
                        <p>{order.address.email} | {order.address.phone}</p>
                        <p>{order.address.street}, {order.address.postalCode} {order.address.city}, {order.address.country}</p>
                    </div>
                </div>
            </div>
        );
      case 'cart':
      default:
        return cartItems.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t.cartEmpty}</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto p-6 custom-scrollbar overscroll-contain space-y-4 min-h-0">
            {cartItems.map((item, index) => {
              const isRemoving = removingItems.has(item.cartId);
              const isExpanded = expandedDetails.has(item.cartId);
              const bookingDate = item.bookingDate ? new Date(item.bookingDate) : null;
              if (bookingDate && item.bookingTime) {
                const [hours, minutes] = item.bookingTime.split(':');
                bookingDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
              }

              const hourCycle = new Intl.Locale(locale).hourCycle;
              const uses12HourClock = hourCycle === 'h11' || hourCycle === 'h12';

              return (
                <div
                  key={item.cartId}
                  className={`
                    flex items-start space-x-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg 
                    transition-all duration-300 ease-in-out
                    ${isDrawerVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
                    ${isRemoving ? '!opacity-0 !-translate-x-full max-h-0 !p-0 !m-0 overflow-hidden' : 'min-h-[6rem]'}
                  `}
                  style={{ transitionDelay: `${index * 75}ms` }}
                >
                  <img src={item.imageUrl} alt={item.name[language]} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                  <div className="flex-grow flex flex-col h-full">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">{item.name[language]}</h4>
                      {item.type === 'service' && item.bookingDate && item.bookingTime && (
                        <button 
                          onClick={() => toggleDetails(item.cartId)}
                          className="text-sm text-primary dark:text-secondary hover:underline focus:outline-none"
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? t.hideDetails : t.viewDetails}
                        </button>
                      )}
                    </div>
                    
                    {isExpanded && item.type === 'service' && bookingDate && (
                        <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400 animate-fade-in-up">
                            <p className="font-medium">{t.bookingDateTime}:</p>
                            <div>
                                <p className="font-semibold text-gray-700 dark:text-gray-300">
                                    {bookingDate.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {bookingDate.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: uses12HourClock })}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex-grow"></div>

                    <p className="font-bold text-primary dark:text-secondary mt-1">{formatCurrency(item.price[currency], currency, locale)}</p>
                  </div>
                  <button onClick={() => handleRemove(item.cartId)} className="text-red-500 hover:text-red-700 p-1 flex-shrink-0" aria-label={`Remove ${item.name[language]}`}>
                    <TrashIcon className="w-5 h-5"/>
                  </button>
                </div>
              );
            })}
          </div>
        );
    }
  };
  
  const getTitle = () => {
    switch (checkoutStep) {
      case 'address': return t.deliveryAddress;
      case 'payment': return t.paymentDetails;
      case 'confirmation': return t.stepConfirmation;
      default: return t.cartTitle;
    }
  };


  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div 
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className={`flex flex-col h-full relative transition-opacity duration-300 ${isDrawerVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 flex-shrink-0">
            <h2 id="cart-title" className="text-2xl font-bold text-primary dark:text-secondary">{getTitle()}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" aria-label={t.close}><CloseIcon className="w-7 h-7"/></button>
          </div>

          <CheckoutStepper currentStep={checkoutStep} t={t} />

          {renderContent()}

          {cartItems.length > 0 && checkoutStep === 'cart' && (
            <div className="p-6 border-t dark:border-gray-700 mt-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-600 dark:text-gray-400">{t.subtotal}:</span>
                <span className="text-xl font-bold text-dark dark:text-gray-200">{formatCurrency(subtotal, currency, locale)}</span>
              </div>
              <button
                onClick={() => setCheckoutStep('address')}
                disabled={cartItems.length === 0}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full transition-colors duration-300 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 dark:bg-secondary dark:text-slate-900 dark:hover:bg-primary dark:disabled:bg-gray-600 animate-subtle-bounce"
              >
                {t.checkout}
              </button>
            </div>
          )}
          
          {checkoutStep === 'confirmation' && (
            <div className="p-6 border-t dark:border-gray-700 mt-auto">
              <button
                onClick={onClose}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full transition-colors duration-300 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-secondary dark:text-slate-900 dark:hover:bg-primary"
              >
                {t.backToShopping}
              </button>
            </div>
          )}

          {checkoutStep === 'processing' && (
            <div className="absolute inset-0 bg-primary bg-opacity-80 flex flex-col justify-center items-center z-10">
              <Spinner />
              <p className="text-white text-lg font-semibold mt-4">Processing your order...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};