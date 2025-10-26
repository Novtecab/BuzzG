import React, { useRef, useState } from 'react';
import type { Item, Language, Currency } from '../types';

interface ServiceCardProps {
  item: Item;
  onAction: (item: Item, imageElement: HTMLImageElement, triggerElement: HTMLElement) => void;
  onQuickPay: (item: Item, triggerElement: HTMLElement) => void;
  language: Language;
  currency: Currency;
  locale: string;
  t: any;
}

const formatCurrency = (amount: number, currency: Currency, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const ServiceCard: React.FC<ServiceCardProps> = ({ item, onAction, onQuickPay, language, currency, locale, t }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isQuickPaying, setIsQuickPaying] = useState(false);

  const handleAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (imageRef.current) {
      setIsAdding(true);
      onAction(item, imageRef.current, e.currentTarget);
      setTimeout(() => setIsAdding(false), 1000); // Prevent clicks during animation
    }
  };

  const handleQuickPay = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsQuickPaying(true);
    onQuickPay(item, e.currentTarget);
    setTimeout(() => setIsQuickPaying(false), 1000); // Prevent clicks during checkout transition
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl dark:hover:shadow-lg dark:hover:shadow-secondary/20 flex flex-col">
      <img ref={imageRef} src={item.imageUrl} alt={item.name[language]} className="w-full h-48 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{item.name[language]}</h3>
        <div className="flex-grow mb-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{item.description[language]}</p>
            {(item.durationHours || item.includes?.[language]?.[0]) && (
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
                    {item.durationHours && (
                        <div className="flex items-center gap-1.5">
                            <ClockIcon className="w-3.5 h-3.5" />
                            <span><span className="font-semibold">{t.duration}:</span> {item.durationHours} {t.hours}</span>
                        </div>
                    )}
                    {item.includes?.[language]?.[0] && (
                        <div className="flex items-center gap-1.5">
                            <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                            <span className="truncate" title={item.includes[language][0]}>{item.includes[language][0]}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
        <div className="flex justify-between items-center mt-auto">
          <p className="text-lg font-semibold text-primary dark:text-secondary">
            {formatCurrency(item.price[currency], currency, locale)}
          </p>
          <div className="flex items-center gap-2">
            {item.type === 'product' && (
              <button
                onClick={handleQuickPay}
                disabled={isQuickPaying || isAdding}
                className="bg-transparent border border-primary text-primary font-bold py-2 px-4 rounded-full transition-colors duration-300 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:border-secondary dark:text-secondary dark:hover:bg-secondary/10 text-sm h-10 flex justify-center items-center min-w-[7rem]"
                title={t.quickPay}
              >
                {isQuickPaying ? <Spinner className="text-primary dark:text-secondary" /> : t.quickPay}
              </button>
            )}
            <button
              onClick={handleAction}
              disabled={isAdding || isQuickPaying}
              className="bg-primary text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-secondary dark:text-slate-900 dark:hover:bg-primary dark:focus:ring-secondary text-sm h-10 flex justify-center items-center min-w-[8rem]"
            >
              {isAdding ? <Spinner className="text-white dark:text-slate-900" /> : t.addToCart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};