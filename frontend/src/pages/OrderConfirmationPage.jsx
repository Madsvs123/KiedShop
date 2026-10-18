import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Box, Flex, Heading, Text, Button, useColorModeValue, useToast,
    VStack, HStack, Divider, Image, Badge, Alert, AlertIcon,
    Spinner, SimpleGrid, Icon, Tag, Table, Thead, Tbody, Tr, Th, Td
} from '@chakra-ui/react';
import { FiCheckCircle, FiPackage, FiTruck, FiClock, FiDownload } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../services/api';
import { useTranslation } from 'react-i18next';

const OrderConfirmationPage = () => {
    const { t } = useTranslation("pages");
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    
    const { data: order, isLoading, error } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const response = await getOrderById(id);
            return response.data;
        },
        enabled: !!id
    });
    
    useEffect(() => {
    const bgColor = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
        if (order) {
            toast({
                title: 'Order Confirmed!',
                description: `Your order #${order._id.slice(-8)} has been confirmed`,
                status: 'success',
                duration: 5000,
            });
        }
    }, [order]);
    
    if (isLoading) {
        return (
            <Flex justify="center" align="center" minH="400px">
                <Spinner size="xl" />
            </Flex>
        );
    }
    
    if (error || !order) {
        return (
            <Alert status="error">
                <AlertIcon />
                Order not found
            </Alert>
        );
    }
    
    return (
        <Box bg={bgColor} minH="100vh" py={8}>
            <Box maxW="1200px" mx="auto" px={4}>
                {/* Success Header */}
                <Flex direction="column" align="center" mb={8} textAlign="center">
                    <Icon as={FiCheckCircle} boxSize={16} color="green.500" mb={4} />
                    <Heading size="xl" mb={2}>Thank You for Your Order!</Heading>
                    <Text color="gray.500">
                        Order #{order._id.slice(-8)} has been confirmed
                    </Text>
                </Flex>
                
                {/* Order Status */}
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={8}>
                    <Box bg={cardBg} p={4} borderRadius="lg" textAlign="center">
                        <Icon as={FiCheckCircle} boxSize={6} color="green.500" mb={2} />
                        <Text fontWeight="semibold">Order Placed</Text>
                        <Text fontSize="sm" color="gray.500">
                            {new Date(order.createdAt).toLocaleDateString()}
                        </Text>
                    </Box>
                    <Box bg={cardBg} p={4} borderRadius="lg" textAlign="center">
                        <Icon as={FiPackage} boxSize={6} color="blue.500" mb={2} />
                        <Text fontWeight="semibold">Processing</Text>
                        <Text fontSize="sm" color="gray.500">Preparing your order</Text>
                    </Box>
                    <Box bg={cardBg} p={4} borderRadius="lg" textAlign="center">
                        <Icon as={FiTruck} boxSize={6} color="purple.500" mb={2} />
                        <Text fontWeight="semibold">Shipped</Text>
                        <Text fontSize="sm" color="gray.500">Tracking soon</Text>
                    </Box>
                    <Box bg={cardBg} p={4} borderRadius="lg" textAlign="center">
                        <Icon as={FiClock} boxSize={6} color="orange.500" mb={2} />
                        <Text fontWeight="semibold">Delivered</Text>
                        <Text fontSize="sm" color="gray.500">Est. 3-5 days</Text>
                    </Box>
                </SimpleGrid>
                
                <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
                    {/* Order Details */}
                    <Box flex={2}>
                        <Box bg={cardBg} p={6} borderRadius="lg" mb={6}>
                            <Heading size="md" mb={4}>Order Summary</Heading>
                            
                            <Table variant="simple" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th>Product</Th>
                                        <Th>Quantity</Th>
                                        <Th>Price</Th>
                                        <Th>Total</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {order.orderItems?.map((item, idx) => (
                                        <Tr key={idx}>
                                            <Td>
                                                <Flex align="center" gap={3}>
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        boxSize="50px"
                                                        objectFit="cover"
                                                        borderRadius="md"
                                                        fallbackSrc="/images/placeholder.png"
                                                    />
                                                    <Text fontWeight="medium">{item.name}</Text>
                                                </Flex>
                                            </Td>
                                            <Td>{item.qty}</Td>
                                            <Td>${item.price.toFixed(2)}</Td>
                                            <Td fontWeight="bold">${(item.price * item.qty).toFixed(2)}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                        
                        <Box bg={cardBg} p={6} borderRadius="lg">
                            <Heading size="md" mb={4}>Shipping Address</Heading>
                            <Text>{order.shippingAddress?.address}</Text>
                            <Text>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</Text>
                            <Text>{order.shippingAddress?.country}</Text>
                        </Box>
                    </Box>
                    
                    {/* Order Total */}
                    <Box flex={1}>
                        <Box bg={cardBg} p={6} borderRadius="lg" position="sticky" top="20px">
                            <Heading size="md" mb={4}>Order Total</Heading>
                            <VStack spacing={3} align="stretch">
                                <Flex justify="space-between">
                                    <Text>Subtotal</Text>
                                    <Text>${order.itemsPrice?.toFixed(2)}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text>Shipping</Text>
                                    <Text>${order.shippingPrice?.toFixed(2)}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text>Tax</Text>
                                    <Text>${order.taxPrice?.toFixed(2)}</Text>
                                </Flex>
                                <Divider />
                                <Flex justify="space-between" fontSize="xl" fontWeight="bold">
                                    <Text>Total</Text>
                                    <Text color="teal.500">${order.totalPrice?.toFixed(2)}</Text>
                                </Flex>
                            </VStack>
                            
                            <Button
                                as={Link}
                                to="/orders"
                                colorScheme="teal"
                                w="full"
                                mt={6}
                            >
                                View All Orders
                            </Button>
                            
                            <Button
                                as={Link}
                                to="/products"
                                variant="outline"
                                w="full"
                                mt={3}
                            >
                                Continue Shopping
                            </Button>
                        </Box>
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
};

export default OrderConfirmationPage;