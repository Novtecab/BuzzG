import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Item, CartItem, Language, Currency } from '../types';
import { translations } from '../constants';

interface ServiceModalProps {
  item: Item;
  onClose: () => void;
  onAddToCart: (item: CartItem, imageElement: HTMLImageElement | null) => void;
  language: Language;
  currency: Currency;
  locale: string;
  t: any;
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

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const ServiceModal: React.FC<ServiceModalProps> = ({ item, onClose, onAddToCart, language, currency, locale, t }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [slotSelected, setSlotSelected] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const handleAddToCart = () => {
    if (item.type === 'service' && (!selectedDate || !selectedTime)) {
      setError(t.selectDateTime);
      return;
    }
    setError(null);

    const cartItem: CartItem = { 
      ...item, 
      cartId: '',
      bookingDate: (item.type === 'service' && selectedDate) ? selectedDate.toISOString() : undefined,
      bookingTime: (item.type === 'service' && selectedTime) ? selectedTime : undefined
    };
    
    setIsLoading(true);
    onAddToCart(cartItem, imageRef.current); // Start animation immediately

    // Transition from loading to added after animation
    setTimeout(() => {
      setIsLoading(false);
      setIsAdded(true);
      // Close modal after showing "Added!"
      setTimeout(() => {
        handleClose();
      }, 900);
    }, 600); // Duration of the fly animation
  };

  const localeCode = useMemo(() => (language === 'sv' ? 'sv-SE' : 'en-US'), [language]);

  const daysOfWeek = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(localeCode, { weekday: 'short' });
    const days = [];
    const week = [1, 2, 3, 4, 5, 6, 0];
    for (const day of week) {
        const date = new Date(Date.UTC(2023, 0, 2 + day));
        days.push(formatter.format(date).slice(0, 2));
    }
    return days;
  }, [localeCode]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        days.push(date);
    }
    return days;
  }, [currentMonth]);
  
  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => {
        const newMonth = new Date(prev);
        newMonth.setDate(1);
        newMonth.setMonth(prev.getMonth() + offset);
        return newMonth;
    });
  };

  const isMonthInPast = useMemo(() => {
    const firstOfCurrentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const firstOfTodayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstOfCurrentMonth < firstOfTodayMonth;
  }, [currentMonth, today]);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      setError(null);
    }
  }, [selectedDate, selectedTime]);
  
  useEffect(() => {
    if (selectedTime) {
        setSlotSelected(true);
        const timer = setTimeout(() => {
            setSlotSelected(false);
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [selectedTime]);

  // When date is changed, clear selected time if it's now invalid
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const now = new Date();
      const isToday = selectedDate.toDateString() === now.toDateString();
      const [hour, minute] = selectedTime.split(':').map(Number);
      if (isToday && (now.getHours() > hour || (now.getHours() === hour && now.getMinutes() > minute))) {
        setSelectedTime(null);
      }
    }
  }, [selectedDate, selectedTime]);

  const timeSlots = useMemo(() => {
    const slots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    if (selectedDate) {
        const now = new Date();
        const isToday = selectedDate.toDateString() === now.toDateString();
        if (isToday) {
            return slots.filter(time => {
                const [hour, minute] = time.split(':').map(Number);
                return now.getHours() < hour || (now.getHours() === hour && now.getMinutes() < minute);
            });
        }
    }
    return slots;
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  const formatTimeForDisplay = (time: string) => {
    const [hourStr, minuteStr] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hourStr, 10), parseInt(minuteStr, 10));
    const hourCycle = new Intl.Locale(locale).hourCycle;
    const uses12HourClock = hourCycle === 'h11' || hourCycle === 'h12';
    return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: uses12HourClock });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            handleClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);

    const modalNode = modalRef.current;
    if (modalNode) {
        const focusableElements = modalNode.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (firstElement) {
            firstElement.focus();
        }

        const handleTabKey = (event: KeyboardEvent) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        modalNode.addEventListener('keydown', handleTabKey);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            modalNode.removeEventListener('keydown', handleTabKey);
        };
    }
    
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={handleClose}>
      <div ref={modalRef} className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg relative ${isClosing ? 'animate-fade-out-down' : 'animate-fade-in-up'}`} onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white z-10" aria-label={t.close}>
          <CloseIcon className="w-8 h-8"/>
        </button>

        <img ref={imageRef} src={item.imageUrl} alt={item.name[language]} className="w-full h-64 object-cover rounded-t-xl" />
        
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          <h2 className="text-3xl font-bold text-dark dark:text-gray-200 mb-2">{item.name[language]}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{item.description[language]}</p>

          {item.longDescription && (
            <div className="mb-6">
              <button
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="text-primary dark:text-secondary hover:underline text-sm font-medium focus:outline-none inline-flex items-center gap-1"
                aria-expanded={isDetailsExpanded}
              >
                <span>{isDetailsExpanded ? t.hideMoreDetails : t.viewMoreDetails}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 transition-transform duration-300 ${isDetailsExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isDetailsExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {item.longDescription[language]}
                </p>
              </div>
            </div>
          )}

          {(item.durationHours || (item.includes && item.includes[language].length > 0)) && (
            <div className="my-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">{t.whatsIncluded}</h3>
                <div className="space-y-3">
                    {item.durationHours && (
                        <div className="flex items-start text-gray-600 dark:text-gray-400">
                            <ClockIcon className="w-5 h-5 mr-3 mt-0.5 text-primary dark:text-secondary flex-shrink-0" />
                            <span><span className="font-semibold text-gray-700 dark:text-gray-300">{t.duration}:</span> {item.durationHours} {t.hours}</span>
                        </div>
                    )}
                    {item.includes?.[language].map((feature, index) => (
                        <div key={index} className="flex items-start text-gray-600 dark:text-gray-400">
                            <CheckCircleIcon className="w-5 h-5 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {item.type === 'service' && (
             <div className="mb-6">
             <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.bookingDateTime}</p>
             
             <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg border dark:border-slate-600">
               <div className="flex justify-between items-center mb-3">
                 <button 
                    onClick={() => changeMonth(-1)} 
                    disabled={isMonthInPast} 
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                   <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                 </button>
                 <span className="font-semibold text-gray-800 dark:text-gray-200">
                   {currentMonth.toLocaleString(localeCode, { month: 'long', year: 'numeric' })}
                 </span>
                 <button 
                    onClick={() => changeMonth(1)} 
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600"
                    >
                   <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                 </button>
               </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {daysOfWeek.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-2">
                  {calendarDays.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} />;
                    
                    const isPast = day < today;
                    const isSelected = selectedDate && day.getTime() === selectedDate.getTime();
                    const isToday = day.getTime() === today.getTime();

                    return (
                        <button
                          key={day.toString()}
                          onClick={() => handleDateSelect(day)}
                          disabled={isPast}
                          className={`w-full aspect-square text-sm rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary
                            ${isPast ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'hover:bg-accent dark:hover:bg-secondary/20'}
                            ${isSelected ? 'bg-primary text-white dark:bg-secondary dark:text-slate-900 shadow-md' : ''}
                            ${!isSelected && isToday ? 'bg-accent text-primary dark:bg-secondary/20 dark:text-secondary font-semibold' : ''}
                            ${!isSelected && !isToday && !isPast ? 'text-gray-800 dark:text-gray-200' : ''}
                          `}
                        >
                          {day.getDate()}
                        </button>
                    );
                  })}
                </div>
             </div>
             
             {selectedDate && (
               <div className="mt-4 transition-all duration-300 animate-fade-in-up">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {translations[language].selectTimeFor} {selectedDate.toLocaleDateString(localeCode, { month: 'long', day: 'numeric'})}
                    </p>
                    <div className={`flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold transition-opacity duration-300 ${slotSelected ? 'opacity-100' : 'opacity-0'}`}>
                        <CheckIcon className="w-4 h-4" />
                        <span>{t.slotSelected}</span>
                    </div>
                 </div>
                 {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map(time => (
                        <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`px-3 py-2 text-sm rounded-md transition-colors border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary
                                ${selectedTime === time ? 'bg-primary text-white border-primary dark:bg-secondary dark:text-slate-900 dark:border-secondary font-semibold' : 'bg-white text-gray-700 border-gray-300 hover:bg-accent dark:bg-slate-700 dark:text-gray-200 dark:border-slate-600 dark:hover:bg-secondary/20'}
                            `}
                        >
                            {formatTimeForDisplay(time)}
                        </button>
                    ))}
                    </div>
                 ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">{translations[language].noSlotsAvailable}</p>
                 )}
               </div>
             )}
           </div>
          )}
          
          {error && <p className="text-red-500 text-sm text-center my-2 animate-fade-in-up">{error}</p>}

          <div className="flex justify-between items-center mt-4">
            <p className="text-2xl font-bold text-primary dark:text-secondary">
              {formatCurrency(item.price[currency], currency, locale)}
            </p>
            <button
              onClick={handleAddToCart}
              disabled={isLoading || isAdded}
              className={`px-8 py-3 font-semibold text-white rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary w-40 h-12 flex justify-center items-center
                ${isAdded ? 'bg-green-500' : 'bg-primary hover:bg-secondary dark:bg-secondary dark:text-slate-900 dark:hover:bg-primary'}
                ${isLoading ? 'cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? <Spinner /> : isAdded ? t.addedToCart : t.addToCart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};