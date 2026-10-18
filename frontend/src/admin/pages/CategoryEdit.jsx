import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, Heading, Text, Flex, Button, FormControl, FormLabel, Input, Textarea, useToast, Card, CardHeader, CardBody, CardFooter, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Alert, AlertIcon, Spinner, useColorModeValue, HStack, VStack } from '@chakra-ui/react';
import { FiArrowLeft, FiSave, FiTrash2 } from 'react-icons/fi';
import { getCategoryById, updateCategory, deleteCategory } from '../services/api';

const AdminCategoryEdit = () => {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.language === 'ar';
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const toast = useToast();
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    useEffect(() => {
        fetchCategory();
    }, [id]);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const response = await getCategoryById(id);
            setCategory(response.data);
            
            setFormData({
                name: response.data.name,
                description: response.data.description || '',
                image: response.data.image || ''
            });
            
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch category');
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await updateCategory(id, formData);
            
            toast({
                title: 'Category updated',
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            
            navigate('/admin/categories');
        } catch (err) {
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to update category',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this category? This will not delete products in this category.')) {
            try {
                setIsDeleting(true);
                await deleteCategory(id);
                
                toast({
                    title: 'Category deleted',
                    status: 'success',
                    duration: 3000,
                    isClosable: true
                });
                
                navigate('/admin/categories');
            } catch (err) {
                toast({
                    title: 'Error',
                    description: err.response?.data?.message || 'Failed to delete category',
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                });
                setIsDeleting(false);
            }
        }
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
                <Button mt={4} onClick={() => navigate('/admin/categories')}>
                    Back to Categories
                </Button>
            </Box>
        );
    }

    if (!category) {
        return (
            <Box p={6} minHeight="100vh" bg={bgColor}>
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    Category not found
                </Alert>
                <Button mt={4} onClick={() => navigate('/admin/categories')}>
                    Back to Categories
                </Button>
            </Box>
        );
    }

    return (
        <Box minHeight="100vh" bg={bgColor} p={6}>
            <Box maxWidth="1200px" mx="auto">
                {/* Breadcrumb */}
                <Breadcrumb mb={6} direction={isRtl ? 'row-reverse' : 'row'}>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to="/admin/dashboard">{t('dashboard')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to="/admin/categories">{t('categories')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink>{t('editCategory', { name: category.name })}</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                {/* Header */}
                <Flex justifyContent="space-between" alignItems="center" mb={6}>
                    <Heading as="h1" size="xl">{t('editCategory', { name: category.name })}</Heading>
                    <HStack spacing={3}>
                        <Button
                            leftIcon={<FiTrash2 />}
                            colorScheme="red"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            variant="outline"
                        >
                            {t('deleteCategory')}
                        </Button>
                        <Button
                            leftIcon={<FiArrowLeft />}
                            onClick={() => navigate('/admin/categories')}
                            variant="outline"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            leftIcon={<FiSave />}
                            colorScheme="blue"
                            type="submit"
                            form="edit-category-form"
                        >
                            {t('saveChanges')}
                        </Button>
                    </HStack>
                </Flex>

                {/* Edit Form */}
                <Card bg={cardBg} boxShadow="md" borderRadius="lg">
                    <CardHeader>
                        <Heading size="md">{t('categoryInformation')}</Heading>
                    </CardHeader>
                    <CardBody>
                        <form id="edit-category-form" onSubmit={handleSubmit}>
                            <VStack spacing={6}>
                                <FormControl isRequired>
                                    <FormLabel>{t('categoryName')}</FormLabel>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder={t('categoryNamePlaceholder')}
                                        autoFocus
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>{t('description')}</FormLabel>
                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder={t('categoryDescriptionPlaceholder')}
                                        rows={6}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>{t('imageUrl')}</FormLabel>
                                    <Input
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        placeholder={t('imageUrlPlaceholder')}
                                    />
                                </FormControl>

                                {/* Image Preview */}
                                {formData.image && (
                                    <Box>
                                        <Text fontWeight="bold" mb={2}>{t('imagePreview')}</Text>
                                        <Box maxW="200px" borderWidth="1px" borderRadius="md" borderColor="gray.200" p={2}>
                                            <img
                                                src={formData.image}
                                                alt="Category preview"
                                                style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/images/sample.jpg';
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                )}

                                {/* t("submit") Button (hidden, triggered by header button) */}
                                    <Button type="submit" display="none">{t('submit')}</Button>
                            </VStack>
                        </form>
                    </CardBody>
                    <CardFooter>
                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="sm" color="gray.500">
                                Created: {new Date(category.createdAt).toLocaleDateString()}
                            </Text>
                            <Button
                                leftIcon={<FiSave />}
                                colorScheme="blue"
                                type="submit"
                                form="edit-category-form"
                            >
                                    {t('saveChanges')}
                            </Button>
                        </Flex>
                    </CardFooter>
                </Card>
            </Box>
        </Box>
    );
};

export default AdminCategoryEdit;