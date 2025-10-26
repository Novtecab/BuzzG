

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/CategoryTabs';
import { ServiceGrid } from './components/ServiceGrid';
import { ServiceModal } from './components/ServiceModal';
import { CartDrawer } from './components/CartDrawer';
import { FlyingImage } from './components/FlyingImage';
import { HomePage } from './components/HomePage';
import { translations, servicesAndProducts } from './constants';
import type { Language, Location, Item, CartItem, Category, Address, Theme, View, Order, PaymentMethod, SortOption, PriceRange, CheckoutStep, HomeSubCategory, CarSubCategory, HandymanSubCategory } from './types';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [location, setLocation] = useState<Location>('se');
  const [activeCategories, setActiveCategories] = useState<string[]>(['home']);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [flyingImage, setFlyingImage] = useState<{ src: string, rect: DOMRect } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cartIconRef = useRef<HTMLButtonElement>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [view, setView] = useState<View>('home');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('price-asc');
  const [priceRange, setPriceRange] = useState<PriceRange>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [activeSubCategories, setActiveSubCategories] = useState<string[]>([]);
  const [activeCarSubCategories, setActiveCarSubCategories] = useState<string[]>([]);
  const [activeHandymanSubCategories, setActiveHandymanSubCategories] = useState<string[]>([]);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [modalTrigger, setModalTrigger] = useState<HTMLElement | null>(null);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const t = useMemo(() => translations[language], [language]);
  
  const triggerFlyAnimation = (imageElement: HTMLImageElement | null) => {
    if (imageElement && cartIconRef.current) {
      const rect = imageElement.getBoundingClientRect();
      setFlyingImage({ src: imageElement.src, rect });
      setTimeout(() => {
        setFlyingImage(null);
      }, 600); // Animation duration
    }
  };

  const addToCart = (item: CartItem) => {
    // Safeguard to ensure services have booking details before being added to the cart.
    if (item.type === 'service' && (!item.bookingDate || !item.bookingTime)) {
      console.error('Attempted to add a service to the cart without booking details.', item);
      setSelectedItem(null); // Close modal if it was open
      return;
    }

    setCart((prevCart) => [...prevCart, { ...item, cartId: Date.now().toString() }]);
    setSelectedItem(null);
  };

  const removeFromCart = (cartId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  const placeOrder = (address: Address, paymentMethod: PaymentMethod) => {
    const subtotal = cart.reduce((acc, item) => acc + item.price[currency], 0);
    const newOrder: Order = {
        id: `BUZZ-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        items: [...cart],
        address,
        subtotal,
        paymentMethod,
        currency,
    };
    console.log('Order placed:', newOrder);
    setConfirmedOrder(newOrder);
    setCart([]);
    setCheckoutStep('confirmation');
  };

  const handleCardAction = (item: Item, imageElement: HTMLImageElement, triggerElement: HTMLElement) => {
    if (item.type === 'product') {
      triggerFlyAnimation(imageElement);
      addToCart({ ...item, cartId: '' /* placeholder */ });
      setIsCartOpen(true);
      setModalTrigger(triggerElement);
    } else {
      setSelectedItem(item);
      setModalTrigger(triggerElement);
    }
  };
  
  const handleModalAddToCart = (item: CartItem, imageElement: HTMLImageElement | null) => {
    triggerFlyAnimation(imageElement);
    addToCart(item);
    setIsCartOpen(true);
  }

  const handleQuickPay = (item: Item, triggerElement: HTMLElement) => {
    if (item.type !== 'product') return;
    addToCart({ ...item, cartId: '' }); // Add to cart
    setCheckoutStep('address'); // set step
    setIsCartOpen(true); // open drawer
    setModalTrigger(triggerElement);
  };

  const toggleCategory = (category: string) => {
    setIsLoading(true);
    setActiveCategories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(category)) {
            newSet.delete(category);
            if (category === 'home') setActiveSubCategories([]);
            if (category === 'car') setActiveCarSubCategories([]);
            if (category === 'handyman') setActiveHandymanSubCategories([]);
        } else {
            newSet.add(category);
        }
        return Array.from(newSet);
    });
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  
  const toggleSubCategory = (subCategory: HomeSubCategory) => {
    setIsLoading(true);
    setActiveSubCategories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(subCategory)) {
            newSet.delete(subCategory);
        } else {
            newSet.add(subCategory);
        }
        return Array.from(newSet);
    });
    setTimeout(() => setIsLoading(false), 500);
  };
  
  const toggleCarSubCategory = (subCategory: CarSubCategory) => {
    setIsLoading(true);
    setActiveCarSubCategories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(subCategory)) {
            newSet.delete(subCategory);
        } else {
            newSet.add(subCategory);
        }
        return Array.from(newSet);
    });
    setTimeout(() => setIsLoading(false), 500);
  };

  const toggleHandymanSubCategory = (subCategory: HandymanSubCategory) => {
    setIsLoading(true);
    setActiveHandymanSubCategories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(subCategory)) {
            newSet.delete(subCategory);
        } else {
            newSet.add(subCategory);
        }
        return Array.from(newSet);
    });
    setTimeout(() => setIsLoading(false), 500);
  };

  const handlePriceRangeChange = (range: PriceRange) => {
    setIsLoading(true);
    setPriceRange(prev => (prev === range ? null : range));
    setTimeout(() => setIsLoading(false), 500);
  };
  
  const handleSortChange = (option: SortOption) => {
      setIsLoading(true);
      setSortOption(option);
      setTimeout(() => setIsLoading(false), 500);
  };

  const currency = useMemo(() => (location === 'se' ? 'sek' : 'pkr'), [location]);
  
  const filteredItems = useMemo(() => {
    // 1. Category filter
    let items = servicesAndProducts.filter(item => {
        if (activeCategories.length === 0) {
            return true; 
        }

        return activeCategories.some(cat => {
            if (cat === 'home') return item.category === 'home';
            if (cat === 'car') return item.category === 'car' && item.id !== 'car-11';
            if (cat === 'rental') return item.category === 'bike' || item.category === 'storage' || item.id === 'car-11';
            if (cat === 'hamta') return item.category === 'pickup';
            if (cat === 'vending') return item.category === 'vending';
            if (cat === 'parking') return item.category === 'parking';
            if (cat === 'handyman') return item.category === 'handyman';
            if (cat === 'business') return item.category === 'business';
            return false;
        });
    });
    
    // 1b. Home Sub-category filter
    if (activeCategories.includes('home') && activeSubCategories.length > 0) {
        items = items.filter(item => {
            if (item.category !== 'home') return true;
            return activeSubCategories.includes(item.subCategory!);
        });
    }
    
    // 1c. Car Sub-category filter
    if (activeCategories.includes('car') && activeCarSubCategories.length > 0) {
        items = items.filter(item => {
            if (item.category !== 'car' || item.type === 'product' || item.id === 'car-11') return true;
            return activeCarSubCategories.includes(item.subCategory!);
        });
    }

    // 1d. Handyman Sub-category filter
    if (activeCategories.includes('handyman') && activeHandymanSubCategories.length > 0) {
        items = items.filter(item => {
            if (item.category !== 'handyman') return true;
            return activeHandymanSubCategories.includes(item.subCategory!);
        });
    }

    // 2. Price range filter
    if (priceRange) {
        const [minStr, maxStr] = priceRange.split('-');
        const min = Number(minStr);
        const max = maxStr === 'Infinity' ? Infinity : Number(maxStr);
        items = items.filter(item => {
            const price = item.price[currency];
            return price >= min && price <= max;
        });
    }

    // 3. Search filter
    if (searchTerm) {
        items = items.filter((item) => item.name[language].toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // 4. Sorting
    items.sort((a, b) => {
        switch (sortOption) {
            case 'price-asc':
                return a.price[currency] - b.price[currency];
            case 'price-desc':
                return b.price[currency] - a.price[currency];
            case 'name-asc':
                return a.name[language].localeCompare(b.name[language]);
            case 'name-desc':
                return b.name[language].localeCompare(a.name[language]);
            default:
                return 0;
        }
    });

    return items;
  }, [activeCategories, activeSubCategories, activeCarSubCategories, activeHandymanSubCategories, language, searchTerm, priceRange, sortOption, currency]);
  
  
  const locale = useMemo(() => (location === 'se' ? 'sv-SE' : 'en-PK'), [location]);
  
  const handleBrowseServicesClick = () => {
    setView('services');
    setActiveCategories(['home']); // Reset to default view
  };

  const handleForBusinessClick = () => {
    setView('services');
    setActiveCategories(['business']); // Go directly to business services
  };


  return (
    <div className="min-h-screen font-sans text-dark dark:text-gray-200 flex flex-col">
      <Header
        ref={cartIconRef}
        language={language}
        setLanguage={setLanguage}
        location={location}
        setLocation={setLocation}
        cartCount={cart.length}
        onCartClick={(e) => {
            setIsCartOpen(true);
            setModalTrigger(e.currentTarget);
        }}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        t={t}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogoClick={() => setView('home')}
      />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {view === 'home' ? (
          <HomePage 
            onBrowseServices={handleBrowseServicesClick} 
            onForBusinessClick={handleForBusinessClick}
            t={t} 
          />
        ) : (
          <>
            <FilterBar
              activeCategories={activeCategories}
              onToggleCategory={toggleCategory}
              activeSubCategories={activeSubCategories}
              onToggleSubCategory={toggleSubCategory}
              activeCarSubCategories={activeCarSubCategories}
              onToggleCarSubCategory={toggleCarSubCategory}
              activeHandymanSubCategories={activeHandymanSubCategories}
              onToggleHandymanSubCategory={toggleHandymanSubCategory}
              sortOption={sortOption}
              onSortChange={handleSortChange}
              priceRange={priceRange}
              onPriceRangeChange={handlePriceRangeChange}
              currency={currency}
              t={t}
            />
            <ServiceGrid
              items={filteredItems}
              onCardAction={handleCardAction}
              onQuickPay={handleQuickPay}
              language={language}
              currency={currency}
              locale={locale}
              t={t}
              loading={isLoading}
            />
          </>
        )}
      </main>
      
      {selectedItem && (
        <ServiceModal
          item={selectedItem}
          onClose={() => {
            setSelectedItem(null);
            modalTrigger?.focus();
          }}
          onAddToCart={handleModalAddToCart}
          language={language}
          currency={currency}
          locale={locale}
          t={t}
        />
      )}

      {flyingImage && cartIconRef.current && (
        <FlyingImage 
          src={flyingImage.src}
          startRect={flyingImage.rect}
          endRect={cartIconRef.current.getBoundingClientRect()}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
          // Reset state after a delay to allow for the closing animation
          setTimeout(() => {
            setCheckoutStep('cart');
            setConfirmedOrder(null);
          }, 300);
          modalTrigger?.focus();
        }}
        cartItems={cart}
        onRemoveItem={removeFromCart}
        onPlaceOrder={placeOrder}
        language={language}
        currency={currency}
        locale={locale}
        t={t}
        checkoutStep={checkoutStep}
        setCheckoutStep={setCheckoutStep}
        order={confirmedOrder}
      />

       <footer className="bg-dark text-white dark:bg-slate-800 p-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-bold text-primary dark:text-secondary mb-4">{t.title}</h3>
            <p className="text-gray-400">&copy; 2024 Buzz. {t.footerText}</p>
          </div>
          <div className="md:col-span-2">
            <button
              onClick={() => setIsContactExpanded(!isContactExpanded)}
              className="text-xl font-bold w-full flex justify-between items-center text-left mb-4"
              aria-expanded={isContactExpanded}
              aria-controls="contact-details"
            >
              <span>{t.contactUs}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 text-gray-400 ${isContactExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              id="contact-details"
              className={`transition-all duration-500 ease-in-out overflow-hidden ${isContactExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <ul className="space-y-2 text-gray-400">
                    <li>
                      <a href="mailto:novtec.x.ab@gmail.com" className="hover:text-secondary transition-colors inline-flex items-center justify-center sm:justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>novtec.x.ab@gmail.com</span>
                      </a>
                    </li>
                    <li>
                      <a href="tel:+46731442276" className="hover:text-secondary transition-colors inline-flex items-center justify-center sm:justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>+46 731 442 276</span>
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">{t.address}</h4>
                  <address className="text-gray-400 not-italic flex items-start justify-center sm:justify-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Technopolis Kista</span>
                  </address>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;