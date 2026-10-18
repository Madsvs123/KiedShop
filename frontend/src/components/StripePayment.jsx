import React, { useState } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button, useToast, Box, Text, Spinner, VStack, Alert, AlertIcon } from '@chakra-ui/react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const cardElementOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': { color: '#aab7c4' },
            padding: '10px',
        },
        invalid: { color: '#9e2146' },
    },
    hidePostalCode: true,
};

const CheckoutForm = ({ amount, orderId, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const toast = useToast();

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!stripe || !elements) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // Create payment intent on your server
            const response = await fetch('/api/payments/create-payment-intent', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify({ amount, orderId }),
            });
            
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message || 'Failed to create payment intent');
            
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: { card: elements.getElement(CardElement) },
            });
            
            if (stripeError) {
                setError(stripeError.message);
                toast({ title: 'Payment failed', description: stripeError.message, status: 'error', duration: 5000 });
                onError?.(stripeError);
            } else if (paymentIntent.status === 'succeeded') {
                // Confirm payment on your server
                await fetch('/api/payments/confirm', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    },
                    body: JSON.stringify({ paymentIntentId: paymentIntent.id, orderId }),
                });
                
                toast({ title: 'Payment successful!', status: 'success', duration: 3000 });
                onSuccess?.(paymentIntent);
            }
        } catch (error) {
            console.error('Payment error:', error);
            setError(error.message);
            toast({ title: 'Error', description: error.message, status: 'error', duration: 5000 });
            onError?.(error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
                <Box 
                    p={4} 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    w="full"
                    bg="white"
                >
                    <CardElement options={cardElementOptions} />
                </Box>
                
                {error && (
                    <Alert status="error" borderRadius="md" size="sm">
                        <AlertIcon />
                        {error}
                    </Alert>
                )}
                
                <Button
                    type="submit"
                    colorScheme="teal"
                    width="full"
                    size="lg"
                    isLoading={loading}
                    isDisabled={!stripe || loading}
                    loadingText="Processing..."
                >
                    Pay ${amount}
                </Button>
                
                <Text fontSize="xs" color="gray.500" textAlign="center">
                    Your payment is secure and encrypted. We never store your card details.
                </Text>
            </VStack>
        </form>
    );
};

export const StripePayment = (props) => (
    <Elements stripe={stripePromise}>
        <CheckoutForm {...props} />
    </Elements>
);