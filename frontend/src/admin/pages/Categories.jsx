import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, Textarea, useToast, Flex, IconButton, Badge, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, AlertDialogCloseButton, Alert, AlertIcon, Image } from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiImage, FiType, FiTag, FiSlash } from 'react-icons/fi';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminCategories = () => {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.language === 'ar';
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriesPerPage] = useState(10);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: ''
    });
    const [deleteCategoryId, setDeleteCategoryId] = useState(null);
    const [cancelRef, setCancelRef] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
            const response = await getCategories();
            setCategories(response.data);
            setLoading(false);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch categories';
            if (err.response?.status === 429) {
                setError(`Too many requests. Please try again in a few minutes. ${errorMessage}`);
            } else {
                setError(errorMessage);
            }
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

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '');
    };

    const handleNameChange = (e) => {
        const { value } = e.target;
        handleInputChange(e);
        if (!isEditMode) {
            setFormData(prev => ({
                ...prev,
                slug: generateSlug(value)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditMode) {
                await updateCategory(selectedCategory._id, formData);
                toast({
                    title: 'Category updated',
                    status: 'success',
                    duration: 3000,
                    isClosable: true
                });
            } else {
                await createCategory(formData);
                toast({
                    title: 'Category created',
                    status: 'success',
                    duration: 3000,
                    isClosable: true
                });
            }

            fetchCategories();
            onClose();
            resetForm();
        } catch (err) {
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to save category',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            image: ''
        });
        setIsEditMode(false);
        setSelectedCategory(null);
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image
        });
        setIsEditMode(true);
        onOpen();
    };

    const handleDelete = (categoryId) => {
        setDeleteCategoryId(categoryId);
        onDeleteOpen();
    };

    const confirmDelete = async () => {
        try {
            await deleteCategory(deleteCategoryId);
            toast({
                title: 'Category deleted',
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            fetchCategories();
            onDeleteClose();
        } catch (err) {
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to delete category',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    // Filter categories based on search term
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination logic
    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);
    const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <Box p={6}>
                <Heading as="h2" size="xl" mb={6}>{t('categoryManagement')}</Heading>
                <Text>{t("loading")}</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={6}>
                <Heading as="h2" size="xl" mb={6}>{t('categoryManagement')}</Heading>
                <Alert status="error">
                    <AlertIcon />
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box p={6}>
            <Flex justifyContent="space-between" alignItems="center" mb={6}>
                <Heading as="h2" size="xl">{t('categoryManagement')}</Heading>
                <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={() => {
                        resetForm();
                        onOpen();
                    }}
                >
                    {t("addCategory")}
                </Button>
            </Flex>

            {/* Category statistics */}
            <Flex mb={6} wrap="wrap" gap={4}>
                <Box bg="blue.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t("totalCategories")}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{categories.length}</Text>
                </Box>
                <Box bg="green.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t("categoriesWithImages")}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{categories.filter(c => c.image).length}</Text>
                </Box>
                <Box bg="purple.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t('categoriesWithDescriptions')}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{categories.filter(c => c.description).length}</Text>
                </Box>
            </Flex>

            {/* Search bar */}
            <Box mb={6}>
                <FormControl>
                    <Flex>
                        <Input
                            placeholder={t('searchCategoriesPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            mr={isRtl ? 0 : 2}
                            ml={isRtl ? 2 : 0}
                        />
                        <IconButton
                            icon={<FiSearch />}
                            aria-label={t('search')}
                            colorScheme="blue"
                        />
                    </Flex>
                </FormControl>
            </Box>

            {/* Categories table */}
            <Box bg="white" borderRadius="lg" boxShadow="md" overflow="hidden" mb={6}>
                <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>{t('name')}</Th>
                            <Th>{t('slug')}</Th>
                            <Th>{t('description')}</Th>
                            <Th>{t('image')}</Th>
                            <Th>{t('products')}</Th>
                            <Th>{t('actions')}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentCategories.length > 0 ? (
                            currentCategories.map((category) => (
                                <Tr key={category._id} _hover={{ bg: 'gray.50' }}>
                                    <Td>
                                        <Flex alignItems="center">
                                            <Text fontWeight="medium">{category.name}</Text>
                                        </Flex>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm" color="gray.600">/{category.slug}</Text>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm" noOfLines={2}>{category.description || t('na')}</Text>
                                    </Td>
                                    <Td>
                                        {category.image ? (
                                            <Image
                                                src={category.image}
                                                alt={category.name}
                                                boxSize="40px"
                                                objectFit="cover"
                                                borderRadius="md"
                                            />
                                        ) : (
                                            <IconButton
                                                icon={<FiImage />}
                                                aria-label="No image"
                                                size="sm"
                                                variant="ghost"
                                                isDisabled
                                            />
                                        )}
                                    </Td>
                                    <Td>
                                        <Badge colorScheme="blue">
                                            {Math.floor(Math.random() * 50)} products
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Flex>
                                            <IconButton
                                                icon={<FiEdit />}
                                                aria-label="Edit Category"
                                                size="sm"
                                                mr={2}
                                                variant="ghost"
                                                color="blue.500"
                                                onClick={() => navigate(`/admin/categories/edit/${category._id}`)}
                                            />
                                            <IconButton
                                                icon={<FiTrash2 />}
                                                aria-label="Delete Category"
                                                size="sm"
                                                variant="ghost"
                                                color="red.500"
                                                onClick={() => handleDelete(category._id)}
                                            />
                                        </Flex>
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={6} textAlign="center" py={10}>
                                    <Text color="gray.500">{t('noCategoriesFound')}</Text>
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

            {/* Add/Edit Category Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{isEditMode ? t('editCategory') : t('addNewCategory')}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <form onSubmit={handleSubmit}>
                            <FormControl mb={4} isRequired>
                                <FormLabel>{t('name')}</FormLabel>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    placeholder={t('categoryNamePlaceholder')}
                                />
                            </FormControl>

                            <FormControl mb={4} isRequired>
                                <FormLabel>{t('slug')}</FormLabel>
                                <Flex>
                                    <Text mr={2} mt={2}>/</Text>
                                    <Input
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        placeholder={t("slugPlaceholder")}
                                    />
                                </Flex>
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {t('slugAutoGenerated')}
                                </Text>
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel>{t('description')}</FormLabel>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Category description"
                                    rows={4}
                                />
                            </FormControl>

                            <FormControl mb={6}>
                                <FormLabel>{t('imageUrl')}</FormLabel>
                                <Input
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    placeholder={t('imageUrlPlaceholder')}
                                />
                                {formData.image && (
                                    <Box mt={2}>
                                        <Image
                                            src={formData.image}
                                            alt="Preview"
                                            maxH="200px"
                                            objectFit="contain"
                                            borderRadius="md"
                                        />
                                    </Box>
                                )}
                            </FormControl>

                            <ModalFooter>
                                <Button type="button" mr={3} onClick={onClose} variant="ghost">
                                    {t('cancel')}
                                </Button>
                                <Button type="submit" colorScheme="blue">
                                    {isEditMode ? t('updateCategory') : t('addCategory')}
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            {t('deleteCategory')}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {t('deleteCategoryConfirmation')}
                            <Text mt={2} color="red.500" fontWeight="medium">
                                {t('deleteCategoryWarning')}
                            </Text>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={setCancelRef} onClick={onDeleteClose}>
                                {t('cancel')}
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                                {t('deleteCategory')}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default AdminCategories;
