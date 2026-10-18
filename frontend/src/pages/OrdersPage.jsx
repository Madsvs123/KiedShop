import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box, Heading, Text, SimpleGrid, Spinner, Alert, AlertIcon,
    useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Badge,
    Button, HStack, VStack, Divider, Flex, Image, Icon,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, useDisclosure, Tag, Wrap, WrapItem
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { getOrders, getOrderById } from '../services/api';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin, FiCreditCard, FiCalendar } from 'react-icons/fi';

const OrdersPage = () => {
    const { t } = useTranslation('pages');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const itemBg = useColorModeValue('gray.50', 'gray.700');
    
    // Fetch orders
    const { data: orders = [], isLoading, error, refetch } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const response = await getOrders();
            return response.data;
        }
    });
    
    // Fetch single order details
    const { data: orderDetails, isLoading: orderLoading } = useQuery({
        queryKey: ['order', selectedOrder?._id],
        queryFn: async () => {
            const response = await getOrderById(selectedOrder?._id);
            return response.data;
        },
        enabled: !!selectedOrder?._id
    });
    
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        onOpen();
    };
    
    const getStatusColor = (status) => {
        const colors = {
            pending: 'orange',
            processing: 'blue',
            shipped: 'purple',
            delivered: 'green',
            cancelled: 'red'
        };
        return colors[status] || 'gray';
    };
    
    const getStatusIcon = (status) => {
        const icons = {
            pending: FiClock,
            processing: FiPackage,
            shipped: FiTruck,
            delivered: FiCheckCircle,
            cancelled: FiClock
        };
        return icons[status] || FiPackage;
    };
    
    const getStatusText = (status) => {
        const texts = {
            pending: t('pending'),
            processing: t('processing'),
            shipped: t('shipped'),
            delivered: t('delivered'),
            cancelled: t('cancelled')
        };
        return texts[status] || status;
    };
    
    if (isLoading) {
        return (
            <Flex justify="center" align="center" minH="400px">
                <Spinner size="xl" color="teal.500" />
            </Flex>
        );
    }
    
    if (error) {
        return (
            <Alert status="error" borderRadius="lg">
                <AlertIcon />
                Error loading orders: {error.message}
            </Alert>
        );
    }
    
    return (
        <Box bg={bgColor} minH="100vh" py={6}>
            <Box maxW="1200px" mx="auto" px={4}>
                {/* Header */}
                <Heading size="xl" mb={6}>{t('myOrders')}</Heading>
                
                {orders.length === 0 ? (
                    <Box textAlign="center" py={12}>
                        <Icon as={FiPackage} boxSize={16} opacity={0.3} />
                        <Heading size="md" mt={4} mb={2}>{t('noOrdersYet')}</Heading>
                        <Text color="gray.500" mb={6}>
                            {t('noOrdersYetDesc')}
                        </Text>
                        <Button as={Link} to="/products" colorScheme="teal">
                            {t('startShopping')}
                        </Button>
                    </Box>
                ) : (
                    <VStack spacing={6} align="stretch">
                        {orders.map((order) => {
                            const StatusIcon = getStatusIcon(order.status);
                            return (
                                <Box
                                    key={order._id}
                                    bg={cardBg}
                                    borderRadius="lg"
                                    boxShadow="sm"
                                    overflow="hidden"
                                    _hover={{ boxShadow: 'md' }}
                                    transition="all 0.2s"
                                >
                                    {/* Order Header */}
                                    <Flex
                                        justify="space-between"
                                        align="center"
                                        p={4}
                                        bg={itemBg}
                                        flexWrap="wrap"
                                        gap={3}
                                    >
                                        <VStack align="start" spacing={1}>
                                            <Text fontSize="sm" color="gray.500">
                                                Order #{order._id?.slice(-8).toUpperCase()}
                                            </Text>
                                            <HStack spacing={2}>
                                                <Icon as={FiCalendar} size={12} color="gray.400" />
                                                <Text fontSize="sm" color="gray.500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                        
                                        <Badge
                                            colorScheme={getStatusColor(order.status)}
                                            fontSize="md"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                        >
                                            <HStack spacing={1}>
                                                <Icon as={StatusIcon} size={12} />
                                                <Text>{getStatusText(order.status)}</Text>
                                            </HStack>
                                        </Badge>
                                        
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            colorScheme="teal"
                                            onClick={() => handleViewOrder(order)}
                                        >
                                            {t('viewDetails')}
                                        </Button>
                                    </Flex>
                                    
                                    {/* Order Summary */}
                                    <Box p={4}>
                                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
                                            <Box>
                                                <Text fontSize="xs" color="gray.500">{t('totalAmount')}</Text>
                                                <Text fontSize="xl" fontWeight="bold" color="teal.500">
                                                    ${order.totalPrice?.toFixed(2)}
                                                </Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="xs" color="gray.500">{t('items')}</Text>
                                                <Text fontSize="xl" fontWeight="bold">
                                                    {order.orderItems?.length || 0}
                                                </Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="xs" color="gray.500">{t('paymentMethod')}</Text>
                                                <Text fontSize="md">{order.paymentMethod || 'N/A'}</Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="xs" color="gray.500">{t('paymentStatus')}</Text>
                                                <Badge colorScheme={order.isPaid ? 'green' : 'orange'}>
                                                    {order.isPaid ? t('paid') : t('pending')}
                                                </Badge>
                                            </Box>
                                        </SimpleGrid>
                                        
                                        <Divider />
                                        
                                        {/* Order Items Preview */}
                                        <Flex mt={4} gap={3} align="center" flexWrap="wrap">
                                            {order.orderItems?.slice(0, 3).map((item, idx) => (
                                                <HStack key={idx} spacing={2}>
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        boxSize="40px"
                                                        objectFit="cover"
                                                        borderRadius="md"
                                                        fallbackSrc="/images/placeholder.png"
                                                    />
                                                    <Text fontSize="sm" noOfLines={1}>
                                                        {item.name} x{item.qty}
                                                    </Text>
                                                </HStack>
                                            ))}
                                            {order.orderItems?.length > 3 && (
                                                <Text fontSize="sm" color="gray.500">
                                                    +{order.orderItems.length - 3} more items
                                                </Text>
                                            )}
                                        </Flex>
                                    </Box>
                                </Box>
                            );
                        })}
                    </VStack>
                )}
            </Box>
            
            {/* Order Details Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Order Details
                        <Text fontSize="sm" fontWeight="normal" color="gray.500">
                            #{selectedOrder?._id?.slice(-8).toUpperCase()}
                        </Text>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {orderLoading ? (
                            <Flex justify="center" py={8}>
                                <Spinner />
                            </Flex>
                        ) : orderDetails ? (
                            <VStack spacing={6} align="stretch">
                                {/* Status */}
                                <Flex justify="space-between" align="center">
                                    <Badge
                                        colorScheme={getStatusColor(orderDetails.status)}
                                        fontSize="md"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                    >
                                        {getStatusText(orderDetails.status)}
                                    </Badge>
                                    <Text fontSize="sm" color="gray.500">
                                        {new Date(orderDetails.createdAt).toLocaleString()}
                                    </Text>
                                </Flex>
                                
                                <Divider />
                                
                                {/* Order Items */}
                                <Box>
                                    <Heading size="sm" mb={3}>Order Items</Heading>
                                    <VStack spacing={3} align="stretch">
                                        {orderDetails.orderItems?.map((item, idx) => (
                                            <Flex key={idx} gap={3} align="center">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    boxSize="60px"
                                                    objectFit="cover"
                                                    borderRadius="md"
                                                    fallbackSrc="/images/placeholder.png"
                                                />
                                                <Box flex={1}>
                                                    <Text fontWeight="medium">{item.name}</Text>
                                                    <Text fontSize="sm" color="gray.500">
                                                        Qty: {item.qty} × ${item.price}
                                                    </Text>
                                                </Box>
                                                <Text fontWeight="bold">
                                                    ${(item.qty * item.price).toFixed(2)}
                                                </Text>
                                            </Flex>
                                        ))}
                                    </VStack>
                                </Box>
                                
                                <Divider />
                                
                                {/* Shipping Address */}
                                <Box>
                                    <Heading size="sm" mb={3}>
                                        <Icon as={FiMapPin} mr={2} />
                                        Shipping Address
                                    </Heading>
                                    <Text>{orderDetails.shippingAddress?.address}</Text>
                                    <Text>
                                        {orderDetails.shippingAddress?.city}, {orderDetails.shippingAddress?.postalCode}
                                    </Text>
                                    <Text>{orderDetails.shippingAddress?.country}</Text>
                                </Box>
                                
                                <Divider />
                                
                                {/* Payment Info */}
                                <Box>
                                    <Heading size="sm" mb={3}>
                                        <Icon as={FiCreditCard} mr={2} />
                                        Payment Information
                                    </Heading>
                                    <Text>Method: {orderDetails.paymentMethod}</Text>
                                    <Text>Status: {orderDetails.isPaid ? 'Paid' : 'Pending'}</Text>
                                    {orderDetails.paidAt && (
                                        <Text fontSize="sm" color="gray.500">
                                            Paid on: {new Date(orderDetails.paidAt).toLocaleString()}
                                        </Text>
                                    )}
                                </Box>
                                
                                <Divider />
                                
                                {/* Order Summary */}
                                <Box>
                                    <Heading size="sm" mb={3}>Order Summary</Heading>
                                    <VStack spacing={2} align="stretch">
                                        <Flex justify="space-between">
                                            <Text>Subtotal</Text>
                                            <Text>${orderDetails.itemsPrice?.toFixed(2)}</Text>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <Text>Shipping</Text>
                                            <Text>${orderDetails.shippingPrice?.toFixed(2)}</Text>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <Text>Tax</Text>
                                            <Text>${orderDetails.taxPrice?.toFixed(2)}</Text>
                                        </Flex>
                                        <Divider />
                                        <Flex justify="space-between" fontWeight="bold" fontSize="lg">
                                            <Text>Total</Text>
                                            <Text color="teal.500">${orderDetails.totalPrice?.toFixed(2)}</Text>
                                        </Flex>
                                    </VStack>
                                </Box>
                            </VStack>
                        ) : null}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default OrdersPage;