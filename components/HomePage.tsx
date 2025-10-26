import React from 'react';

interface HomePageProps {
  onBrowseServices: () => void;
  t: any;
}

export const HomePage: React.FC<HomePageProps> = ({ onBrowseServices, t }) => {
  return (
    <div className="relative text-center rounded-lg overflow-hidden my-8 animate-fade-in-up">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516572573295-8d98d161a4c8?fit=crop&w=1200&h=500&q=80')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      <div className="relative flex flex-col items-center justify-center p-12 md:p-24">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">{t.heroTitle}</h2>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl drop-shadow-md">{t.heroSubtitle}</p>
        <button
          onClick={onBrowseServices}
          className="bg-primary text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-primary dark:bg-secondary dark:text-slate-900 dark:hover:bg-primary"
        >
          {t.browseServices}
        </button>
      </div>
    </div>
  );
};
