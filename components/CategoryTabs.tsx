

import React from 'react';
import type { SortOption, PriceRange, Currency, HomeSubCategory, CarSubCategory, HandymanSubCategory } from '../types';
// FIX: Import translations to resolve 'Cannot find name' error.
import { translations } from '../constants';

interface FilterBarProps {
  activeCategories: string[];
  onToggleCategory: (category: string) => void;
  activeSubCategories: string[];
  onToggleSubCategory: (subCategory: HomeSubCategory) => void;
  activeCarSubCategories: string[];
  onToggleCarSubCategory: (subCategory: CarSubCategory) => void;
  activeHandymanSubCategories: string[];
  onToggleHandymanSubCategory: (subCategory: HandymanSubCategory) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  priceRange: PriceRange;
  onPriceRangeChange: (range: PriceRange) => void;
  currency: Currency;
  t: any;
}

// Define sort options with keys that match the translation file
const sortOptions: { value: SortOption; labelKey: keyof (typeof translations)['en'] }[] = [
    { value: 'price-asc', labelKey: 'priceAsc' },
    { value: 'price-desc', labelKey: 'priceDesc' },
    { value: 'name-asc', labelKey: 'nameAsc' },
    { value: 'name-desc', labelKey: 'nameDesc' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ 
    activeCategories, 
    onToggleCategory, 
    activeSubCategories,
    onToggleSubCategory,
    activeCarSubCategories,
    onToggleCarSubCategory,
    activeHandymanSubCategories,
    onToggleHandymanSubCategory,
    sortOption,
    onSortChange,
    priceRange,
    onPriceRangeChange,
    currency,
    t 
}) => {
  const categoryFilters = [
    { key: 'home', label: t.homeServices },
    { key: 'car', label: t.carServices },
    { key: 'handyman', label: t.handymanServices },
    { key: 'rental', label: t.rentalServices },
    { key: 'hamta', label: t.hamtaServices },
    { key: 'vending', label: t.vendingServices },
    { key: 'parking', label: t.parkingServices },
  ];

  const homeSubCategoryFilters: { key: HomeSubCategory; label: string }[] = [
    { key: 'renovation', label: t.renovation },
    { key: 'installation', label: t.installation },
    { key: 'demolition', label: t.demolition },
    { key: 'cleaning', label: t.cleaning },
    { key: 'moving', label: t.moving },
    { key: 'repair', label: t.homeRepair },
    { key: 'catering', label: t.catering },
    { key: 'wellness', label: t.wellness },
    { key: 'pet', label: t.petServices },
    { key: 'education', label: t.education },
    { key: 'flooring', label: t.flooring },
    { key: 'construction', label: t.construction },
  ];

  const carSubCategoryFilters: { key: CarSubCategory; label: string }[] = [
    { key: 'inspection', label: t.carInspection },
    { key: 'repair', label: t.carRepair },
    { key: 'maintenance', label: t.carMaintenance },
  ];

  const handymanSubCategoryFilters: { key: HandymanSubCategory; label: string }[] = [
      { key: 'small-repairs', label: t.handymanSmallRepairs },
      { key: 'assembly', label: t.handymanAssembly },
      { key: 'painting', label: t.handymanPainting },
      { key: 'carpentry', label: t.carpentry },
  ];

  const priceRanges = currency === 'sek' 
    ? [
        { key: '0-500', label: `${t.under} 500` },
        { key: '500-1500', label: '500 - 1500' },
        { key: '1500-5000', label: '1500 - 5000' },
        { key: '5000-Infinity', label: `${t.over} 5000` },
      ]
    : [
        { key: '0-10000', label: `${t.under} 10000` },
        { key: '10000-25000', label: '10000 - 25000' },
        { key: '25000-50000', label: '25000 - 50000' },
        { key: '50000-Infinity', label: `${t.over} 50000` },
      ];

  const FilterButton: React.FC<{onClick: () => void, isActive: boolean, children: React.ReactNode, 'aria-pressed'?: boolean}> = ({ onClick, isActive, children, ...props }) => {
    // Active buttons have the most prominent "pop" effect.
    const activeClasses = 'bg-primary text-white dark:bg-secondary dark:text-slate-900 shadow-xl scale-105';
    // Inactive buttons are subtle but respond nicely to hover with a matching scale effect.
    const inactiveClasses = 'bg-white text-gray-700 dark:bg-slate-700 dark:text-gray-300 shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-slate-600 hover:scale-105';
    return (
        <button
            onClick={onClick}
            // Smoother transition with a slightly longer duration.
            className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out transform text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-secondary dark:focus:ring-accent ${
            isActive ? activeClasses : inactiveClasses
            }`}
            aria-pressed={isActive}
            {...props}
        >
            {children}
        </button>
    );
  };
  
  const showHomeSubFilters = activeCategories.includes('home');
  const showCarSubFilters = activeCategories.includes('car');
  const showHandymanSubFilters = activeCategories.includes('handyman');

  return (
    <div className="space-y-6 mb-8 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
        {/* Main Filters Container */}
        <div className="space-y-6">
            {/* Category Filters */}
            <div className="flex justify-center gap-2 md:gap-4 flex-wrap" role="group" aria-label={t.categories}>
                {categoryFilters.map((filter) => (
                    <FilterButton
                        key={filter.key}
                        onClick={() => onToggleCategory(filter.key)}
                        isActive={activeCategories.includes(filter.key)}
                    >
                        {filter.label}
                    </FilterButton>
                ))}
            </div>

            {/* Home Sub-category Filters */}
            <div 
              className={`transition-all duration-500 ease-in-out overflow-hidden ${showHomeSubFilters ? 'max-h-40' : 'max-h-0'}`}
              aria-hidden={!showHomeSubFilters}
            >
              <div className="border-t dark:border-slate-700 pt-6">
                  <div 
                      className={`flex justify-center gap-2 md:gap-4 flex-wrap transition-all duration-500 ease-out transform ${showHomeSubFilters ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
                      role="group" 
                      aria-label={t.homeServiceSubcategories}
                  >
                      {homeSubCategoryFilters.map((filter) => (
                          <FilterButton
                              key={filter.key}
                              onClick={() => onToggleSubCategory(filter.key)}
                              isActive={activeSubCategories.includes(filter.key)}
                          >
                              {filter.label}
                          </FilterButton>
                      ))}
                  </div>
              </div>
            </div>
            
            {/* Car Sub-category Filters */}
            <div 
              className={`transition-all duration-500 ease-in-out overflow-hidden ${showCarSubFilters ? 'max-h-40' : 'max-h-0'}`}
              aria-hidden={!showCarSubFilters}
            >
              <div className="border-t dark:border-slate-700 pt-6">
                <div 
                    className={`flex justify-center gap-2 md:gap-4 flex-wrap transition-all duration-500 ease-out transform ${showCarSubFilters ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
                    role="group" 
                    aria-label={t.carServiceSubcategories}
                >
                    {carSubCategoryFilters.map((filter) => (
                        <FilterButton
                            key={filter.key}
                            onClick={() => onToggleCarSubCategory(filter.key)}
                            isActive={activeCarSubCategories.includes(filter.key)}
                        >
                            {filter.label}
                        </FilterButton>
                    ))}
                </div>
              </div>
            </div>

            {/* Handyman Sub-category Filters */}
            <div 
              className={`transition-all duration-500 ease-in-out overflow-hidden ${showHandymanSubFilters ? 'max-h-40' : 'max-h-0'}`}
              aria-hidden={!showHandymanSubFilters}
            >
              <div className="border-t dark:border-slate-700 pt-6">
                <div 
                    className={`flex justify-center gap-2 md:gap-4 flex-wrap transition-all duration-500 ease-out transform ${showHandymanSubFilters ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
                    role="group" 
                    aria-label={t.handymanServiceSubcategories}
                >
                    {handymanSubCategoryFilters.map((filter) => (
                        <FilterButton
                            key={filter.key}
                            onClick={() => onToggleHandymanSubCategory(filter.key)}
                            isActive={activeHandymanSubCategories.includes(filter.key)}
                        >
                            {filter.label}
                        </FilterButton>
                    ))}
                </div>
              </div>
            </div>
        </div>
        
        {/* Price and Sort Filters */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 flex-wrap pt-6 border-t dark:border-slate-700">
            {/* Price Range */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center" role="group" aria-label={t.priceRange}>
                <span className="font-semibold text-sm mr-2 text-gray-700 dark:text-gray-300">{t.priceRange}:</span>
                {priceRanges.map((range) => (
                    <FilterButton
                        key={range.key}
                        onClick={() => onPriceRangeChange(range.key)}
                        isActive={priceRange === range.key}
                    >
                        {range.label}
                    </FilterButton>
                ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="font-semibold text-sm text-gray-700 dark:text-gray-300">{t.sort}:</label>
                <div className="relative">
                    <select
                        id="sort-select"
                        value={sortOption}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        className="appearance-none bg-gray-200 dark:bg-slate-700 border-none rounded-full py-2 pl-4 pr-10 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-secondary dark:focus:ring-accent cursor-pointer"
                    >
                        {sortOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{t[opt.labelKey]}</option>
                        ))}
                    </select>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
  );
};