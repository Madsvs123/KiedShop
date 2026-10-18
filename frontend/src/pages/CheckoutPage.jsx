import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Box, Flex, Heading, Text, Button, useColorModeValue, useToast,
    VStack, HStack, Divider, Image, Input, FormControl,
    FormLabel, FormErrorMessage, Radio, RadioGroup,
    Stack, Alert, AlertIcon, Spinner, SimpleGrid, Icon,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, useDisclosure,
    Select, InputGroup, InputLeftElement, Tag, TagLabel, TagCloseButton
} from '@chakra-ui/react';
import {
    FiCheck, FiArrowLeft, FiTruck, FiShield, FiLock,
    FiMapPin, FiPhone, FiHome, FiStar
} from 'react-icons/fi';
import { CountryDropdown } from 'react-country-region-selector';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart, removeCoupon } from '../store/slices/cartSlice';
import { createOrder, validateCoupon, updateUserProfile, getCart, clearCart as clearBackendCart } from '../services/api';

const addressSchema = yup.object({
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    postalCode: yup.string().required('Postal code is required').min(3, 'Must be at least 3 characters'),
    country: yup.string().required('Country is required').min(1, 'Please select a country'),
    phone: yup.string()
        .matches(/^[\d\s\-+()]{7,20}$/, 'Enter a valid phone number')
        .required('Phone number is required'),
}).required();

const steps = [
    { title: 'Information', description: 'Address & contact' },
    { title: 'Shipping', description: 'Delivery method' },
    { title: 'Payment', description: 'Payment method' },
    { title: 'Confirm', description: 'Review order' }
];

const CheckoutPage = () => {
    const { t } = useTranslation("pages");
    const navigate = useNavigate();
    const toast = useToast();
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);
    const { items: cartItems = [], coupon: reduxCoupon } = useSelector((state) => state.cart);
    const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();

    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const savedAddrBg = useColorModeValue('blue.50', 'blue.900');

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [useSaved, setUseSaved] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [orderId, setOrderId] = useState(null);
    const [savingAddress, setSavingAddress] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        trigger,
        reset
    } = useForm({
        resolver: yupResolver(addressSchema),
        mode: 'onChange',
        defaultValues: {
            address: userInfo?.address || '',
            city: userInfo?.city || '',
            postalCode: userInfo?.postalCode || '',
            country: userInfo?.country || '',
            phone: userInfo?.phone || ''
        }
    });

    const watchedCountry = watch('country');

    // Load saved addresses from localStorage (simple approach)
    useEffect(() => {
        const saved = localStorage.getItem('savedAddresses');
        if (saved) {
            try { setSavedAddresses(JSON.parse(saved)); } catch {}
        }
    }, []);

    // Prefill user's own address from profile
    useEffect(() => {
        if (userInfo?.address) setValue('address', userInfo.address);
        if (userInfo?.city) setValue('city', userInfo.city);
        if (userInfo?.postalCode) setValue('postalCode', userInfo.postalCode);
        if (userInfo?.country) setValue('country', userInfo.country);
        if (userInfo?.phone) setValue('phone', userInfo.phone);
    }, [userInfo, setValue]);

    useEffect(() => { if (cartItems.length === 0) navigate('/cart'); }, [cartItems, navigate]);
    useEffect(() => { if (!userInfo) navigate('/login?redirect=checkout'); }, [userInfo, navigate]);

    // ── Calculations ──
    const subtotal = useMemo(() =>
        cartItems.reduce((acc, item) => acc + item.price * item.qty, 0),
        [cartItems]
    );
    const shippingCost = shippingMethod === 'express' ? 15.99 : (subtotal > 50 ? 0 : 9.99);
    const tax = subtotal * 0.08;
    const discountAmount = reduxCoupon ? parseFloat(reduxCoupon.discountAmount) : 0;
    const total = subtotal + shippingCost + tax - discountAmount;

    // ── Coupon ──
    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        setCouponError('');
        try {
            const res = await validateCoupon({ code: couponCode, totalAmount: subtotal });
            const d = res.data;
            dispatch(applyCouponFromCheckout({
                code: couponCode, discountAmount: d.discountAmount,
                discountValue: d.discountValue, discountType: d.discountType
            }));
            toast({ title: 'Coupon applied!', description: `${d.discountValue}${d.discountType === 'percentage' ? '%' : '$'} off`, status: 'success', duration: 3000 });
            setCouponCode('');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid coupon code';
            setCouponError(msg);
            toast({ title: 'Invalid coupon', description: msg, status: 'error', duration: 3000 });
        } finally { setIsApplyingCoupon(false); }
    };

    const handleRemoveCoupon = () => dispatch(removeCoupon());

    // ── Navigation ──
    const handleNext = async () => {
        if (activeStep === 0) {
            const valid = await trigger();
            if (!valid) {
                toast({ title: 'Missing information', description: 'Please fill in all fields', status: 'warning', duration: 3000 });
                return;
            }
        }
        setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handlePrevious = () => setActiveStep(prev => Math.max(prev - 1, 0));

    // ── Save address to localStorage ──
    const saveCurrentAddress = () => {
        const addr = {
            address: watch('address'),
            city: watch('city'),
            postalCode: watch('postalCode'),
            country: watch('country'),
            phone: watch('phone'),
            label: `Address ${savedAddresses.length + 1}`
        };
        const updated = [...savedAddresses, addr];
        setSavedAddresses(updated);
        localStorage.setItem('savedAddresses', JSON.stringify(updated));
        toast({ title: 'Address saved', status: 'success', duration: 2000 });
    };

    const selectSavedAddress = (addr) => {
        setValue('address', addr.address);
        setValue('city', addr.city);
        setValue('postalCode', addr.postalCode);
        setValue('country', addr.country);
        setValue('phone', addr.phone);
        setUseSaved(true);
        toast({ title: 'Address loaded', status: 'info', duration: 2000 });
    };

    const deleteSavedAddress = (index) => {
        const updated = savedAddresses.filter((_, i) => i !== index);
        setSavedAddresses(updated);
        localStorage.setItem('savedAddresses', JSON.stringify(updated));
    };

    // ── Order Creation ──
    const createOrderData = () => ({
        orderItems: cartItems.map(item => ({
            name: item.name, qty: item.qty, image: item.image,
            price: item.price, product: item.product
        })),
        shippingAddress: {
            address: watch('address'),
            city: watch('city'),
            postalCode: watch('postalCode'),
            country: watch('country'),
            phone: watch('phone')
        },
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shippingCost,
        totalPrice: total,
        couponCode: reduxCoupon?.code || null,
        discountAmount: reduxCoupon ? parseFloat(reduxCoupon.discountAmount) : 0
    });

    const handleCreateOrder = async () => {
        setLoading(true);
        try {
            const orderData = createOrderData();
            const res = await createOrder(orderData);
            setOrderId(res.data._id);
            onPaymentOpen();
        } catch (err) {
            toast({ title: 'Order creation failed', description: err.response?.data?.message || 'Failed to create order', status: 'error', duration: 3000 });
        } finally { setLoading(false); }
    };

    const handlePaymentSuccess = async () => {
        dispatch(clearCart());
        try { await clearBackendCart(); } catch (e) { /* ignore */ }
        onPaymentClose();
        navigate(`/order-confirmation/${orderId}`);
    };

    // ── Step Renderers ──

    const renderStepIndicator = () => (
        <Flex mb={8} justify="center" flexWrap="wrap">
            {steps.map((step, index) => (
                <Flex key={index} align="center" flex={1} minW="150px">
                    <Flex direction="column" align="center" flex={1}>
                        <Box w="40px" h="40px" borderRadius="full"
                            bg={index <= activeStep ? 'teal.500' : 'gray.200'}
                            color={index <= activeStep ? 'white' : 'gray.500'}
                            display="flex" alignItems="center" justifyContent="center"
                            fontWeight="bold"
                        >
                            {index < activeStep ? <FiCheck /> : index + 1}
                        </Box>
                        <Text mt={2} fontSize="sm" fontWeight={index === activeStep ? 'bold' : 'normal'}>{step.title}</Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">{step.description}</Text>
                    </Flex>
                    {index < steps.length - 1 && (
                        <Box flex={1} h="2px" bg={index < activeStep ? 'teal.500' : 'gray.200'} mx={2} />
                    )}
                </Flex>
            ))}
        </Flex>
    );

    const renderAddressStep = () => (
        <VStack spacing={6} align="stretch">
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
                <Box>
                    <Text fontWeight="semibold" mb={2} fontSize="sm">Saved Addresses</Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                        {savedAddresses.map((addr, idx) => (
                            <Flex key={idx} p={3} bg={savedAddrBg} borderRadius="md"
                                cursor="pointer" onClick={() => selectSavedAddress(addr)}
                                borderWidth="1px" borderColor="blue.200"
                                _hover={{ borderColor: 'blue.400' }}
                                justify="space-between" align="center">
                                <Box>
                                    <Text fontSize="sm" fontWeight="medium">{addr.label}</Text>
                                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                        {addr.address}, {addr.city}
                                    </Text>
                                </Box>
                                <Tag size="sm" colorScheme="red" variant="subtle"
                                    onClick={(e) => { e.stopPropagation(); deleteSavedAddress(idx); }}
                                    cursor="pointer">
                                    <TagCloseButton />
                                </Tag>
                            </Flex>
                        ))}
                    </SimpleGrid>
                    <Divider my={4} />
                </Box>
            )}

            <Heading size="md">
                <Icon as={FiMapPin} mr={2} verticalAlign="middle" />
                Shipping Address
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isInvalid={!!errors.address} gridColumn={{ md: 'span 2' }}>
                    <FormLabel>Street Address</FormLabel>
                    <Input {...register('address')} placeholder="123 Main St, Apt 4B" />
                    <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.city}>
                    <FormLabel>City</FormLabel>
                    <Input {...register('city')} placeholder="New York" />
                    <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.postalCode}>
                    <FormLabel>Postal Code</FormLabel>
                    <Input {...register('postalCode')} placeholder="10001" />
                    <FormErrorMessage>{errors.postalCode?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.country}>
                    <FormLabel>Country</FormLabel>
                    <CountryDropdown
                        value={watchedCountry || ''}
                        onChange={(val) => setValue('country', val, { shouldValidate: true })}
                        classes="chakra-select"
                        style={{
                            width: '100%', height: '40px', borderRadius: '8px',
                            border: '1px solid', borderColor: errors.country ? '#E53E3E' : '#E2E8F0',
                            padding: '0 12px', fontSize: '14px', background: 'white'
                        }}
                    />
                    {errors.country && <Text color="red.500" fontSize="sm" mt={1}>{errors.country.message}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.phone} gridColumn={{ md: 'span 2' }}>
                    <FormLabel>
                        <Icon as={FiPhone} mr={1} verticalAlign="middle" />
                        Phone Number
                    </FormLabel>
                    <InputGroup>
                        <InputLeftElement pointerEvents="none">
                            <Icon as={FiPhone} color="gray.400" />
                        </InputLeftElement>
                        <Input {...register('phone')} placeholder="+1 555 123 4567" type="tel" pl={10} />
                    </InputGroup>
                    <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
                </FormControl>
            </SimpleGrid>

            <Button size="sm" variant="outline" leftIcon={<FiHome />}
                onClick={saveCurrentAddress} alignSelf="flex-start">
                Save this address
            </Button>
        </VStack>
    );

    const renderShippingStep = () => (
        <VStack spacing={6} align="stretch">
            <Heading size="md">Shipping Method</Heading>
            <RadioGroup value={shippingMethod} onChange={setShippingMethod}>
                <Stack spacing={4}>
                    {[
                        { value: 'standard', label: 'Standard Shipping', desc: '3-5 business days', price: subtotal > 50 ? 'Free' : '$9.99' },
                        { value: 'express', label: 'Express Shipping', desc: '1-2 business days', price: '$15.99' },
                    ].map(s => (
                        <Box key={s.value} p={4} borderWidth="2px" borderRadius="lg"
                            bg={shippingMethod === s.value ? 'teal.50' : 'transparent'}
                            borderColor={shippingMethod === s.value ? 'teal.500' : 'gray.200'}
                            cursor="pointer" onClick={() => setShippingMethod(s.value)}
                            transition="all 0.15s"
                        >
                            <Radio value={s.value} pointerEvents="none">
                                <Flex justify="space-between" align="center" w="full" ml={3}>
                                    <Box>
                                        <HStack>
                                            <Icon as={FiTruck} color={shippingMethod === s.value ? 'teal.500' : 'gray.400'} />
                                            <Box>
                                                <Text fontWeight="semibold">{s.label}</Text>
                                                <Text fontSize="sm" color="gray.500">{s.desc}</Text>
                                            </Box>
                                        </HStack>
                                    </Box>
                                    <Text fontWeight="bold">{s.price}</Text>
                                </Flex>
                            </Radio>
                        </Box>
                    ))}
                </Stack>
            </RadioGroup>
        </VStack>
    );

    const renderPaymentStep = () => (
        <VStack spacing={6} align="stretch">
            <Heading size="md">Payment Method</Heading>
            <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
                <Stack spacing={4}>
                    {[
                        { value: 'credit_card', label: 'Credit / Debit Card', desc: 'Pay with Visa, Mastercard, etc.' },
                        { value: 'paypal', label: 'PayPal', desc: 'Fast & secure payment' },
                    ].map(m => (
                        <Box key={m.value} p={4} borderWidth="2px" borderRadius="lg"
                            bg={paymentMethod === m.value ? 'teal.50' : 'transparent'}
                            borderColor={paymentMethod === m.value ? 'teal.500' : 'gray.200'}
                            cursor="pointer" onClick={() => setPaymentMethod(m.value)}
                            transition="all 0.15s"
                        >
                            <Radio value={m.value} pointerEvents="none">
                                <Box ml={3}>
                                    <Text fontWeight="semibold">{m.label}</Text>
                                    <Text fontSize="sm" color="gray.500">{m.desc}</Text>
                                </Box>
                            </Radio>
                        </Box>
                    ))}
                </Stack>
            </RadioGroup>
        </VStack>
    );

    const renderConfirmStep = () => {
        const addr = {
            address: watch('address'),
            city: watch('city'),
            postalCode: watch('postalCode'),
            country: watch('country'),
            phone: watch('phone')
        };

        return (
            <VStack spacing={5} align="stretch">
                <Heading size="md"><FiCheck style={{ display: 'inline', marginRight: 8 }} />Review Your Order</Heading>

                <Box>
                    <Text fontWeight="semibold" mb={3}>Items ({cartItems.length})</Text>
                    <VStack spacing={3} align="stretch" maxH="280px" overflowY="auto">
                        {cartItems.map((item, idx) => (
                            <Flex key={idx} gap={3} align="center" p={2} borderRadius="md" _hover={{ bg: 'gray.50' }}>
                                <Image src={item.image || ''} alt={item.name} boxSize="50px" objectFit="contain" borderRadius="md"
                                    fallback={<Box boxSize="50px" bg="gray.100" borderRadius="md" />}
                                />
                                <Box flex={1}>
                                    <Text fontWeight="medium" noOfLines={1}>{item.name}</Text>
                                    <Text fontSize="sm" color="gray.500">Qty: {item.qty} × ${item.price.toFixed(2)}</Text>
                                </Box>
                                <Text fontWeight="bold">${(item.price * item.qty).toFixed(2)}</Text>
                            </Flex>
                        ))}
                    </VStack>
                </Box>

                <Divider />
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                        <Text fontWeight="semibold" mb={1}>Shipping To</Text>
                        <Text fontSize="sm">{addr.address}</Text>
                        <Text fontSize="sm">{addr.city}, {addr.postalCode}</Text>
                        <Text fontSize="sm">{addr.country}</Text>
                        <Text fontSize="sm" color="gray.500"><FiPhone style={{ display: 'inline' }} /> {addr.phone}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight="semibold" mb={1}>Shipping Method</Text>
                        <Text fontSize="sm" textTransform="capitalize">{shippingMethod}</Text>
                        <Text fontWeight="semibold" mt={3} mb={1}>Payment</Text>
                        <Text fontSize="sm">{paymentMethod === 'credit_card' ? 'Credit/Debit Card' : 'PayPal'}</Text>
                    </Box>
                </SimpleGrid>

                {reduxCoupon && (
                    <>
                        <Divider />
                        <Flex justify="space-between" color="green.600">
                            <Text fontWeight="medium">Coupon: {reduxCoupon.code}</Text>
                            <Text>-${parseFloat(reduxCoupon.discountAmount).toFixed(2)}</Text>
                        </Flex>
                    </>
                )}
            </VStack>
        );
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0: return renderAddressStep();
            case 1: return renderShippingStep();
            case 2: return renderPaymentStep();
            case 3: return renderConfirmStep();
            default: return null;
        }
    };

    if (cartItems.length === 0) {
        return <Flex justify="center" align="center" minH="400px"><Spinner size="xl" /></Flex>;
    }

    return (
        <Box bg={bgColor} minH="100vh" py={8}>
            <Box maxW="1200px" mx="auto" px={4}>
                <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
                    <Heading size="xl">Checkout</Heading>
                    <Button variant="ghost" leftIcon={<FiArrowLeft />} onClick={() => navigate('/cart')}>Back to Cart</Button>
                </Flex>

                {renderStepIndicator()}

                <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
                    {/* Main form area */}
                    <Box flex={2}>
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="sm">
                            {renderStepContent()}

                            <Flex justify="space-between" mt={8} gap={4}>
                                {activeStep > 0 && (
                                    <Button onClick={handlePrevious} variant="outline">Back</Button>
                                )}
                                {activeStep < steps.length - 1 ? (
                                    <Button colorScheme="teal" onClick={handleNext} ml="auto">
                                        Continue
                                    </Button>
                                ) : (
                                    <Button colorScheme="teal" size="lg" onClick={handleCreateOrder}
                                        isLoading={loading} loadingText="Creating Order..." ml="auto" rightIcon={<FiCheck />}>
                                        Place Order
                                    </Button>
                                )}
                            </Flex>
                        </Box>
                    </Box>

                    {/* Order Summary Sidebar */}
                    <Box flex={1}>
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="sm" position="sticky" top="20px">
                            <Heading size="md" mb={4}>Order Summary</Heading>
                            <VStack spacing={3} align="stretch">
                                <Box>
                                    {reduxCoupon ? (
                                        <Alert status="success" borderRadius="md" size="sm">
                                            <AlertIcon />
                                            <Box flex={1}>
                                                <Text fontSize="sm" fontWeight="medium">{reduxCoupon.code}</Text>
                                                <Text fontSize="xs">{reduxCoupon.discountValue}{reduxCoupon.discountType === 'percentage' ? '%' : '$'} off</Text>
                                            </Box>
                                            <Button size="xs" variant="ghost" onClick={handleRemoveCoupon}>Remove</Button>
                                        </Alert>
                                    ) : (
                                        <>
                                            <Flex gap={2}>
                                                <Input placeholder="Coupon code" value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    size="sm" isInvalid={!!couponError} />
                                                <Button size="sm" colorScheme="teal" onClick={handleApplyCoupon}
                                                    isLoading={isApplyingCoupon} isDisabled={!couponCode}>Apply</Button>
                                            </Flex>
                                            {couponError && <Text fontSize="xs" color="red.500" mt={1}>{couponError}</Text>}
                                        </>
                                    )}
                                </Box>

                                <Divider />
                                <Flex justify="space-between"><Text color="gray.500">Subtotal ({cartItems.reduce((a, i) => a + i.qty, 0)} items)</Text><Text>${subtotal.toFixed(2)}</Text></Flex>
                                <Flex justify="space-between"><Text color="gray.500">Shipping</Text><Text>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</Text></Flex>
                                <Flex justify="space-between"><Text color="gray.500">Tax (8%)</Text><Text>${tax.toFixed(2)}</Text></Flex>
                                {discountAmount > 0 && (
                                    <Flex justify="space-between" color="green.600"><Text>Discount</Text><Text>-${discountAmount.toFixed(2)}</Text></Flex>
                                )}
                                <Divider />
                                <Flex justify="space-between" fontSize="lg" fontWeight="bold">
                                    <Text>Total</Text>
                                    <Text fontSize="2xl" color="teal.500">${total.toFixed(2)}</Text>
                                </Flex>
                            </VStack>

                            <Divider my={4} />
                            <VStack spacing={2} align="stretch" mt={4}>
                                <HStack spacing={2}><Icon as={FiLock} color="green.500" /><Text fontSize="xs" color="gray.500">Secure checkout — SSL Encrypted</Text></HStack>
                                <HStack spacing={2}><Icon as={FiShield} color="green.500" /><Text fontSize="xs" color="gray.500">Buyer protection — Money-back guarantee</Text></HStack>
                            </VStack>
                        </Box>
                    </Box>
                </Flex>
            </Box>

            {/* Payment Modal */}
            <Modal isOpen={isPaymentOpen} onClose={onPaymentClose} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Complete Payment</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Text mb={4}>Order Total: <strong>${total.toFixed(2)}</strong></Text>
                        {paymentMethod === 'credit_card' ? (
                            <StripePayment amount={total} orderId={orderId} onSuccess={handlePaymentSuccess} onError={() => {}} />
                        ) : (
                            <PayPalButtons
                                createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: total.toFixed(2) } }] })}
                                onApprove={async (data, actions) => { await actions.order.capture(); handlePaymentSuccess(); }}
                            />
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

// Need to import applyCoupon from cartSlice for the checkout page handler
import { applyCoupon as applyCouponFromCheckout } from '../store/slices/cartSlice';
import { StripePayment } from '../components/StripePayment';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useTranslation } from 'react-i18next';

export default CheckoutPage;
