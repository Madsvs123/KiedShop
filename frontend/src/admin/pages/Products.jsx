// Correct imports for Products.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, Button, 
    useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, 
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, 
    Input, Textarea, Select, NumberInput, NumberInputField, useToast, 
    Flex, IconButton, Badge, AlertDialog, AlertDialogBody, 
    AlertDialogFooter, AlertDialogHeader, AlertDialogContent, 
    AlertDialogOverlay, Alert, AlertIcon, Image, HStack, VStack, 
    Tabs, TabList, TabPanels, Tab, TabPanel, SimpleGrid, Divider,
    Spinner
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiUpload, FiLink, FiImage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategoryTree } from '../services/api';

const AdminProducts = () => {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.language === 'ar';
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);
    const [selectedProduct, setSelectedProduct] = useState(null);

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
    
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteProductId, setDeleteProductId] = useState(null);
    const [cancelRef, setCancelRef] = useState(null);
    const fileInputRef = useRef(null);
    const secondaryFileInputRef = useRef(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Update subcategories when category changes
        if (formData.category) {
            const selectedCategory = categories.find(cat => cat._id === formData.category);
            if (selectedCategory && selectedCategory.subcategories) {
                setSubcategories(selectedCategory.subcategories);
            } else {
                setSubcategories([]);
            }
        } else {
            setSubcategories([]);
        }
    }, [formData.category, categories]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                getProducts(),
                getCategoryTree()
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
            setLoading(false);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch data';
            setError(errorMessage);
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
                toast({ title: 'Please upload an image file', status: 'error', duration: 3000 });
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
        
        const newImages = [...formData.secondaryImages, ...validFiles].slice(0, 5);
        setFormData(prev => ({ ...prev, secondaryImages: newImages }));
        
        // Create previews
        validFiles.forEach(file => {
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
                secondary: prev.secondary.map((img, i) => i === index ? value : img)
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
                if (formData.primaryImageUrl) {
                    formDataToSend.append('primaryImageUrl', formData.primaryImageUrl);
                }
                if (formData.secondaryImageUrls.length > 0) {
                    formDataToSend.append('secondaryImageUrls', formData.secondaryImageUrls.join(','));
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
            
            if (isEditMode) {
                await updateProduct(selectedProduct._id, productData);
                toast({ title: 'Product updated successfully', status: 'success', duration: 3000 });
            } else {
                await createProduct(productData);
                toast({ title: 'Product created successfully', status: 'success', duration: 3000 });
            }
            
            fetchData();
            onClose();
            resetForm();
        } catch (err) {
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to save product',
                status: 'error',
                duration: 3000
            });
        }
    };

    const resetForm = () => {
        setFormData({
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
        setImagePreview({ primary: null, secondary: [] });
        setIsEditMode(false);
        setSelectedProduct(null);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category?._id || product.category,
            subcategory: product.subcategory || '',
            brand: product.brand,
            countInStock: product.countInStock,
            primaryImage: null,
            primaryImageUrl: product.primaryImage || '',
            secondaryImages: [],
            secondaryImageUrls: product.secondaryImages || []
        });
        setImagePreview({
            primary: product.primaryImage || null,
            secondary: product.secondaryImages || []
        });
        setIsEditMode(true);
        onOpen();
    };

    const handleDelete = (productId) => {
        setDeleteProductId(productId);
        onDeleteOpen();
    };

    const confirmDelete = async () => {
        try {
            await deleteProduct(deleteProductId);
            toast({ title: 'Product deleted successfully', status: 'success', duration: 3000 });
            fetchData();
            onDeleteClose();
        } catch (err) {
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to delete product',
                status: 'error',
                duration: 3000
            });
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    if (loading) {
        return (
            <Box p={6}>
                <Heading as="h2" size="xl" mb={6}>{t("productManagement")}</Heading>
                <Text>{t("loading")}</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={6}>
                <Heading as="h2" size="xl" mb={6}>{t("productManagement")}</Heading>
                <Alert status="error">
                    <AlertIcon />
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box p={6}>
            <Flex justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap" gap={4}>
                <Heading as="h2" size="xl">{t("productManagement")}</Heading>
                <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={() => { resetForm(); onOpen(); }}>
                    {t("addProduct")}
                </Button>
            </Flex>

            {/* Search bar */}
            <Box mb={6}>
                <FormControl>
                    <Flex>
                        <Input
                            placeholder={t("searchProductsPlaceholder")}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            mr={isRtl ? 0 : 2}
                            ml={isRtl ? 2 : 0}
                        />
                        <IconButton icon={<FiSearch />} aria-label="Search" colorScheme="blue" />
                    </Flex>
                </FormControl>
            </Box>

            {/* Product statistics */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                <Box bg="blue.50" p={4} borderRadius="md">
                    <Text fontSize="sm" color="gray.500">{t("totalProducts")}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{products.length}</Text>
                </Box>
                <Box bg="green.50" p={4} borderRadius="md">
                    <Text fontSize="sm" color="gray.500">{t("inStock")}</Text>
                    <Text fontSize="2xl" fontWeight="bold">
                        {products.filter(p => p.countInStock > 0).length}
                    </Text>
                </Box>
                <Box bg="red.50" p={4} borderRadius="md">
                    <Text fontSize="sm" color="gray.500">{t("outOfStock")}</Text>
                    <Text fontSize="2xl" fontWeight="bold">
                        {products.filter(p => p.countInStock === 0).length}
                    </Text>
                </Box>
                <Box bg="yellow.50" p={4} borderRadius="md">
                    <Text fontSize="sm" color="gray.500">{t("lowStock")}</Text>
                    <Text fontSize="2xl" fontWeight="bold">
                        {products.filter(p => p.countInStock > 0 && p.countInStock <= 5).length}
                    </Text>
                </Box>
            </SimpleGrid>

            {/* Products table */}
            <Box bg="white" borderRadius="lg" boxShadow="md" overflow="auto" mb={6}>
                <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>{t("image")}</Th>
                            <Th>{t("name")}</Th>
                            <Th>{t("price")}</Th>
                            <Th>{t("category")}/{t("subcategory")}</Th>
                            <Th>{t("brand")}</Th>
                            <Th>{t("stock")}</Th>
                            <Th>{t("actions")}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentProducts.length > 0 ? (
                            currentProducts.map((product) => (
                                <Tr key={product._id} _hover={{ bg: 'gray.50' }}>
                                    <Td>
                                        <Image
                                            src={product.primaryImage || '/images/sample.jpg'}
                                            alt={product.name}
                                            boxSize="50px"
                                            objectFit="cover"
                                            borderRadius="md"
                                            fallbackSrc="/images/sample.jpg"
                                        />
                                    </Td>
                                    <Td>
                                        <Text fontWeight="medium">{product.name}</Text>
                                        <Text fontSize="xs" color="gray.500">{product._id.substring(0, 8)}...</Text>
                                    </Td>
                                    <Td fontWeight="bold" color="blue.600">${product.price.toFixed(2)}</Td>
                                    <Td>
                                        <Text>{product.category?.name || product.category}</Text>
                                        {product.subcategory && (
                                            <Badge size="sm" colorScheme="purple" mt={1}>{product.subcategory}</Badge>
                                        )}
                                    </Td>
                                    <Td>{product.brand}</Td>
                                    <Td>
                                        <Badge colorScheme={product.countInStock > 10 ? 'green' : product.countInStock > 0 ? 'yellow' : 'red'}>
                                            {product.countInStock}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <HStack spacing={1}>
                                            <IconButton
                                                icon={<FiEye />}
                                                aria-label="View"
                                                size="sm"
                                                variant="ghost"
                                                color="blue.500"
                                                onClick={() => navigate(`/admin/products/${product._id}`)}
                                            />
                                            <IconButton
                                                icon={<FiEdit />}
                                                aria-label="Edit"
                                                size="sm"
                                                variant="ghost"
                                                color="green.500"
                                                onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                            />
                                            <IconButton
                                                icon={<FiTrash2 />}
                                                aria-label="Delete"
                                                size="sm"
                                                variant="ghost"
                                                color="red.500"
                                                onClick={() => handleDelete(product._id)}
                                            />
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={8} textAlign="center" py={10}>
                                    <Text color="gray.500">{t("noProductsFound")}</Text>
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Flex justifyContent="center" mb={6}>
                    <HStack>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                            <Button
                                key={number}
                                size="sm"
                                onClick={() => setCurrentPage(number)}
                                colorScheme={currentPage === number ? 'blue' : 'gray'}
                                variant={currentPage === number ? 'solid' : 'outline'}
                            >
                                {number}
                            </Button>
                        ))}
                    </HStack>
                </Flex>
            )}

            {/* Add/Edit Product Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent maxW="800px">
                    <ModalHeader>{isEditMode ? t("editProduct") : t("addNewProduct")}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <form id="product-form" onSubmit={handleSubmit}>
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
                                                    rows={4}
                                                />
                                            </FormControl>

                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                                <FormControl isRequired>
                                                    <FormLabel>{t("price")}</FormLabel>
                                                    <NumberInput
                                                        value={formData.price}
                                                        onChange={(value) => handleNumberChange('price', value)}
                                                        min={0}
                                                        step={0.01}
                                                    >
                                                        <NumberInputField name="price" placeholder={t("pricePlaceholder")} />
                                                    </NumberInput>
                                                </FormControl>

                                                <FormControl isRequired>
                                                    <FormLabel>{t("stockQuantity")}</FormLabel>
                                                    <NumberInput
                                                        value={formData.countInStock}
                                                        onChange={(value) => handleNumberChange('countInStock', value)}
                                                        min={0}
                                                    >
                                                        <NumberInputField name="countInStock" placeholder={t("stockPlaceholder")} />
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
                                                        isDisabled={!formData.category}
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
                                                                setFormData(prev => ({ ...prev, primaryImageUrl: e.target.value, primaryImage: null }));
                                                                setImagePreview(prev => ({ ...prev, primary: e.target.value }));
                                                            }}
                                                        />
                                                    </Box>
                                                </SimpleGrid>
                                            </Box>

                                            <Divider />

                                            {/* Secondary Images Section */}
                                            <Box w="full">
                                                <FormLabel fontWeight="bold">Secondary Images (Max 5)</FormLabel>
                                                <Text fontSize="sm" color="gray.500" mb={2}>
                                                    Upload multiple images from computer or add image URLs
                                                </Text>
                                                
                                                <Button
                                                    leftIcon={<FiUpload />}
                                                    onClick={() => secondaryFileInputRef.current?.click()}
                                                    variant="outline"
                                                    size="sm"
                                                    mb={4}
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
                                                    ml={2}
                                                    mb={4}
                                                >
                                                    {t("addImageUrl")}
                                                </Button>
                                                
                                                {/* Display secondary images */}
                                                {imagePreview.secondary.length > 0 && (
                                                    <SimpleGrid columns={3} spacing={2} mt={4}>
                                                        {imagePreview.secondary.map((img, index) => (
                                                            <Box key={index} position="relative">
                                                                <Image
                                                                    src={img}
                                                                    alt={`Secondary ${index + 1}`}
                                                                    boxSize="100px"
                                                                    objectFit="cover"
                                                                    borderRadius="md"
                                                                />
                                                                <IconButton
                                                                    icon={<FiTrash2 />}
                                                                    aria-label="Remove"
                                                                    size="xs"
                                                                    colorScheme="red"
                                                                    position="absolute"
                                                                    top={1}
                                                                    right={1}
                                                                    onClick={() => removeSecondaryImage(index, !formData.secondaryImages[index]?.name)}
                                                                />
                                                            </Box>
                                                        ))}
                                                    </SimpleGrid>
                                                )}
                                                
                                                {/* URL input fields for secondary images */}
                                                {formData.secondaryImageUrls.map((url, index) => (
                                                    <Flex key={`url-${index}`} mt={2}>
                                                        <Input
                                                            placeholder={t("enterImageUrlPlaceholder")}
                                                            value={url}
                                                            onChange={(e) => updateSecondaryImageUrl(index, e.target.value)}
                                                            mr={2}
                                                        />
                                                        <IconButton
                                                            icon={<FiTrash2 />}
                                                            aria-label="Remove URL"
                                                            size="sm"
                                                            colorScheme="red"
                                                            onClick={() => removeSecondaryImage(index, true)}
                                                        />
                                                    </Flex>
                                                ))}
                                            </Box>
                                        </VStack>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </form>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={isRtl ? 0 : 3} ml={isRtl ? 3 : 0} onClick={onClose}>
                            {t("cancel")}
                        </Button>
                        <Button colorScheme="blue" type="submit" form="product-form">
                            {isEditMode ? t("updateProduct") : t("createProduct")}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            {t("deleteProduct")}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {t("deleteProductConfirmation")}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={setCancelRef} onClick={onDeleteClose}>
                                {t("cancel")}
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={isRtl ? 0 : 3} mr={isRtl ? 3 : 0}>
                                {t("delete")}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default AdminProducts;