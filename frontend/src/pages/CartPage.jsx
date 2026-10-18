import React, { useState, useMemo } from 'react';
import {
    Box, Flex, Heading, Text, Image, Button, useColorModeValue,
    Table, Thead, Tbody, Tr, Th, Td, Input, HStack, IconButton,
    Divider, useToast, Alert, AlertIcon, AlertTitle, AlertDescription,
    CloseButton, VStack, Progress, Badge, Icon, Spinner
} from '@chakra-ui/react';
import {
    FiTrash2, FiPlus, FiMinus, FiShoppingCart, FiCreditCard,
    FiPercent, FiTruck, FiShield
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateCartItem, clearCart, applyCoupon, removeCoupon } from '../store/slices/cartSlice';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { validateCoupon } from '../services/api';

const CartPage = () => {
    const { t } = useTranslation("pages");
    const { cartItems = [], coupon: reduxCoupon } = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    const toast = useToast();
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [showFreeShippingAlert, setShowFreeShippingAlert] = useState(true);

    const bgColor = useColorModeValue('white', 'gray.800');
    const itemBg = useColorModeValue('gray.50', 'gray.700');

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const discountAmount = reduxCoupon ? parseFloat(reduxCoupon.discountAmount) : 0;
    const total = subtotal + shipping + tax - discountAmount;

    const handleUpdateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        dispatch(updateCartItem({ id, quantity: newQuantity }));
    };

    const handleRemoveItem = (id) => {
        dispatch(removeFromCart(id));
        toast({ title: t('itemRemoved') || 'Item removed', status: 'info', duration: 3000, isClosable: true });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        setCouponError('');

        try {
            const response = await validateCoupon({ code: couponCode, totalAmount: subtotal });
            const data = response.data;
            dispatch(applyCoupon({
                code: couponCode,
                discountAmount: data.discountAmount,
                discountValue: data.discountValue,
                discountType: data.discountType
            }));
            toast({
                title: t('couponApplied') || 'Coupon applied',
                description: `${data.discountValue}${data.discountType === 'percentage' ? '%' : '$'} off`,
                status: 'success', duration: 3000
            });
            setCouponCode('');
        } catch (error) {
            const msg = error.response?.data?.message || t('invalidCoupon') || 'Invalid coupon code';
            setCouponError(msg);
            toast({ title: t('invalidCoupon') || 'Invalid coupon', description: msg, status: 'error', duration: 3000 });
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        dispatch(removeCoupon());
        toast({ title: t('couponRemoved') || 'Coupon removed', status: 'info', duration: 2000 });
    };

    const handleClearCart = () => {
        if (window.confirm(t('clearCartConfirm') || 'Clear cart?')) {
            dispatch(clearCart());
            toast({ title: t('cartCleared') || 'Cart cleared', status: 'info', duration: 3000 });
        }
    };

    const freeShippingProgress = Math.min((subtotal / 50) * 100, 100);

    if (cartItems.length === 0) {
        return (
            <Flex justify="center" align="center" minH="400px" direction="column">
                <Icon as={FiShoppingCart} boxSize={16} opacity={0.3} />
                <Heading size="lg" mt={4}>{t("yourCartIsEmpty")}</Heading>
                <Text mt={2} color="gray.500">{t("cartEmptyDesc")}</Text>
                <Button as={Link} to="/products" colorScheme="teal" mt={6} size="lg">
                    Continue Shopping
                </Button>
            </Flex>
        );
    }

    return (
        <Box bg={bgColor} py={8} minH="100vh">
            <Box maxW="1200px" mx="auto" px={4}>
                <Heading size="xl" mb={6} display="flex" alignItems="center" gap={3}>
                    <Icon as={FiShoppingCart} />
                    {t("shoppingCart")}
                    <Badge colorScheme="teal" borderRadius="full" px={3} py={1} fontSize="sm">
                        {cartItems.length} {t("items")}
                    </Badge>
                </Heading>

                <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
                    {/* Cart {t("items")} */}
                    <Box flex={2}>
                        {showFreeShippingAlert && subtotal < 50 && (
                            <Alert status="info" mb={4} borderRadius="lg">
                                <Icon as={FiTruck} />
                                <Box flex={1} ml={3}>
                                    <AlertTitle fontSize="sm">{t("freeShippingAvailable")}</AlertTitle>
                                    <AlertDescription fontSize="sm">
                                        Add ${(50 - subtotal).toFixed(2)} more to qualify
                                    </AlertDescription>
                                    <Progress value={freeShippingProgress} size="xs" mt={2} colorScheme="teal" borderRadius="full" />
                                </Box>
                                <CloseButton onClick={() => setShowFreeShippingAlert(false)} />
                            </Alert>
                        )}

                        <Box overflowX="auto">
                            <Table variant="simple" size="md">
                                <Thead>
                                    <Tr>
                                        <Th>{t("product")}</Th>
                                        <Th>{t("price")}</Th>
                                        <Th>{t("qty")}</Th>
                                        <Th>{t("total")}</Th>
                                        <Th></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {cartItems.map((item) => (
                                        <Tr key={item.product}>
                                            <Td>
                                                <Flex alignItems="center" gap={3}>
                                                    <Image
                                                        src={item.image || ''}
                                                        alt={item.name}
                                                        boxSize="60px"
                                                        objectFit="contain"
                                                        borderRadius="md"
                                                        fallback={
                                                            <Box boxSize="60px" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                                                                <Icon as={FiShoppingCart} opacity={0.3} />
                                                            </Box>
                                                        }
                                                    />
                                                    <Box>
                                                        <Text fontWeight="medium" noOfLines={1}>{item.name}</Text>
                                                        <Text fontSize="xs" color="gray.500">ID: {item.product.slice(-6).toUpperCase()}</Text>
                                                    </Box>
                                                </Flex>
                                            </Td>
                                            <Td>${item.price.toFixed(2)}</Td>
                                            <Td>
                                                <HStack>
                                                    <IconButton icon={<FiMinus />} size="xs" onClick={() => handleUpdateQuantity(item.product, item.qty - 1)} isDisabled={item.qty <= 1} aria-label="Decrease" />
                                                    <Input value={item.qty} onChange={(e) => handleUpdateQuantity(item.product, parseInt(e.target.value) || 1)} textAlign="center" size="sm" w="50px" />
                                                    <IconButton icon={<FiPlus />} size="xs" onClick={() => handleUpdateQuantity(item.product, item.qty + 1)} isDisabled={item.qty >= (item.countInStock || 99)} aria-label="Increase" />
                                                </HStack>
                                            </Td>
                                            <Td fontWeight="semibold" color="teal.500">${(item.price * item.qty).toFixed(2)}</Td>
                                            <Td>
                                                <IconButton icon={<FiTrash2 />} aria-label={t('remove')} colorScheme="red" variant="ghost" size="sm" onClick={() => handleRemoveItem(item.product)} />
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>

                        <Flex justify="space-between" mt={4}>
                            <Button as={Link} to="/products" variant="outline" leftIcon={<FiShoppingCart />} size="sm">
                                Continue Shopping
                            </Button>
                            <Button variant="ghost" colorScheme="red" size="sm" onClick={handleClearCart}>
                                {t("clearCart")}
                            </Button>
                        </Flex>
                    </Box>

                    {/* {t("orderSummary")} */}
                    <Box flex={1}>
                        <Box bg={itemBg} p={6} borderRadius="lg" boxShadow="md" position="sticky" top={20}>
                            <Heading size="md" mb={6}>{t("orderSummary")}</Heading>

                            <VStack spacing={3} align="stretch" mb={6}>
                                <Flex justify="space-between">
                                    <Text color="gray.600">{`${cartItems.reduce((a, i) => a + i.qty, 0)} ${t('items')}`}</Text>
                                    <Text fontWeight="semibold">${subtotal.toFixed(2)}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <HStack spacing={1}>
                                        <Icon as={FiTruck} size={14} />
                                        <Text>Shipping</Text>
                                    </HStack>
                                    <Text>{shipping === 0 ? t('free') : `$${shipping.toFixed(2)}`}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <HStack spacing={1}>
                                        <Icon as={FiPercent} size={14} />
                                        <Text>{t("tax")}</Text>
                                    </HStack>
                                    <Text>${tax.toFixed(2)}</Text>
                                </Flex>
                                {reduxCoupon && (
                                    <Flex justify="space-between" color="green.600">
                                        <Text>Discount ({reduxCoupon.discountValue}{reduxCoupon.discountType === 'percentage' ? '%' : '$'})</Text>
                                        <Text>-${discountAmount.toFixed(2)}</Text>
                                    </Flex>
                                )}
                                <Divider />
                                <Flex justify="space-between" fontSize="lg" fontWeight="bold">
                                    <Text>{t("total")}</Text>
                                    <Text fontSize="2xl" color="teal.500">${total.toFixed(2)}</Text>
                                </Flex>
                            </VStack>

                            {/* Coupon */}
                            <VStack spacing={2} mb={6}>
                                {reduxCoupon ? (
                                    <Alert status="success" borderRadius="md" size="sm">
                                        <AlertIcon />
                                        <Box flex={1}>
                                            <Text fontSize="sm" fontWeight="medium">Code: {reduxCoupon.code}</Text>
                                            <Text fontSize="xs">{reduxCoupon.discountValue}{reduxCoupon.discountType === 'percentage' ? '%' : '$'} off</Text>
                                        </Box>
                                        <Button size="xs" variant="ghost" onClick={handleRemoveCoupon}>{t("remove")}</Button>
                                    </Alert>
                                ) : (
                                    <>
                                        <Flex gap={2} w="full">
                                            <Input
                                                placeholder={t("couponCode")}
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                size="sm"
                                                isInvalid={!!couponError}
                                            />
                                            <Button size="sm" colorScheme="teal" onClick={handleApplyCoupon} isLoading={isApplyingCoupon} isDisabled={!couponCode}>
                                                {t("apply")}
                                            </Button>
                                        </Flex>
                                        {couponError && <Text fontSize="xs" color="red.500">{couponError}</Text>}
                                    </>
                                )}
                            </VStack>

                            <Button as={Link} to="/checkout" colorScheme="teal" size="lg" w="full" leftIcon={<FiCreditCard />} mb={3}
                                _hover={{ transform: 'translateY(-2px)' }} transition="all 0.2s"
                            >
                                {t("proceedToCheckout")}
                            </Button>

                            <HStack spacing={2} justify="center" mt={3}>
                                <Icon as={FiShield} />
                                <Text fontSize="xs" color="gray.500">{t("secureCheckout")}</Text>
                            </HStack>
                        </Box>
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
};

export default CartPage;
