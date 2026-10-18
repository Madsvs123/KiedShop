import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Box, Heading, Text, Flex, Button, Image, SimpleGrid, VStack, HStack, 
    Divider, Tag, Wrap, WrapItem, useColorModeValue, AspectRatio, Badge, 
    Alert, AlertIcon, Spinner, Breadcrumb, BreadcrumbItem, BreadcrumbLink, 
    Card, CardHeader, CardBody, CardFooter, Tabs, TabList, TabPanels, 
    Tab, TabPanel, useToast, Icon, Stat, StatLabel, StatNumber, StatGroup,
    Tooltip, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, List, ListItem, ListIcon
} from '@chakra-ui/react';
import { 
    FiArrowLeft, FiEdit, FiTrash2, FiShoppingCart, FiTag, 
    FiPackage, FiClock, FiCheckCircle, FiXCircle, FiImage, FiPlus, 
    FiMinus, FiZoomIn, FiExternalLink, FiCalendar, FiUsers, FiDollarSign
} from 'react-icons/fi';
import { getProductById, deleteProduct } from '../services/api';

const AdminProductDetail = () => {
    const { t, i18n } = useTranslation("admin");
    const isRtl = i18n.language === 'ar';
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [fullImageUrl, setFullImageUrl] = useState('');

    const toast = useToast();
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await getProductById(id);
            setProduct(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || t("error"));
            setLoading(false);
        }
    };

    const getProductImages = () => {
        if (!product) return [];
        const images = [];
        if (product.primaryImage) images.push(product.primaryImage);
        if (product.secondaryImages && product.secondaryImages.length > 0) {
            images.push(...product.secondaryImages);
        }
        return images;
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                setIsDeleting(true);
                await deleteProduct(id);
                toast({
                    title: t("statusUpdated"),
                    status: 'success',
                    duration: 3000,
                    isClosable: true
                });
                navigate('/admin/products');
            } catch (err) {
                toast({
                    title: 'Error',
                    description: err.response?.data?.message || t("error"),
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                });
                setIsDeleting(false);
            }
        }
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
    const resetZoom = () => setZoomLevel(1);
    
    const openFullImage = (imageUrl) => {
        setFullImageUrl(imageUrl);
        setShowFullImage(true);
    };

    if (loading) {
        return (
            <Box p={6} minHeight="100vh" bg={bgColor}>
                <Flex justifyContent="center" alignItems="center" height="100%">
                    <Spinner size="xl" />
                </Flex>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={6} minHeight="100vh" bg={bgColor}>
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                </Alert>
                <Button mt={4} onClick={() => navigate('/admin/products')}>
                    {t("backToProducts")}
                </Button>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box p={6} minHeight="100vh" bg={bgColor}>
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    {t("productNotFound")}
                </Alert>
                <Button mt={4} onClick={() => navigate('/admin/products')}>
                    {t("backToProducts")}
                </Button>
            </Box>
        );
    }

    const images = getProductImages();
    const stockStatus = {
        color: product.countInStock > 10 ? 'green' : product.countInStock > 0 ? 'yellow' : 'red',
        text: product.countInStock > 10 ? t('wellStocked') : product.countInStock > 0 ? t('lowStock') : t('outOfStock'),
        icon: product.countInStock > 0 ? FiCheckCircle : FiXCircle
    };

    return (
        <Box minHeight="100vh" bg={bgColor}>
            <Box maxWidth="1400px" mx="auto" p={6}>
                {/* Breadcrumb */}
                <Breadcrumb mb={6} separator={isRtl ? "\\" : "/"} direction={isRtl ? 'row-reverse' : 'row'}>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to="/admin/dashboard">{t("dashboard")}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to="/admin/products">{t("products")}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink>{product.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                {/* Header with actions */}
                <Flex justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap" gap={4}>
                    <Heading as="h1" size="xl">{t("productDetails")}</Heading>
                    <HStack spacing={3}>
                        <Button
                            leftIcon={<FiEdit />}
                            colorScheme="blue"
                            onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                        >
                            {t("editProduct")}
                        </Button>
                        <Button
                            leftIcon={<FiTrash2 />}
                            colorScheme="red"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            variant="outline"
                        >
                            {t("deleteProduct")}
                        </Button>
                    </HStack>
                </Flex>

                {/* Product Grid */}
                <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
                    {/* Left Column - Images */}
                    <Box flex={{ lg: 1 }}>
                        <Card bg={cardBg} boxShadow="md" borderRadius="lg" overflow="hidden">
                            <CardBody>
                                {/* Main Image */}
                                <Box position="relative" mb={4}>
                                    <AspectRatio ratio={1} mb={4}>
                                        <Box
                                            style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s ease' }}
                                            cursor="pointer"
                                            onClick={() => openFullImage(images[selectedImageIndex] || product.primaryImage)}
                                            position="relative"
                                        >
                                            <Image
                                                src={images[selectedImageIndex] || product.primaryImage || '/images/sample.jpg'}
                                                alt={product.name}
                                                objectFit="contain"
                                                width="100%"
                                                height="100%"
                                                borderRadius="md"
                                                fallbackSrc="/images/sample.jpg"
                                            />
                                            <Tooltip label="Click to view full size" placement="top">
                                                <Icon
                                                    as={FiZoomIn}
                                                    position="absolute"
                                                    bottom={2}
                                                    right={2}
                                                    bg="rgba(0,0,0,0.5)"
                                                    color="white"
                                                    borderRadius="full"
                                                    p={1}
                                                    boxSize={6}
                                                />
                                            </Tooltip>
                                        </Box>
                                    </AspectRatio>
                                    
                                    {/* Zoom Controls */}
                                    <Flex justifyContent="center" gap={2} mb={4}>
                                        <Button size="sm" onClick={handleZoomOut} leftIcon={<FiMinus />}>{t("zoomOut")}</Button>
                                        <Button size="sm" onClick={resetZoom}>{t("reset")}</Button>
                                        <Button size="sm" onClick={handleZoomIn} rightIcon={<FiPlus />}>{t("zoomIn")}</Button>
                                    </Flex>
                                </Box>

                                {/* Thumbnail Gallery */}
                                {images.length > 1 && (
                                    <Box>
                                        <Text fontWeight="bold" mb={2} fontSize="sm">Product Images ({images.length})</Text>
                                        <SimpleGrid columns={4} spacing={2}>
                                            {images.map((img, index) => (
                                                <AspectRatio
                                                    key={index}
                                                    ratio={1}
                                                    cursor="pointer"
                                                    opacity={selectedImageIndex === index ? 1 : 0.7}
                                                    border={selectedImageIndex === index ? '2px solid' : '1px solid'}
                                                    borderColor={selectedImageIndex === index ? 'blue.500' : 'gray.200'}
                                                    borderRadius="md"
                                                    onClick={() => setSelectedImageIndex(index)}
                                                    transition="all 0.2s"
                                                    _hover={{ opacity: 0.9 }}
                                                >
                                                    <Image
                                                        src={img}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        objectFit="cover"
                                                        borderRadius="sm"
                                                        fallbackSrc="/images/sample.jpg"
                                                    />
                                                </AspectRatio>
                                            ))}
                                        </SimpleGrid>
                                    </Box>
                                )}
                            </CardBody>
                        </Card>
                    </Box>

                    {/* Right Column - Product Info */}
                    <Box flex={{ lg: 2 }}>
                        <VStack spacing={6} align="stretch">
                            {/* Basic Info Card */}
                            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
                                <CardHeader>
                                    <Heading size="lg">{product.name}</Heading>
                                    <Flex alignItems="center" mt={2} flexWrap="wrap" gap={3}>
                                        <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                                            ${product.price.toFixed(2)}
                                        </Text>
                                        <Badge colorScheme={stockStatus.color} fontSize="md" px={3} py={1}>
                                            <HStack spacing={1}>
                                                <Icon as={stockStatus.icon} />
                                                <Text>{stockStatus.text}</Text>
                                            </HStack>
                                        </Badge>
                                    </Flex>
                                </CardHeader>
                                <CardBody>
                                    <Box mb={4}>
                                        <Text fontWeight="bold" mb={2} fontSize="lg">Description:</Text>
                                        <Text color="gray.600" lineHeight="tall">{product.description}</Text>
                                    </Box>
                                    
                                    <Divider my={4} />
                                    
                                    <StatGroup mb={4}>
                                        <Stat>
                                            <StatLabel>{t("stock")}</StatLabel>
                                            <StatNumber color={product.countInStock > 0 ? 'green.500' : 'red.500'}>
                                                {product.countInStock}
                                            </StatNumber>
                                        </Stat>
                                    </StatGroup>
                                    
                                    <Divider my={4} />
                                    
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <Box>
                                            <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>{t("category")}</Text>
                                            <Flex alignItems="center">
                                                <Icon as={FiTag} mr={2} color="gray.400" />
                                                <Text>{product.category?.name || product.category}</Text>
                                            </Flex>
                                        </Box>
                                        {product.subcategory && (
                                            <Box>
                                                <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>{t("subcategory")}</Text>
                                                <Flex alignItems="center">
                                                    <Icon as={FiPackage} mr={2} color="gray.400" />
                                                    <Badge colorScheme="purple">{product.subcategory}</Badge>
                                                </Flex>
                                            </Box>
                                        )}
                                        <Box>
                                            <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>{t("brand")}</Text>
                                            <Flex alignItems="center">
                                                <Icon as={FiPackage} mr={2} color="gray.400" />
                                                <Text>{product.brand}</Text>
                                            </Flex>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>{t("productId")}</Text>
                                            <Flex alignItems="center">
                                                <Icon as={FiClock} mr={2} color="gray.400" />
                                                <Text fontSize="sm">{product._id}</Text>
                                            </Flex>
                                        </Box>
                                    </SimpleGrid>
                                </CardBody>
                            </Card>

                            {/* Additional Info Card */}
                            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
                                <CardHeader>
                                    <Heading size="md">{t("productInformation")}</Heading>
                                </CardHeader>
                                <CardBody>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <Box>
                                            <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>
                                                <Icon as={FiCalendar} mr={2} />
                                                Created Date
                                            </Text>
                                            <Text>{new Date(product.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</Text>
                                            <Text fontSize="sm" color="gray.500">
                                                {new Date(product.createdAt).toLocaleTimeString()}
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>
                                                <Icon as={FiCalendar} mr={2} />
                                                Last Updated
                                            </Text>
                                            <Text>{new Date(product.updatedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</Text>
                                            <Text fontSize="sm" color="gray.500">
                                                {new Date(product.updatedAt).toLocaleTimeString()}
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>
                                                <Icon as={FiImage} mr={2} />
                                                Total Images
                                            </Text>
                                            <Text>{images.length} image(s)</Text>
                                            <Text fontSize="sm" color="gray.500">
                                                {images.filter(img => img.startsWith('/uploads/')).length} uploaded, 
                                                {images.filter(img => img.startsWith('http')).length} from URL
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>
                                                <Icon as={FiDollarSign} mr={2} />
                                                Total Value
                                            </Text>
                                            <Text fontWeight="bold" fontSize="lg" color="blue.600">
                                                ${(product.price * product.countInStock).toFixed(2)}
                                            </Text>
                                            <Text fontSize="sm" color="gray.500">
                                                ({product.countInStock} units × ${product.price.toFixed(2)})
                                            </Text>
                                        </Box>
                                    </SimpleGrid>
                                </CardBody>
                            </Card>
                        </VStack>
                    </Box>
                </Flex>

                {/* Back Button */}
                <Box mt={8}>
                    <Button
                        leftIcon={<FiArrowLeft />}
                        onClick={() => navigate('/admin/products')}
                        variant="outline"
                        size="lg"
                    >
                        Back to Products
                    </Button>
                </Box>
            </Box>

            {/* Full Image Modal */}
            <Modal isOpen={showFullImage} onClose={() => setShowFullImage(false)} size="full">
                <ModalOverlay bg="blackAlpha.900" />
                <ModalContent bg="transparent" boxShadow="none">
                    <ModalHeader>
                        <Flex justifyContent="flex-end">
                            <ModalCloseButton color="white" size="lg" />
                        </Flex>
                    </ModalHeader>
                    <ModalBody display="flex" alignItems="center" justifyContent="center">
                        <Image
                            src={fullImageUrl}
                            alt="Full size product"
                            maxH="90vh"
                            maxW="90vw"
                            objectFit="contain"
                            fallbackSrc="/images/sample.jpg"
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default AdminProductDetail;