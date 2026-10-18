import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    Box, Flex, Heading, Text, SimpleGrid, Spinner, Alert, AlertIcon, 
    Tabs, TabList, TabPanels, Tab, TabPanel, useColorModeValue, 
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, VStack, useToast,
    Image, Badge, HStack, Button, NumberInput, NumberInputField,
    NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
    ScaleFade, Tooltip, IconButton, Icon
} from '@chakra-ui/react';
import { 
    FiBookOpen, FiShoppingCart, FiShare2, 
    FiCheck, FiStar, FiTruck, FiRefreshCw, FiShield
} from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductById, getRelatedProducts, addToCart } from '../services/api';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart as addToCartAction } from '../store/slices/cartSlice';
import { rememberProduct } from '../utils/recentlyViewed';

const ProductPage = () => {
    const { t, i18n } = useTranslation('pages');
    const isRtl = i18n.language === 'ar';
    const { id } = useParams();
    const toast = useToast();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const { userInfo } = useSelector((state) => state.auth);
    
    const [quantity, setQuantity] = useState(1);
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [recentProducts, setRecentProducts] = useState([]);

    const bgColor = useColorModeValue('white', 'gray.800');
    const infoBg = useColorModeValue('gray.50', 'gray.700');

    // Fetch product
    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const response = await getProductById(id);
            return response.data;
        },
        enabled: !!id
    });

    useEffect(() => {
        if (!product?._id) return;
        const next = rememberProduct(product).filter((item) => item._id !== product._id);
        setRecentProducts(next);
    }, [product]);

    // Fetch related products
    const { data: relatedProducts = [] } = useQuery({
        queryKey: ['related-products', id],
        queryFn: async () => {
            const response = await getRelatedProducts(id);
            return response.data;
        },
        enabled: !!product?._id
    });

    // Add to cart mutation
    const { mutate: addCartItem, isLoading: isAddingToCart } = useMutation({
        mutationFn: addToCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast({
                title: t('addedToCart'),
                description: `${product?.name} ${t('hasBeenAddedToYourCart')}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setIsAddedToCart(true);
            setTimeout(() => setIsAddedToCart(false), 2000);
        },
        onError: (error) => {
            toast({
                title: t('error'),
                description: error.response?.data?.message || t('failedToAddToCart'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    });

    const handleAddToCart = () => {
        if (!userInfo) {
            toast({
                title: t('pleaseLogin'),
                description: t('needToLoginToAddItems'),
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (product.countInStock === 0) {
            toast({
                title: t('outOfStock'),
                description: t('productCurrentlyUnavailable'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        addCartItem({ productId: product._id, quantity });
        dispatch(addToCartAction({
            product: product._id,
            name: product.name,
            image: product.primaryImage,
            price: product.price,
            countInStock: product.countInStock,
            qty: quantity
        }));
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: t('linkCopied'), status: 'success', duration: 2000 });
    };

    const isBook = product?.category?.name?.toLowerCase().includes('book') || product?.subcategory?.toLowerCase().includes('book');

    if (isLoading) {
        return (
            <Flex justifyContent="center" alignItems="center" height="400px">
                <Spinner size="xl" color="teal.500" thickness="4px" />
            </Flex>
        );
    }

    if (error) {
        return (
            <Alert status="error" mt={4} mx={4} borderRadius="lg">
                <AlertIcon />
                Error loading product: {error.message}
            </Alert>
        );
    }

    if (!product) {
        return (
            <Alert status="error" mt={4} mx={4} borderRadius="lg">
                <AlertIcon />
                Product not found
            </Alert>
        );
    }

    return (
        <Box bg={bgColor} minH="100vh" py={6}>
            <Box maxW="1200px" mx="auto" px={4}>
                {/* Breadcrumb */}
                <Breadcrumb mb={6} fontSize="sm" direction={isRtl ? 'row-reverse' : 'row'}>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to="/">{t('home')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to={`/category/${product.category?.slug || 'products'}`}>
                            {product.category?.name || t('products')}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink>{product.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                {/* Product Main Section */}
                <Flex direction={{ base: 'column', lg: 'row' }} gap={8} mb={12}>
                    {/* Product Images Gallery */}
                    <Box flex={1}>
                        <Box
                            bg={useColorModeValue('gray.100', 'gray.700')}
                            p={6}
                            mb={4}
                            borderRadius="xl"
                            position="relative"
                            height="400px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            {isBook && (
                                <Badge
                                    position="absolute"
                                    top={4} 
                                    left={4} 
                                    bg="blue.500"
                                    color="white"
                                    px={3}
                                    py={1}
                                    zIndex={1}
                                    borderRadius="full"
                                >
                                    <Flex align="center" gap={1}>
                                        <FiBookOpen size={12} />
                                            <span>{t('book')}</span>
                                    </Flex>
                                </Badge>
                            )}
                            
                            <Image 
                                src={product.primaryImage || '/images/placeholder.png'}
                                alt={product.name}
                                objectFit="contain"
                                maxHeight="350px"
                                borderRadius="lg"
                                boxShadow="lg"
                                fallbackSrc="/images/placeholder.png"
                            />
                        </Box>
                        
                        {product.secondaryImages?.length > 0 && (
                            <SimpleGrid columns={4} spacing={3}>
                                {product.secondaryImages.slice(0, 4).map((image, index) => (
                                    <Image
                                        key={index}
                                        src={image}
                                        alt={`${product.name} ${index + 1}`}
                                        objectFit="cover"
                                        height="80px"
                                        borderRadius="md"
                                        cursor="pointer"
                                        _hover={{ opacity: 0.8 }}
                                        border={index === 0 ? '2px solid teal.500' : '1px solid gray.200'}
                                        fallbackSrc="/images/placeholder.png"
                                    />
                                ))}
                            </SimpleGrid>
                        )}
                    </Box>

                    {/* Product Info */}
                    <ScaleFade initialScale={0.9} in={true}>
                        <Box flex={1}>
                            <Heading size="2xl" mb={2}>{product.name}</Heading>

                            <Flex gap={2} mb={3} flexWrap="wrap">
                                <Badge colorScheme="teal" fontSize="sm">{t('brand')}: {product.brand || 'MediStore'}</Badge>
                                {product.subcategory && (
                                    <Badge colorScheme="blue" fontSize="sm">{product.subcategory}</Badge>
                                )}
                            </Flex>

                            <Flex alignItems="center" gap={3} mb={4} flexWrap="wrap">
                                <HStack spacing={1}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Icon
                                            key={star}
                                            as={FiStar}
                                            boxSize={4}
                                            color={star <= Math.round(product.rating || 0) ? '#ECC94B' : '#CBD5E0'}
                                            fill={star <= Math.round(product.rating || 0) ? '#ECC94B' : 'none'}
                                        />
                                    ))}
                                </HStack>
                                <Text fontWeight="bold">
                                    {product.rating?.toFixed(1) || 0}
                                </Text>
                            </Flex>

                            <Flex alignItems="baseline" gap={3} mb={4}>
                                <Text fontSize="3xl" fontWeight="bold" color="teal.600">
                                    ${product.price.toFixed(2)}
                                </Text>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <Flex alignItems="center" gap={2}>
                                        <Text fontSize="lg" color="gray.500" textDecor="line-through">
                                            ${product.originalPrice.toFixed(2)}
                                        </Text>
                                        <Badge colorScheme="green" fontSize="sm">
                                            Save ${(product.originalPrice - product.price).toFixed(2)}
                                        </Badge>
                                    </Flex>
                                )}
                            </Flex>

                            <Text mb={6} color="gray.600" lineHeight="tall">
                                {product.description?.length > 300 
                                    ? `${product.description.slice(0, 300)}...` 
                                    : product.description}
                            </Text>

                            {/* Stock Status */}
                            {product.countInStock === 0 ? (
                                <Alert status="error" mb={4} borderRadius="lg">
                                    <Text fontWeight="bold">{t('outOfStock')}</Text>
                                </Alert>
                            ) : product.countInStock <= 5 ? (
                                <Alert status="warning" mb={4} borderRadius="lg">
                                    <Text fontWeight="bold">{t('onlyLeft', { count: product.countInStock })}</Text>
                                </Alert>
                            ) : (
                                <Alert status="success" mb={4} borderRadius="lg" variant="subtle">
                                    <Text fontWeight="bold">{t('inStockReady')}</Text>
                                </Alert>
                            )}

                            {/* Quantity and Add to Cart */}
                            <Flex alignItems="center" gap={4} mb={6} flexWrap="wrap">
                                <Text fontWeight="semibold">{t('quantity')}</Text>
                                <NumberInput
                                    min={1} 
                                    max={product.countInStock || 10}
                                    value={quantity}
                                    onChange={(_, val) => setQuantity(val)}
                                    isDisabled={product.countInStock === 0}
                                    size="sm"
                                    w="100px"
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </Flex>

                            <Flex gap={4} mb={6} direction={{ base: 'column', sm: 'row' }}>
                                <Button
                                    colorScheme="teal"
                                    size="lg"
                                    leftIcon={isAddedToCart ? <FiCheck /> : <FiShoppingCart />}
                                    flex={2}
                                    onClick={handleAddToCart}
                                    isDisabled={product.countInStock === 0 || isAddingToCart}
                                    isLoading={isAddingToCart}
                                    _hover={{ transform: 'translateY(-2px)' }}
                                    transition="all 0.2s"
                                >
                                    {isAddedToCart ? t('addedToCart') : t('addToCart')}
                                </Button>

                                <Tooltip label={t('copyProductLink')}>
                                    <IconButton
                                        icon={<FiShare2 />}
                                        aria-label="Share product"
                                        size="lg"
                                        onClick={handleShare}
                                        variant="ghost"
                                        colorScheme="teal"
                                    />
                                </Tooltip>
                            </Flex>

                            {/* Shipping Info */}
                            <Box p={4} bg={infoBg} borderRadius="xl">
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                                        <Flex align="center" gap={2}>
                                        <FiTruck color="teal.500" size={18} />
                                        <Text fontSize="sm">{t('freeShippingOver50')}</Text>
                                    </Flex>
                                    <Flex align="center" gap={2}>
                                        <FiRefreshCw color="teal.500" size={18} />
                                        <Text fontSize="sm">{t('30DayReturn')}</Text>
                                    </Flex>
                                    <Flex align="center" gap={2}>
                                        <FiShield color="teal.500" size={18} />
                                        <Text fontSize="sm">{t('securePayment')}</Text>
                                    </Flex>
                                </SimpleGrid>
                            </Box>
                        </Box>
                    </ScaleFade>
                </Flex>

                {/* Tabs Section */}
                <Tabs variant="soft-rounded" colorScheme="teal" mb={12}>
                    <TabList flexWrap="wrap" gap={2}>
                        <Tab>{t('description')}</Tab>
                        <Tab>{t('specifications')}</Tab>
                        <Tab>{t('shippingReturns')}</Tab>
                    </TabList>

                    <TabPanels mt={6}>
                        {/* Description Tab */}
                        <TabPanel px={{ base: 0, md: 4 }}>
                            <Text lineHeight="tall" mb={4} whiteSpace="pre-line">
                                {product.description}
                            </Text>
                        </TabPanel>

                        {/* Specifications Tab */}
                        <TabPanel px={{ base: 0, md: 4 }}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <Box>
                                    <Text fontWeight="semibold" mb={2}>Brand</Text>
                                    <Text>{product.brand || 'MediStore'}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="semibold" mb={2}>Category</Text>
                                    <Text>{product.category?.name || 'General'}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="semibold" mb={2}>Product ID</Text>
                                    <Text>{product._id?.slice(-8).toUpperCase()}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="semibold" mb={2}>Availability</Text>
                                    <Text color={product.countInStock > 0 ? 'green.600' : 'red.600'}>
                                        {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </Text>
                                </Box>
                            </SimpleGrid>
                        </TabPanel>

                        {/* Shipping & Returns Tab */}
                        <TabPanel px={{ base: 0, md: 4 }}>
                            <VStack spacing={5} align="stretch">
                                <Box>
                                    <Heading size="sm" mb={3}>Standard Shipping</Heading>
                                    <Text>Delivery within 3-5 business days</Text>
                                    <Text color="gray.600">Free shipping on orders over $50</Text>
                                </Box>

                                <Box>
                                    <Heading size="sm" mb={3}>Express Shipping</Heading>
                                    <Text>Delivery within 1-2 business days</Text>
                                    <Text color="gray.600">$15.99 express shipping fee</Text>
                                </Box>

                                <Box>
                                    <Heading size="sm" mb={3}>Returns Policy</Heading>
                                    <Text>30-day return window for unused items in original packaging</Text>
                                    <Text color="gray.600">Free returns on all orders</Text>
                                </Box>
                            </VStack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>

                {recentProducts.length > 0 && (
                    <Box mb={8}>
                        <Heading size="lg" mb={6}>Recently viewed</Heading>
                        <SimpleGrid columns={{ base: 2, sm: 2, md: 3, lg: 4 }} spacing={6}>
                            {recentProducts.slice(0, 4).map((item) => (
                                <Box
                                    key={item._id}
                                    as={Link}
                                    to={`/products/${item._id}`}
                                    bg={useColorModeValue('white', 'gray.800')}
                                    borderRadius="lg"
                                    overflow="hidden"
                                    boxShadow="sm"
                                    _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                                    transition="all 0.3s"
                                >
                                    <Box bg={useColorModeValue('gray.100', 'gray.700')} p={4} height="160px" display="flex" alignItems="center" justifyContent="center">
                                        <Image
                                            src={item.primaryImage || '/images/placeholder.png'}
                                            alt={item.name}
                                            objectFit="contain"
                                            maxHeight="120px"
                                            fallbackSrc="/images/placeholder.png"
                                        />
                                    </Box>
                                    <Box p={4}>
                                        <Text fontWeight="bold" noOfLines={1}>{item.name}</Text>
                                        <Text fontSize="lg" fontWeight="bold" color="teal.500" mt={2}>
                                            ${Number(item.price || 0).toFixed(2)}
                                        </Text>
                                    </Box>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Box>
                )}

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <Box mb={8}>
                        <Heading size="lg" mb={6}>You May Also Like</Heading>
                        <SimpleGrid columns={{ base: 2, sm: 2, md: 3, lg: 4 }} spacing={6}>
                            {relatedProducts.slice(0, 4).map((relatedProduct) => (
                                <Box 
                                    key={relatedProduct._id}
                                    as={Link}
                                    to={`/products/${relatedProduct._id}`}
                                    bg={useColorModeValue('white', 'gray.800')}
                                    borderRadius="lg"
                                    overflow="hidden"
                                    boxShadow="sm"
                                    _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                                    transition="all 0.3s"
                                >
                                    <Box bg={useColorModeValue('gray.100', 'gray.700')} p={4} height="200px" display="flex" alignItems="center" justifyContent="center">
                                        <Image 
                                            src={relatedProduct.primaryImage || '/images/placeholder.png'}
                                            alt={relatedProduct.name}
                                            objectFit="contain"
                                            maxHeight="150px"
                                            fallbackSrc="/images/placeholder.png"
                                        />
                                    </Box>
                                    <Box p={4}>
                                        <Text fontWeight="bold" noOfLines={1}>{relatedProduct.name}</Text>
                                        <Text fontSize="xl" fontWeight="bold" color="teal.500" mt={2}>
                                            ${relatedProduct.price.toFixed(2)}
                                        </Text>
                                    </Box>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ProductPage;