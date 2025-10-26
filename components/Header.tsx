import React, { useRef, useEffect, forwardRef } from 'react';
import type { Language, Location, Theme } from '../types';

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  location: Location;
  setLocation: (loc: Location) => void;
  cartCount: number;
  onCartClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: any;
  onLogoClick: () => void;
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const LocationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);


const CartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.328 1.093-.828l2.857-9.522A.75.75 0 0021 3H5.25v.031l-.121.443z" />
  </svg>
);

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.95-4.243l-1.59-1.59M3 12h2.25m.386-6.364l1.59 1.591M12 12a4.5 4.5 0 000 9 4.5 4.5 0 000-9z" />
  </svg>
);

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);


export const Header = forwardRef<HTMLButtonElement, HeaderProps>(({ language, setLanguage, location, setLocation, cartCount, onCartClick, searchTerm, onSearchChange, theme, toggleTheme, t, onLogoClick }, ref) => {
  const badgeRef = useRef<HTMLSpanElement>(null);
  const prevCartCountRef = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCartCountRef.current && badgeRef.current) {
      const badge = badgeRef.current;
      badge.classList.add('animate-pop');
      const timer = setTimeout(() => {
        badge.classList.remove('animate-pop');
      }, 300); // Animation duration
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);
  
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center flex-wrap gap-4">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 text-left p-1 -m-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-800 dark:focus:ring-secondary"
          aria-label={t.ariaLabelHomepage}
        >
          <LogoIcon className="w-7 h-7 text-primary dark:text-secondary" />
          <span className="text-2xl md:text-3xl font-bold text-primary dark:text-secondary">{t.title}</span>
        </button>
        
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
              <input
                type="search"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={onSearchChange}
                className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-secondary"
                aria-label={t.searchPlaceholder}
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                <div className="relative">
                    <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="appearance-none bg-transparent border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:border-gray-600 dark:text-white dark:focus:ring-secondary"
                    aria-label={t.ariaLabelLanguage}
                    >
                    <option value="en">{t.english}</option>
                    <option value="sv">{t.swedish}</option>
                    </select>
                    <GlobeIcon className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select
                    id="location-select"
                    value={location}
                    onChange={(e) => setLocation(e.target.value as Location)}
                    className="appearance-none bg-transparent border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:border-gray-600 dark:text-white dark:focus:ring-secondary"
                    aria-label={t.ariaLabelLocation}
                    >
                    <option value="se">{t.sweden}</option>
                    <option value="pk">{t.pakistan}</option>
                    </select>
                    <LocationIcon className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                </div>

                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-secondary"
                  aria-pressed={theme === 'dark'}
                  aria-label={theme === 'light' ? t.ariaLabelToggleDark : t.ariaLabelToggleLight}
                >
                  {theme === 'light' ? (
                    <MoonIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <SunIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  )}
                </button>

                <button
                    ref={ref}
                    onClick={onCartClick}
                    className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-secondary"
                    aria-label={`${t.ariaLabelOpenCart}, ${cartCount} ${cartCount === 1 ? t.item : t.items}`}
                >
                    <CartIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    {cartCount > 0 && (
                    <span
                      ref={badgeRef}
                      className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
                      aria-hidden="true"
                    >
                        {cartCount}
                    </span>
                    )}
                </button>
            </div>
        </div>
      </div>
    </header>
  );
});
Header.displayName = 'Header';