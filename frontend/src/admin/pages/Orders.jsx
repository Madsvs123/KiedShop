import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, Textarea, Select, useToast, Flex, IconButton, Badge, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, AlertDialogCloseButton, Tag, Divider, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Alert, AlertIcon } from '@chakra-ui/react';
import { FiEye, FiSearch, FiTruck, FiCreditCard, FiCheckCircle, FiXCircle, FiPackage, FiUser, FiMapPin, FiDollarSign } from 'react-icons/fi';
import { getOrders, updateOrderToDelivered } from '../services/api';

const AdminOrders = () => {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.language === 'ar';
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
            const response = await getOrders();
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch orders';
            if (err.response?.status === 429) {
                setError(`Too many requests. Please try again in a few minutes. ${errorMessage}`);
            } else {
                setError(errorMessage);
            }
            setLoading(false);
        }
    };

    const handleMarkAsDelivered = async (orderId) => {
        try {
            await updateOrderToDelivered(orderId);
            toast({
                title: t('orderUpdated'),
                description: t('orderMarkedDelivered'),
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            fetchOrders();
        } catch (err) {
            toast({
                title: t('error'),
                description: err.response?.data?.message || t('failedToUpdateOrder'),
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    const getOrderStatusColor = (order) => {
        if (order.isDelivered) return 'green';
        if (order.isPaid) return 'blue';
        return 'gray';
    };

    const getPaymentStatusColor = (order) => {
        return order.isPaid ? 'green' : 'red';
    };

    const calculateTotalRevenue = () => {
        return orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    };

    const calculatePaidRevenue = () => {
        return orders.reduce((sum, order) => sum + (order.isPaid ? (order.totalPrice || 0) : 0), 0);
    };

    const calculatePendingRevenue = () => {
        return orders.reduce((sum, order) => sum + (!order.isPaid ? (order.totalPrice || 0) : 0), 0);
    };

    // Filter orders based on search term and filters
    const filteredOrders = orders.filter(order => {
        const matchesSearch = (
            order._id.includes(searchTerm) ||
            (order.user && order.user.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.user && order.user.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'paid' && order.isPaid) ||
            (statusFilter === 'unpaid' && !order.isPaid) ||
            (statusFilter === 'delivered' && order.isDelivered) ||
            (statusFilter === 'undelivered' && !order.isDelivered);

        const matchesPayment = paymentFilter === 'all' ||
            (paymentFilter === 'paid' && order.isPaid) ||
            (paymentFilter === 'unpaid' && !order.isPaid);

        return matchesSearch && matchesStatus && matchesPayment;
    });

    // Pagination logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <Box p={6}>
                <Heading as="h2" size="xl" mb={6}>{t('orderManagement')}</Heading>
                <Text>{t('loadingOrders')}</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={6}>
                <Heading as="h2" size="xl" mb={6}>{t('orderManagement')}</Heading>
                <Alert status="error">
                    <AlertIcon />
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box p={6}>
            <Heading as="h2" size="xl" mb={6}>{t('orderManagement')}</Heading>

            {/* Order statistics */}
            <Flex mb={6} wrap="wrap" gap={4}>
                <Box bg="blue.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t('totalOrders')}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{orders.length}</Text>
                </Box>
                <Box bg="green.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t('totalRevenue')}</Text>
                    <Text fontSize="2xl" fontWeight="bold">${calculateTotalRevenue().toFixed(2)}</Text>
                </Box>
                <Box bg="purple.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t('paidRevenue')}</Text>
                    <Text fontSize="2xl" fontWeight="bold">${calculatePaidRevenue().toFixed(2)}</Text>
                </Box>
                <Box bg="orange.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t('pendingRevenue')}</Text>
                    <Text fontSize="2xl" fontWeight="bold">${calculatePendingRevenue().toFixed(2)}</Text>
                </Box>
                <Box bg="teal.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t('paidOrders')}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{orders.filter(o => o.isPaid).length}</Text>
                </Box>
                <Box bg="pink.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t('deliveredOrders')}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{orders.filter(o => o.isDelivered).length}</Text>
                </Box>
            </Flex>

            {/* Filters */}
            <Flex mb={6} wrap="wrap" gap={4}>
                <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>{t('statusFilter')}</Text>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="sm"
                        w="200px"
                    >
                        <option value="all">{t('allOrders')}</option>
                        <option value="paid">{t('paid')}</option>
                        <option value="unpaid">{t('unpaid')}</option>
                        <option value="delivered">{t('delivered')}</option>
                        <option value="undelivered">{t('undelivered')}</option>
                    </Select>
                </Box>
                <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>{t('paymentFilter')}</Text>
                    <Select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        size="sm"
                        w="200px"
                    >
                        <option value="all">{t('allPayments')}</option>
                        <option value="paid">{t('paid')}</option>
                        <option value="unpaid">{t('unpaid')}</option>
                    </Select>
                </Box>
                <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>{t('search')}</Text>
                    <Input
                        placeholder={t('searchByIdNameEmail')}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        size="sm"
                        w="300px"
                    />
                </Box>
            </Flex>

            {/* Orders table */}
            <Box bg="white" borderRadius="lg" boxShadow="md" overflow="hidden" mb={6}>
                <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>{t('orderId')}</Th>
                            <Th>{t('customer')}</Th>
                            <Th>{t('date')}</Th>
                            <Th>{t('items')}</Th>
                            <Th>{t('total')}</Th>
                            <Th>{t('payment')}</Th>
                            <Th>{t('delivery')}</Th>
                            <Th>{t('actions')}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentOrders.length > 0 ? (
                            currentOrders.map((order) => (
                                <Tr key={order._id} _hover={{ bg: 'gray.50' }}>
                                    <Td>
                                        <Text fontWeight="medium">{order._id.substring(0, 8)}...</Text>
                                        <Text fontSize="xs" color="gray.500">{formatDate(order.createdAt)}</Text>
                                    </Td>
                                    <Td>
                                        <Text fontWeight="medium">{order.user?.name || 'N/A'}</Text>
                                        <Text fontSize="xs" color="gray.500">{order.user?.email || 'N/A'}</Text>
                                    </Td>
                                    <Td>
                                        <Text>{formatDate(order.createdAt)}</Text>
                                    </Td>
                                    <Td>
                                        {t('itemsCount', { count: (order.orderItems && order.orderItems.length) || 0 })}
                                        <Text fontSize="xs" color="gray.500">${(order.itemsPrice || 0).toFixed(2)}</Text>
                                    </Td>
                                    <Td>
                                        <Text fontWeight="medium">${(order.totalPrice || 0).toFixed(2)}</Text>
                                        <Text fontSize="xs" color="gray.500">
                                            (${(order.shippingPrice || 0).toFixed(2)} shipping + ${(order.taxPrice || 0).toFixed(2)} tax)
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Tag colorScheme={getPaymentStatusColor(order)}>
                                            {order.isPaid ? t('paid') : t('pending')}
                                        </Tag>
                                        {order.isPaid && order.paidAt && (
                                            <Text fontSize="xs" color="gray.500">
                                                {formatDate(order.paidAt)}
                                            </Text>
                                        )}
                                    </Td>
                                    <Td>
                                        <Tag colorScheme={getOrderStatusColor(order)}>
                                            {order.isDelivered ? t('delivered') : order.isPaid ? t('processing') : t('pending')}
                                        </Tag>
                                        {order.isDelivered && order.deliveredAt && (
                                            <Text fontSize="xs" color="gray.500">
                                                {formatDate(order.deliveredAt)}
                                            </Text>
                                        )}
                                    </Td>
                                    <Td>
                                        <Flex>
                                            <IconButton
                                                icon={<FiEye />}
                                                aria-label={t('viewOrder')}
                                                size="sm"
                                                mr={isRtl ? 0 : 2}
                                                ml={isRtl ? 2 : 0}
                                                variant="ghost"
                                                color="blue.500"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    onOpen();
                                                }}
                                            />
                                            {!order.isDelivered && order.isPaid && (
                                                <IconButton
                                                    icon={<FiTruck />}
                                                    aria-label={t('markAsDelivered')}
                                                    size="sm"
                                                    variant="ghost"
                                                    color="green.500"
                                                    onClick={() => handleMarkAsDelivered(order._id)}
                                                />
                                            )}
                                        </Flex>
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={8} textAlign="center" py={10}>
                                    <Text color="gray.500">{t('noOrdersFound')}</Text>
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Flex justifyContent="center" mb={6}>
                    <Flex>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                            <Button
                                key={number}
                                mx={1}
                                size="sm"
                                onClick={() => paginate(number)}
                                colorScheme={currentPage === number ? 'blue' : 'gray'}
                                variant={currentPage === number ? 'solid' : 'outline'}
                            >
                                {number}
                            </Button>
                        ))}
                    </Flex>
                </Flex>
            )}

            {/* Order Detail Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t('orderDetails')}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedOrder && (
                            <Box>
                                {/* Order Info */}
                                <Box mb={6}>
                                    <Heading size="md" mb={4}>{t('orderInformation')}</Heading>
                                    <Flex wrap="wrap" gap={4} mb={4}>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">{t('orderId')}</Text>
                                            <Text fontWeight="medium">{selectedOrder._id}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">{t('date')}</Text>
                                            <Text fontWeight="medium">{formatDate(selectedOrder.createdAt)}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">{t('status')}</Text>
                                            <Tag colorScheme={getOrderStatusColor(selectedOrder)}>
                                                {selectedOrder.isDelivered ? t('delivered') : selectedOrder.isPaid ? t('processing') : t('pending')}
                                            </Tag>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">{t('payment')}</Text>
                                            <Tag colorScheme={getPaymentStatusColor(selectedOrder)}>
                                                {selectedOrder.isPaid ? t('paid') : t('pending')}
                                            </Tag>
                                        </Box>
                                    </Flex>
                                </Box>

                                <Divider mb={6} />

                                {/* Customer Info */}
                                <Box mb={6}>
                                    <Heading size="md" mb={4}>{t('customerInformation')}</Heading>
                                    <Flex wrap="wrap" gap={4}>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">{t('name')}</Text>
                                            <Text fontWeight="medium">{selectedOrder.user?.name || 'N/A'}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">{t('email')}</Text>
                                            <Text fontWeight="medium">{selectedOrder.user?.email || 'N/A'}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500">{t('userId')}</Text>
                                            <Text fontWeight="medium">{selectedOrder.user?._id || 'N/A'}</Text>
                                        </Box>
                                    </Flex>
                                </Box>

                                <Divider mb={6} />

                                {/* Shipping Address */}
                                <Box mb={6}>
                                    <Heading size="md" mb={4}>{t("shippingAddress")}</Heading>
                                    <Box>
                                        <Text fontSize="sm" color="gray.500">{t("address")}</Text>
                                        <Text fontWeight="medium" mb={2}>{selectedOrder.shippingAddress?.address}</Text>
                                        <Text fontSize="sm" color="gray.500">{t("city")}</Text>
                                        <Text fontWeight="medium" mb={2}>{selectedOrder.shippingAddress?.city}</Text>
                                        <Text fontSize="sm" color="gray.500">{t("postalCode")}</Text>
                                        <Text fontWeight="medium" mb={2}>{selectedOrder.shippingAddress?.postalCode}</Text>
                                        <Text fontSize="sm" color="gray.500">{t("country")}</Text>
                                        <Text fontWeight="medium">{selectedOrder.shippingAddress?.country}</Text>
                                    </Box>
                                </Box>

                                <Divider mb={6} />

                                {/* Payment Method */}
                                <Box mb={6}>
                                    <Heading size="md" mb={4}>{t("paymentMethod")}</Heading>
                                    <Flex alignItems="center">
                                        <Text fontWeight="medium" mr={isRtl ? 0 : 2} ml={isRtl ? 2 : 0}>{selectedOrder.paymentMethod}</Text>
                                            {selectedOrder.isPaid && (
                                            <Tag colorScheme="green" ml={2}>
                                                {t('paidOn', { date: formatDate(selectedOrder.paidAt) })}
                                            </Tag>
                                        )}
                                    </Flex>
                                </Box>

                                <Divider mb={6} />

                                {/* Order Items */}
                                <Box mb={6}>
                                    <Heading size="md" mb={4}>{t('orderItems', { count: selectedOrder.orderItems.length })}</Heading>
                                    <Accordion allowMultiple>
                                        {selectedOrder.orderItems.map((item, index) => (
                                            <AccordionItem key={index} mb={2} border="1px" borderColor="gray.200" borderRadius="md">
                                                <AccordionButton>
                                                    <Box flex="1" textAlign="left">
                                                        <Flex justifyContent="space-between" alignItems="center">
                                                            <Text fontWeight="medium">{item.name}</Text>
                                                            <Text>${item.price.toFixed(2)} × {item.qty}</Text>
                                                        </Flex>
                                                    </Box>
                                                    <AccordionIcon />
                                                </AccordionButton>
                                                <AccordionPanel pb={4}>
                                                    <Flex justifyContent="space-between">
                                                        <Box>
                                                                <Text fontSize="sm" color="gray.500">{t('productId')}</Text>
                                                                <Text fontSize="sm">{item.product.substring(0, 8)}...</Text>
                                                            </Box>
                                                            <Box>
                                                                <Text fontSize="sm" color="gray.500">{t('total')}</Text>
                                                                <Text fontSize="sm" fontWeight="medium">${(item.price * item.qty).toFixed(2)}</Text>
                                                            </Box>
                                                    </Flex>
                                                </AccordionPanel>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </Box>

                                <Divider mb={6} />

                                {/* Order Summary */}
                                <Box mb={6}>
                                    <Heading size="md" mb={4}>{t('orderSummary')}</Heading>
                                    <Flex direction="column" gap={2}>
                                        <Flex justifyContent="space-between">
                                            <Text>{t('itemsTotal')}</Text>
                                            <Text fontWeight="medium">${(selectedOrder.itemsPrice || 0).toFixed(2)}</Text>
                                        </Flex>
                                        <Flex justifyContent="space-between">
                                            <Text>{t('shipping')}</Text>
                                            <Text fontWeight="medium">${(selectedOrder.shippingPrice || 0).toFixed(2)}</Text>
                                        </Flex>
                                        <Flex justifyContent="space-between">
                                            <Text>{t('tax')}</Text>
                                            <Text fontWeight="medium">${(selectedOrder.taxPrice || 0).toFixed(2)}</Text>
                                        </Flex>
                                        <Divider my={2} />
                                        <Flex justifyContent="space-between" fontSize="lg" fontWeight="bold">
                                            <Text>{t('total')}</Text>
                                            <Text>${(selectedOrder.totalPrice || 0).toFixed(2)}</Text>
                                        </Flex>
                                    </Flex>
                                </Box>

                                {/* Action Buttons */}
                                {!selectedOrder.isDelivered && selectedOrder.isPaid && (
                                    <Button
                                        colorScheme="green"
                                        leftIcon={<FiTruck />}
                                        onClick={() => {
                                            handleMarkAsDelivered(selectedOrder._id);
                                            onClose();
                                        }}
                                        w="full"
                                    >
                                        {t('markAsDelivered')}
                                    </Button>
                                )}
                            </Box>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose} variant="ghost">{t("close")}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default AdminOrders;
