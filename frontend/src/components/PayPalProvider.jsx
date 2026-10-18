import React from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const paypalOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: 'USD',
    intent: 'capture',
};

export const PayPalProvider = ({ children }) => {
    if (!import.meta.env.VITE_PAYPAL_CLIENT_ID) {
        console.warn('PayPal Client ID not found. PayPal features will be disabled.');
        return <>{children}</>;
    }
    
    return (
        <PayPalScriptProvider options={paypalOptions}>
            {children}
        </PayPalScriptProvider>
    );
};