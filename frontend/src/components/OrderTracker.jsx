import React from 'react';
import { Box, Flex, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { FiCheck, FiPackage, FiTruck, FiCheckCircle, FiClock, FiCreditCard } from 'react-icons/fi';

const orderSteps = [
    { label: 'Order Placed', icon: FiPackage, key: 'placed', status: 'pending' },
    { label: 'Payment Confirmed', icon: FiCreditCard, key: 'payment', status: 'paid' },
    { label: 'Processing', icon: FiClock, key: 'processing', status: 'processing' },
    { label: 'Shipped', icon: FiTruck, key: 'shipped', status: 'shipped' },
    { label: 'Delivered', icon: FiCheckCircle, key: 'delivered', status: 'delivered' },
];

export const OrderTracker = ({ order }) => {
    const getCurrentStep = () => {
        if (order?.isDelivered) return 4;
        if (order?.status === 'shipped') return 3;
        if (order?.status === 'processing') return 2;
        if (order?.isPaid) return 1;
        return 0;
    };
    
    const currentStep = getCurrentStep();
    const bgColor = useColorModeValue('white', 'gray.800');
    
    return (
        <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm" mb={6}>
            <Text fontWeight="bold" mb={4}>Order Status</Text>
            <Flex justify="space-between" align="center" flexWrap="wrap">
                {orderSteps.map((step, index) => (
                    <Flex key={step.key} direction="column" align="center" flex={1} minW="80px">
                        <Box
                            w="50px"
                            h="50px"
                            borderRadius="full"
                            bg={index <= currentStep ? 'teal.500' : 'gray.200'}
                            color={index <= currentStep ? 'white' : 'gray.500'}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            position="relative"
                            zIndex={1}
                        >
                            <Icon as={step.icon} boxSize={6} />
                            {index === currentStep && (
                                <Box
                                    position="absolute"
                                    w="60px"
                                    h="60px"
                                    borderRadius="full"
                                    border="2px solid"
                                    borderColor="teal.500"
                                    animation="pulse 1.5s infinite"
                                />
                            )}
                        </Box>
                        <Text
                            mt={2}
                            fontSize="xs"
                            fontWeight={index === currentStep ? 'bold' : 'normal'}
                            color={index <= currentStep ? 'teal.500' : 'gray.500'}
                            textAlign="center"
                        >
                            {step.label}
                        </Text>
                        {index < orderSteps.length - 1 && (
                            <Box
                                position="relative"
                                top="-25px"
                                left="50%"
                                w="calc(100% - 50px)"
                                h="2px"
                                bg={index < currentStep ? 'teal.500' : 'gray.200'}
                                zIndex={0}
                            />
                        )}
                    </Flex>
                ))}
            </Flex>
            
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </Box>
    );
};