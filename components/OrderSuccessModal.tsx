import React, { useState } from 'react';
import type { Order } from '../types';

interface OrderSuccessModalProps {
    order: Order;
    onClose: () => void;
    t: any;
    locale: string;
}

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose, t, locale }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Animation duration
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={handleClose}>
            <div 
                className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md text-center p-8 relative ${isClosing ? 'animate-fade-out-down' : 'animate-fade-in-up'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center items-center mx-auto bg-green-100 dark:bg-green-900/50 rounded-full h-16 w-16 mb-4">
                    <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-dark dark:text-gray-200 mb-2">{t.orderSuccessTitle}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t.orderSuccessMessage}</p>
                <p className="text-lg font-semibold bg-gray-100 dark:bg-slate-700 text-primary dark:text-secondary py-2 px-4 rounded-md inline-block mb-6 tracking-wider">{order.id}</p>
                
                <button
                    onClick={handleClose}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full transition-colors duration-300 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-secondary dark:text-slate-900 dark:hover:bg-primary"
                >
                    {t.backToShopping}
                </button>
            </div>
        </div>
    );
};
