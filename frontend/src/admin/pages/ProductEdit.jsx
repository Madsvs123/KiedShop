import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Box, Heading, Text, Flex, Button, FormControl, FormLabel, 
    Input, Textarea, Select, NumberInput, NumberInputField, useToast, 
    SimpleGrid, Card, CardHeader, CardBody, CardFooter, Breadcrumb, 
    BreadcrumbItem, BreadcrumbLink, Icon, Alert, AlertIcon, Spinner, 
    AspectRatio, Image, VStack, HStack, Divider, Badge, Wrap, WrapItem, 
    useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, Tag, 
    Tooltip, IconButton, AlertDialog, AlertDialogBody, AlertDialogFooter, 
    AlertDialogHeader, AlertDialogContent, AlertDialogOverlay
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave, FiTrash2, FiImage, FiPlus, FiX, FiUpload, FiLink } from 'react-icons/fi';
import { getProductById, updateProduct, deleteProduct, getCategoryTree } from '../services/api';

const AdminProductEdit = () => {
    const { t, i18n } = useTranslation("admin");
    const isRtl = i18n.language === 'ar';
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const cancelRef = useRef();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        category: '',
        subcategory: '',
        brand: '',
        countInStock: 0,
        primaryImage: null,
        primaryImageUrl: '',
        secondaryImages: [],
        secondaryImageUrls: []
    });
    
    const [imagePreview, setImagePreview] = useState({
        primary: null,
        secondary: []
    });
    
    const fileInputRef = useRef(null);
    const secondaryFileInputRef = useRef(null);

    const toast = useToast();
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        // Update subcategories when category changes
        if (formData.category && categories.length > 0) {
            const selectedCategory = categories.find(cat => cat._id === formData.category);
            if (selectedCategory && selectedCategory.subcategories) {
                setSubcategories(selectedCategory.subcategories);
            } else {
                setSubcategories([]);
            }
        }
    }, [formData.category, categories]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch product and categories in parallel
            const [productRes, categoriesRes] = await Promise.all([
                getProductById(id),
                getCategoryTree()
            ]);

            const productData = productRes.data;
            setProduct(productData);
            setCategories(categoriesRes.data);
            
            // Find category ID from category name if needed
            let categoryId = productData.category;
            if (typeof productData.category === 'object' && productData.category._id) {
                categoryId = productData.category._id;
            } else if (typeof productData.category === 'string') {
                const foundCategory = categoriesRes.data.find(cat => cat.name === productData.category);
                if (foundCategory) {
                    categoryId = foundCategory._id;
                }
            }
            
            // Set form data
            setFormData({
                name: productData.name,
                description: productData.description,
                price: productData.price,
                category: categoryId,
                subcategory: productData.subcategory || '',
                brand: productData.brand,
                countInStock: productData.countInStock,
                primaryImage: null,
                primaryImageUrl: productData.primaryImage || '',
                secondaryImages: [],
                secondaryImageUrls: productData.secondaryImages || []
            });
            
            setImagePreview({
                primary: productData.primaryImage || null,
                secondary: productData.secondaryImages || []
            });
            
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || t("error"));
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handlePrimaryImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast({ title: t("error"), status: 'error', duration: 3000 });
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({ title: 'Image size should be less than 5MB', status: 'error', duration: 3000 });
                return;
            }
            
            setFormData(prev => ({ ...prev, primaryImage: file, primaryImageUrl: '' }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(prev => ({ ...prev, primary: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSecondaryImagesUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast({ title: `${file.name} is not an image file`, status: 'error', duration: 3000 });
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast({ title: `${file.name} size should be less than 5MB`, status: 'error', duration: 3000 });
                return false;
            }
            return true;
        });
        
        const currentCount = formData.secondaryImages.length + formData.secondaryImageUrls.length;
        const availableSlots = 5 - currentCount;
        const imagesToAdd = validFiles.slice(0, availableSlots);
        
        if (validFiles.length > availableSlots) {
            toast({ 
                title: `Only ${availableSlots} more images can be added (max 5 total)`, 
                status: 'warning', 
                duration: 3000 
            });
        }
        
        setFormData(prev => ({ 
            ...prev, 
            secondaryImages: [...prev.secondaryImages, ...imagesToAdd] 
        }));
        
        // Create previews
        imagesToAdd.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(prev => ({
                    ...prev,
                    secondary: [...prev.secondary, reader.result]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeSecondaryImage = (index, isUrl = false) => {
        if (isUrl) {
            setFormData(prev => ({
                ...prev,
                secondaryImageUrls: prev.secondaryImageUrls.filter((_, i) => i !== index)
            }));
            setImagePreview(prev => ({
                ...prev,
                secondary: prev.secondary.filter((_, i) => i !== index)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                secondaryImages: prev.secondaryImages.filter((_, i) => i !== index)
            }));
            setImagePreview(prev => ({
                ...prev,
                secondary: prev.secondary.filter((_, i) => i !== index)
            }));
        }
    };

    const addSecondaryImageUrl = () => {
        if (formData.secondaryImages.length + formData.secondaryImageUrls.length >= 5) {
            toast({ title: 'Maximum 5 secondary images allowed', status: 'warning', duration: 3000 });
            return;
        }
        setFormData(prev => ({
            ...prev,
            secondaryImageUrls: [...prev.secondaryImageUrls, '']
        }));
    };

    const updateSecondaryImageUrl = (index, value) => {
        setFormData(prev => {
            const newUrls = [...prev.secondaryImageUrls];
            newUrls[index] = value;
            return { ...prev, secondaryImageUrls: newUrls };
        });
        
        // Update preview for URL
        if (value) {
            setImagePreview(prev => ({
                ...prev,
                secondary: [...prev.secondary.slice(0, index), value, ...prev.secondary.slice(index + 1)]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let productData;
            
            // Check if we have file uploads
            if (formData.primaryImage instanceof File || formData.secondaryImages.length > 0) {
                // Use FormData for file uploads
                const formDataToSend = new FormData();
                formDataToSend.append('name', formData.name);
                formDataToSend.append('description', formData.description);
                formDataToSend.append('price', formData.price);
                formDataToSend.append('category', formData.category);
                if (formData.subcategory) formDataToSend.append('subcategory', formData.subcategory);
                formDataToSend.append('brand', formData.brand);
                formDataToSend.append('countInStock', formData.countInStock);
                
                // Add primary image file
                if (formData.primaryImage instanceof File) {
                    formDataToSend.append('images', formData.primaryImage);
                }
                
                // Add secondary image files
                formData.secondaryImages.forEach(file => {
                    if (file instanceof File) {
                        formDataToSend.append('images', file);
                    }
                });
                
                // Add URL-based images
                if (formData.primaryImageUrl && !formData.primaryImage) {
                    formDataToSend.append('primaryImageUrl', formData.primaryImageUrl);
                }
                if (formData.secondaryImageUrls.length > 0) {
                    const validUrls = formData.secondaryImageUrls.filter(url => url.trim());
                    if (validUrls.length > 0) {
                        formDataToSend.append('secondaryImageUrls', validUrls.join(','));
                    }
                }
                
                productData = formDataToSend;
            } else {
                // Use JSON for URL-only images
                productData = {
                    name: formData.name,
                    description: formData.description,
                    price: formData.price,
                    category: formData.category,
                    subcategory: formData.subcategory,
                    brand: formData.brand,
                    countInStock: formData.countInStock,
                    primaryImageUrl: formData.primaryImageUrl,
                    secondaryImageUrls: formData.secondaryImageUrls.filter(url => url.trim())
                };
            }
            
            await updateProduct(id, productData);
            
            toast({
                title: t("statusUpdated"),
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            
            navigate(`/admin/products/${id}`);
        } catch (err) {
            toast({
                title: 'Error',
                description: err.response?.data?.message || t("error"),
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteProduct(id);
            
            toast({
                title: 'Product deleted successfully',
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            
            navigate('/admin/products');
        } catch (err) {
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to delete product',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
            setIsDeleting(false);
        }
    };

    const getAllImages = () => {
        const images = [];
        if (imagePreview.primary) images.push(imagePreview.primary);
        if (imagePreview.secondary.length > 0) {
            images.push(...imagePreview.secondary);
        }
        return images;
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
                    Back to Products
                </Button>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box p={6} minHeight="100vh" bg={bgColor}>
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    Product not found
                </Alert>
                <Button mt={4} onClick={() => navigate('/admin/products')}>
                    Back to Products
                </Button>
            </Box>
        );
    }

    return (
        <Box minHeight="100vh" bg={bgColor} p={6}>
            <Box maxWidth="1400px" mx="auto">
                {/* Breadcrumb */}
                <Breadcrumb mb={6} direction={isRtl ? 'row-reverse' : 'row'}>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to="/admin/dashboard">{t("dashboard")}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to="/admin/products">{t("products")}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to={`/admin/products/${id}`}>{product.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink>{t("edit")}</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                {/* Header */}
                <Flex justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap" gap={4}>
                    <Heading as="h1" size="xl">{t("editProduct")}</Heading>
                    <HStack spacing={3}>
                        <Button
                            leftIcon={<FiTrash2 />}
                            colorScheme="red"
                            onClick={() => setDeleteDialogOpen(true)}
                            variant="outline"
                        >
                            Delete Product
                        </Button>
                        <Button
                            leftIcon={<FiArrowLeft />}
                            onClick={() => navigate(`/admin/products/${id}`)}
                            variant="outline"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            leftIcon={<FiSave />}
                            colorScheme="blue"
                            type="submit"
                            form="edit-product-form"
                        >
                            {t('saveChanges')}
                        </Button>
                    </HStack>
                </Flex>

                {/* Product Preview */}
                <Card bg={cardBg} boxShadow="md" borderRadius="lg" mb={6}>
                    <CardHeader>
                        <Heading size="md">{t("productPreview")}</Heading>
                    </CardHeader>
                    <CardBody>
                        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
                            <Box flex={1}>
                                <AspectRatio ratio={1} mb={4}>
                                    <Image
                                        src={imagePreview.primary || '/images/sample.jpg'}
                                        alt={formData.name}
                                        objectFit="cover"
                                        borderRadius="md"
                                        fallbackSrc="/images/sample.jpg"
                                    />
                                </AspectRatio>
                                <Text fontWeight="bold" mb={2}>{formData.name}</Text>
                                <Text fontSize="xl" fontWeight="bold" color="blue.600" mb={2}>
                                    ${formData.price.toFixed(2)}
                                </Text>
                                <Badge colorScheme={formData.countInStock > 0 ? 'green' : 'red'}>
                                    {formData.countInStock > 0 ? `${formData.countInStock} in stock` : 'Out of stock'}
                                </Badge>
                            </Box>
                            <Box flex={1}>
                                <Text fontWeight="bold" mb={2}>Description:</Text>
                                <Text mb={4}>{formData.description || 'No description provided'}</Text>
                                
                                <SimpleGrid columns={2} spacing={4}>
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500">{t("category")}</Text>
                                        <Text>{categories.find(c => c._id === formData.category)?.name || formData.category}</Text>
                                    </Box>
                                    {formData.subcategory && (
                                        <Box>
                                            <Text fontWeight="bold" fontSize="sm" color="gray.500">{t("subcategory")}</Text>
                                            <Badge colorScheme="purple">{formData.subcategory}</Badge>
                                        </Box>
                                    )}
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500">{t("brand")}</Text>
                                        <Text>{formData.brand}</Text>
                                    </Box>
                                </SimpleGrid>
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>

                {/* Edit Form */}
                <Card bg={cardBg} boxShadow="md" borderRadius="lg">
                    <CardHeader>
                        <Heading size="md">{t("productInformation")}</Heading>
                    </CardHeader>
                    <CardBody>
                        <form id="edit-product-form" onSubmit={handleSubmit}>
                            <Tabs variant="soft-rounded" colorScheme="blue">
                                <TabList mb={4}>
                                    <Tab>{t("basicInfo")}</Tab>
                                    <Tab>{t("images")}</Tab>
                                </TabList>
                                
                                <TabPanels>
                                    <TabPanel>
                                        <VStack spacing={4}>
                                            <FormControl isRequired>
                                                <FormLabel>{t("productName")}</FormLabel>
                                                <Input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder={t("productNamePlaceholder")}
                                                />
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel>{t("description")}</FormLabel>
                                                <Textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    placeholder={t("productDescriptionPlaceholder")}
                                                    rows={6}
                                                />
                                            </FormControl>

                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                                <FormControl isRequired>
                                                    <FormLabel>Price ($)</FormLabel>
                                                    <NumberInput
                                                        value={formData.price}
                                                        onChange={(value) => handleNumberChange('price', value)}
                                                        min={0}
                                                        step={0.01}
                                                    >
                                                        <NumberInputField name="price" />
                                                    </NumberInput>
                                                </FormControl>

                                                <FormControl isRequired>
                                                    <FormLabel>{t("stockQuantity")}</FormLabel>
                                                    <NumberInput
                                                        value={formData.countInStock}
                                                        onChange={(value) => handleNumberChange('countInStock', value)}
                                                        min={0}
                                                    >
                                                        <NumberInputField name="countInStock" />
                                                    </NumberInput>
                                                </FormControl>
                                            </SimpleGrid>

                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                                <FormControl isRequired>
                                                    <FormLabel>{t("category")}</FormLabel>
                                                    <Select
                                                        name="category"
                                                        value={formData.category}
                                                        onChange={handleInputChange}
                                                        placeholder={t("selectCategoryPlaceholder")}
                                                    >
                                                        {categories.map((category) => (
                                                            <option key={category._id} value={category._id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </Select>
                                                </FormControl>

                                                <FormControl>
                                                    <FormLabel>{t("subcategory")}</FormLabel>
                                                    <Select
                                                        name="subcategory"
                                                        value={formData.subcategory}
                                                        onChange={handleInputChange}
                                                        placeholder={t("selectSubcategoryPlaceholder")}
                                                        isDisabled={!formData.category || subcategories.length === 0}
                                                    >
                                                        {subcategories.map((sub, index) => (
                                                            <option key={index} value={sub.name}>
                                                                {sub.name}
                                                            </option>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </SimpleGrid>

                                            <FormControl isRequired>
                                                <FormLabel>{t("brand")}</FormLabel>
                                                <Input
                                                    name="brand"
                                                    value={formData.brand}
                                                    onChange={handleInputChange}
                                                    placeholder={t("brandNamePlaceholder")}
                                                />
                                            </FormControl>
                                        </VStack>
                                    </TabPanel>

                                    <TabPanel>
                                        <VStack spacing={6}>
                                            {/* Primary Image Section */}
                                            <Box w="full">
                                                <FormLabel fontWeight="bold">{t("primaryImage")}</FormLabel>
                                                <Text fontSize="sm" color="gray.500" mb={2}>
                                                    Upload from computer or provide image URL
                                                </Text>
                                                
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                    <Box>
                                                        <Button
                                                            leftIcon={<FiUpload />}
                                                            onClick={() => fileInputRef.current?.click()}
                                                            w="full"
                                                            variant="outline"
                                                        >
                                                            Upload Image
                                                        </Button>
                                                        <Input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handlePrimaryImageUpload}
                                                            display="none"
                                                        />
                                                        {imagePreview.primary && (
                                                            <Box mt={2}>
                                                                <Image
                                                                    src={imagePreview.primary}
                                                                    alt="Primary preview"
                                                                    boxSize="100px"
                                                                    objectFit="cover"
                                                                    borderRadius="md"
                                                                />
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    
                                                    <Box>
                                                        <Input
                                                            placeholder={t("imageUrlPlaceholder")}
                                                            value={formData.primaryImageUrl}
                                                            onChange={(e) => {
                                                                setFormData(prev => ({ 
                                                                    ...prev, 
                                                                    primaryImageUrl: e.target.value, 
                                                                    primaryImage: null 
                                                                }));
                                                                setImagePreview(prev => ({ 
                                                                    ...prev, 
                                                                    primary: e.target.value 
                                                                }));
                                                            }}
                                                        />
                                                    </Box>
                                                </SimpleGrid>
                                            </Box>

                                            <Divider />

                                            {/* Secondary Images Section */}
                                            <Box w="full">
                                                <FormLabel fontWeight="bold">
                                                    {t("secondaryImages")} ({formData.secondaryImages.length + formData.secondaryImageUrls.length}/5)
                                                </FormLabel>
                                                <Text fontSize="sm" color="gray.500" mb={2}>
                                                    {t("uploadImagesDescription")}
                                                </Text>
                                                
                                                <HStack spacing={2} mb={4}>
                                                    <Button
                                                        leftIcon={<FiUpload />}
                                                        onClick={() => secondaryFileInputRef.current?.click()}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        {t("uploadImages")}
                                                    </Button>
                                                    <Input
                                                        ref={secondaryFileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleSecondaryImagesUpload}
                                                        display="none"
                                                    />
                                                    
                                                    <Button
                                                        leftIcon={<FiLink />}
                                                        onClick={addSecondaryImageUrl}
                                                        variant="outline"
                                                        size="sm"
                                                        isDisabled={formData.secondaryImages.length + formData.secondaryImageUrls.length >= 5}
                                                    >
                                                        {t("addUrl")}
                                                    </Button>
                                                </HStack>
                                                
                                                {/* Display secondary images */}
                                                {getAllImages().length > 1 && (
                                                    <SimpleGrid columns={3} spacing={2} mt={4}>
                                                        {getAllImages().map((img, index) => {
                                                            // Skip the primary image (index 0)
                                                            if (index === 0 && img === imagePreview.primary) return null;
                                                            const actualIndex = img === imagePreview.primary ? -1 : 
                                                                imagePreview.secondary.findIndex(s => s === img);
                                                            if (actualIndex === -1 && img !== imagePreview.primary) return null;
                                                            
                                                            return (
                                                                <Box key={index} position="relative">
                                                                    <Image
                                                                        src={img}
                                                                        alt={`Secondary ${actualIndex + 1}`}
                                                                        boxSize="100px"
                                                                        objectFit="cover"
                                                                        borderRadius="md"
                                                                        fallbackSrc="/images/sample.jpg"
                                                                    />
                                                                    <IconButton
                                                                        icon={<FiX />}
                                                                        aria-label="Remove"
                                                                        size="xs"
                                                                        colorScheme="red"
                                                                        position="absolute"
                                                                        top={1}
                                                                        right={1}
                                                                        onClick={() => {
                                                                            const isUrl = !formData.secondaryImages[actualIndex];
                                                                            removeSecondaryImage(actualIndex, isUrl);
                                                                        }}
                                                                    />
                                                                </Box>
                                                            );
                                                        })}
                                                    </SimpleGrid>
                                                )}
                                                
                                                {/* URL input fields for secondary images */}
                                                {formData.secondaryImageUrls.map((url, urlIndex) => (
                                                    <Flex key={`url-${urlIndex}`} mt={2}>
                                                        <Input
                                                            placeholder={t("enterImageUrlPlaceholder")}
                                                            value={url}
                                                            onChange={(e) => updateSecondaryImageUrl(urlIndex, e.target.value)}
                                                            mr={2}
                                                        />
                                                        <IconButton
                                                            icon={<FiX />}
                                                            aria-label="Remove URL"
                                                            size="sm"
                                                            colorScheme="red"
                                                            onClick={() => removeSecondaryImage(urlIndex, true)}
                                                        />
                                                    </Flex>
                                                ))}
                                            </Box>

                                            {/* Image Preview Summary */}
                                            {getAllImages().length > 0 && (
                                                <Box w="full" mt={4}>
                                                    <Text fontWeight="bold" mb={3}>{t("allImagesPreview")}</Text>
                                                    <Wrap spacing={3}>
                                                        {getAllImages().map((img, idx) => (
                                                            <WrapItem key={idx}>
                                                                <Box position="relative" borderRadius="md" overflow="hidden" borderWidth="1px" borderColor="gray.200">
                                                                    <AspectRatio ratio={1} width="80px">
                                                                        <Image
                                                                            src={img}
                                                                            alt={`Preview ${idx + 1}`}
                                                                            objectFit="cover"
                                                                            fallbackSrc="/images/sample.jpg"
                                                                        />
                                                                    </AspectRatio>
                                                                    <Tag
                                                                        size="sm"
                                                                        position="absolute"
                                                                        top="1"
                                                                        right="1"
                                                                        colorScheme={idx === 0 ? 'blue' : 'gray'}
                                                                    >
                                                                        {idx === 0 ? t("primary") : `${t("image")} ${idx}`}
                                                                    </Tag>
                                                                </Box>
                                                            </WrapItem>
                                                        ))}
                                                    </Wrap>
                                                    <Text fontSize="sm" color="gray.500" mt={2}>
                                                        {t("imagePreviewDescription")}
                                                    </Text>
                                                </Box>
                                            )}
                                        </VStack>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </form>
                    </CardBody>
                    <CardFooter>
                        <Flex justifyContent="space-between" alignItems="center" w="full">
                            <Text fontSize="sm" color="gray.500">
                                {t("lastUpdated")}: {new Date(product.updatedAt).toLocaleString()}
                            </Text>
                            <Button
                                leftIcon={<FiSave />}
                                colorScheme="blue"
                                type="submit"
                                form="edit-product-form"
                            >
                                {t('saveChanges')}
                            </Button>
                        </Flex>
                    </CardFooter>
                </Card>
            </Box>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={deleteDialogOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            {t("deleteProduct")}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {t("deleteProductConfirmation")}
                            {getAllImages().length > 0 && (
                                <Text mt={2} fontSize="sm" color="red.500">
                                    {t("deleteProductImageWarning")}
                                </Text>
                            )}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={() => setDeleteDialogOpen(false)}>
                                {t("cancel")}
                            </Button>
                            <Button colorScheme="red" onClick={handleDelete} ml={isRtl ? 0 : 3} mr={isRtl ? 3 : 0} isLoading={isDeleting}>
                                {t("delete")}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default AdminProductEdit;