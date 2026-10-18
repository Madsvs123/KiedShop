import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box, Heading, Text, SimpleGrid, Spinner, Alert, AlertIcon,
    Button, useToast, Flex, Image, Icon, HStack, VStack, Badge,
    useColorModeValue, Divider, IconButton
} from '@chakra-ui/react';
import { FiArrowLeft, FiDownload, FiMapPin, FiCreditCard, FiPackage, FiPrinter, FiPhone } from 'react-icons/fi';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../services/api';
import { InvoicePDF } from '../components/InvoicePDF';

const OrderDetailPage = () => {
    const { t } = useTranslation('pages');
    const { id } = useParams();
    const navigate = useNavigate();
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const itemBg = useColorModeValue('gray.50', 'gray.700');

    const { data: order, isLoading, error } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const res = await getOrderById(id);
            return res.data;
        },
        enabled: !!id
    });

    const getStatusColor = (s) => ({
        pending: 'orange', processing: 'blue', shipped: 'purple',
        delivered: 'green', cancelled: 'red'
    }[s] || 'gray');

    if (isLoading) {
        return <Flex justify="center" align="center" minH="400px"><Spinner size="xl" /></Flex>;
    }

    if (error || !order) {
        return (
            <Alert status="error" borderRadius="lg" m={4}>
                <AlertIcon /> Order not found
                <Button as={Link} to="/orders" size="sm" ml={4}>{t('backToOrders')}</Button>
            </Alert>
        );
    }

    return (
        <Box bg={bgColor} minH="100vh" py={8}>
            <Box maxW="1000px" mx="auto" px={4}>
                <Flex align="center" gap={4} mb={6} flexWrap="wrap">
                    <IconButton icon={<FiArrowLeft />} variant="ghost" onClick={() => navigate('/orders')} aria-label="Back" />
                    <Heading size="lg">{t('order')} #{order._id?.slice(-8).toUpperCase()}</Heading>
                    <Badge colorScheme={getStatusColor(order.status)} fontSize="md" px={3} py={1} borderRadius="full">
                        {order.status || order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : 'Pending'}
                    </Badge>
                    <Box ml="auto">
                        <PDFDownloadLink
                            document={<InvoicePDF order={order} />}
                            fileName={`invoice-${order._id?.slice(-8).toUpperCase()}.pdf`}
                        >
                            {({ loading }) => (
                                <Button
                                    leftIcon={<FiDownload />}
                                    colorScheme="teal"
                                    size="sm"
                                    isLoading={loading}
                                >
                                    {loading ? t('generating') : t('downloadInvoice')}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </Box>
                </Flex>

                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
                    {/* Order Items */}
                    <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="sm" gridColumn={{ lg: 'span 2' }}>
                        <Heading size="md" mb={4}>{t('items')}</Heading>
                        <VStack spacing={4} align="stretch">
                            {order.orderItems?.map((item, idx) => (
                                <Flex key={idx} gap={4} p={3} bg={itemBg} borderRadius="md">
                                    <Image
                                        src={item.image || ''}
                                        alt={item.name}
                                        boxSize="70px"
                                        objectFit="contain"
                                        borderRadius="md"
                                        fallback={
                                            <Box boxSize="70px" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                                                <Icon as={FiPackage} opacity={0.3} />
                                            </Box>
                                        }
                                    />
                                    <Box flex={1}>
                                        <Text fontWeight="semibold">{item.name}</Text>
                                        <Text fontSize="sm" color="gray.500">
                                            ${item.price} × {item.qty}
                                        </Text>
                                    </Box>
                                    <Text fontWeight="bold" fontSize="lg">
                                        ${(item.price * item.qty).toFixed(2)}
                                    </Text>
                                </Flex>
                            ))}
                        </VStack>
                    </Box>

                    {/* Summary */}
                    <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="sm" alignSelf="start" position="sticky" top="20px">
                        <Heading size="md" mb={4}>{t('summary')}</Heading>
                        <VStack spacing={3} align="stretch">
                            <Flex justify="space-between">
                                <Text color="gray.500">{t('subtotal')}</Text>
                                <Text>${order.itemsPrice?.toFixed(2)}</Text>
                            </Flex>
                            <Flex justify="space-between">
                                <Text color="gray.500">{t('shipping')}</Text>
                                <Text>{order.shippingPrice === 0 ? t('free') : `$${order.shippingPrice?.toFixed(2)}`}</Text>
                            </Flex>
                            <Flex justify="space-between">
                                <Text color="gray.500">{t('tax')}</Text>
                                <Text>${order.taxPrice?.toFixed(2)}</Text>
                            </Flex>
                            <Divider />
                            <Flex justify="space-between" fontWeight="bold" fontSize="lg">
                                <Text>{t('total')}</Text>
                                <Text color="teal.500">${order.totalPrice?.toFixed(2)}</Text>
                            </Flex>
                        </VStack>

                        {order.discountAmount > 0 && (
                            <Flex justify="space-between" color="green.600">
                                <Text>Discount {order.couponCode && `(${order.couponCode})`}</Text>
                                <Text>-${order.discountAmount?.toFixed(2)}</Text>
                            </Flex>
                        )}

                        <Divider my={4} />

                        <VStack spacing={3} align="stretch">
                            <Box>
                                <HStack mb={1}>
                                    <Icon as={FiMapPin} color="gray.400" />
                                    <Text fontSize="sm" fontWeight="semibold">{t('shipping')}</Text>
                                </HStack>
                                <Text fontSize="sm">{order.shippingAddress?.address}</Text>
                                <Text fontSize="sm">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</Text>
                                <Text fontSize="sm">{order.shippingAddress?.country}</Text>
                                {order.shippingAddress?.phone && (
                                    <Text fontSize="sm" color="gray.500">
                                        <Icon as={FiPhone} mr={1} verticalAlign="middle" />
                                        {order.shippingAddress.phone}
                                    </Text>
                                )}
                            </Box>
                            <Box>
                                <HStack mb={1}>
                                    <Icon as={FiCreditCard} color="gray.400" />
                                    <Text fontSize="sm" fontWeight="semibold">{t('payment')}</Text>
                                </HStack>
                                <Text fontSize="sm">{order.paymentMethod || 'N/A'}</Text>
                                <Badge colorScheme={order.isPaid ? 'green' : 'orange'} fontSize="xs">
                                    {order.isPaid ? t('paid') : t('unpaid')}
                                </Badge>
                                {order.paidAt && (
                                    <Text fontSize="xs" color="gray.500">
                                        {new Date(order.paidAt).toLocaleString()}
                                    </Text>
                                )}
                            </Box>
                        </VStack>

                        <Divider my={4} />

                        <PDFDownloadLink
                            document={<InvoicePDF order={order} />}
                            fileName={`invoice-${order._id?.slice(-8).toUpperCase()}.pdf`}
                        >
                            {({ loading }) => (
                                <Button
                                    leftIcon={<FiPrinter />}
                                    colorScheme="teal"
                                    variant="outline"
                                    size="sm"
                                    w="full"
                                    isLoading={loading}
                                >
                                    {loading ? t('generating') : t('printInvoice')}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </Box>
                </SimpleGrid>
            </Box>
        </Box>
    );
};

export default OrderDetailPage;
