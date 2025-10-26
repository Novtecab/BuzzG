

import React from 'react';
import { ServiceCard } from './ServiceCard';
import { ServiceCardSkeleton } from './ServiceCardSkeleton';
import type { Item, Language, Currency } from '../types';

interface ServiceGridProps {
  items: Item[];
  // FIX: Update onCardAction to include the trigger element parameter.
  onCardAction: (item: Item, imageElement: HTMLImageElement, triggerElement: HTMLElement) => void;
  // FIX: Update onQuickPay to include the trigger element parameter.
  onQuickPay: (item: Item, triggerElement: HTMLElement) => void;
  language: Language;
  currency: Currency;
  locale: string;
  t: any;
  loading: boolean;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ items, onCardAction, onQuickPay, language, currency, locale, t, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <ServiceCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {items.map((item) => (
        <ServiceCard
          key={item.id}
          item={item}
          onAction={onCardAction}
          onQuickPay={onQuickPay}
          language={language}
          currency={currency}
          locale={locale}
          t={t}
        />
      ))}
    </div>
  );
};