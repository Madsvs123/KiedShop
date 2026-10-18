import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, Select, useToast, Flex, IconButton, Badge, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, AlertDialogCloseButton, Alert, AlertIcon, Switch } from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiTag, FiPercent, FiDollarSign } from 'react-icons/fi';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../services/api';

const AdminCoupons = () => {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.language === 'ar';
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [couponsPerPage] = useState(10);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        validUntil: '',
        isActive: true
    });
    const [deleteCouponId, setDeleteCouponId] = useState(null);
    const [cancelRef, setCancelRef] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
            const response = await getCoupons();
            setCoupons(response.data);
            setLoading(false);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch coupons';
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

    const handleNumberChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleToggleChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditMode) {
                await updateCoupon(selectedCoupon._id, formData);
                toast({
                    title: t('couponUpdated'),
                    status: 'success',
                    duration: 3000,
                    isClosable: true
                });
            } else {
                await createCoupon(formData);
                toast({
                    title: t('couponCreated'),
                    status: 'success',
                    duration: 3000,
                    isClosable: true
                });
            }

            fetchCoupons();
            onClose();
            resetForm();
        } catch (err) {
            toast({
                title: t('error'),
                description: err.response?.data?.message || t('failedToSaveCoupon'),
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discountType: 'percentage',
            discountValue: 0,
            validUntil: '',
            isActive: true
        });
        setIsEditMode(false);
        setSelectedCoupon(null);
    };

    const handleEdit = (coupon) => {
        setSelectedCoupon(coupon);
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
            isActive: coupon.isActive
        });
        setIsEditMode(true);
        onOpen();
    };

    const handleDelete = (couponId) => {
        setDeleteCouponId(couponId);
        onDeleteOpen();
    };

    const confirmDelete = async () => {
        try {
            await deleteCoupon(deleteCouponId);
            toast({
                title: t('couponDeleted'),
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            fetchCoupons();
            onDeleteClose();
        } catch (err) {
            toast({
                title: t('error'),
                description: err.response?.data?.message || t('failedToDeleteCoupon'),
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    // Filter coupons based on search term
    const filteredCoupons = coupons.filter(coupon =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.discountType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const indexOfLastCoupon = currentPage * couponsPerPage;
    const indexOfFirstCoupon = indexOfLastCoupon - couponsPerPage;
    const currentCoupons = filteredCoupons.slice(indexOfFirstCoupon, indexOfLastCoupon);
    const totalPages = Math.ceil(filteredCoupons.length / couponsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getDiscountDisplay = (coupon) => {
        if (coupon.discountType === 'percentage') {
            return `${coupon.discountValue}% OFF`;
        } else {
            return `$${coupon.discountValue} OFF`;
        }
    };

    const getStatusColor = (coupon) => {
        if (!coupon.isActive) return 'gray';
        const now = new Date();
        const validUntil = new Date(coupon.validUntil);
        return now > validUntil ? 'red' : 'green';
    };

    const getStatusText = (coupon) => {
        if (!coupon.isActive) return t('inactive');
        const now = new Date();
        const validUntil = new Date(coupon.validUntil);
        return now > validUntil ? t('expired') : t('active');
    };

    if (loading) {
        return (
            <Box p={6}>
                <Heading as="h2" size="xl" mb={6}>{t('couponManagement')}</Heading>
                <Text>{t('loadingCoupons')}</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={6}>
                <Heading as="h2" size="xl" mb={6}>{t('couponManagement')}</Heading>
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
                <Heading as="h2" size="xl">{t('couponManagement')}</Heading>
                <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={() => {
                        resetForm();
                        onOpen();
                    }}
                >
                    {t('addCoupon')}
                </Button>
            </Flex>

            {/* Coupon statistics */}
            <Flex mb={6} wrap="wrap" gap={4}>
                <Box bg="blue.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t('totalCoupons')}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{coupons.length}</Text>
                </Box>
                <Box bg="green.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t('activeCoupons')}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{coupons.filter(c => c.isActive).length}</Text>
                </Box>
                <Box bg="red.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t('expiredCoupons')}</Text>
                    <Text fontSize="2xl" fontWeight="bold">
                        {coupons.filter(c => c.isActive && new Date(c.validUntil) < new Date()).length}
                    </Text>
                </Box>
                <Box bg="gray.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t('inactiveCoupons')}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{coupons.filter(c => !c.isActive).length}</Text>
                </Box>
            </Flex>

            {/* Search bar */}
            <Box mb={6}>
                <FormControl>
                    <Flex>
                        <Input
                            placeholder={t('searchCouponsPlaceholder')}
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

            {/* Coupons table */}
            <Box bg="white" borderRadius="lg" boxShadow="md" overflow="hidden" mb={6}>
                <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>{t('code')}</Th>
                            <Th>{t('discount')}</Th>
                            <Th>{t('type')}</Th>
                            <Th>{t('value')}</Th>
                            <Th>{t('validUntil')}</Th>
                            <Th>{t('status')}</Th>
                            <Th>{t('actions')}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentCoupons.length > 0 ? (
                            currentCoupons.map((coupon) => (
                                <Tr key={coupon._id} _hover={{ bg: 'gray.50' }}>
                                    <Td>
                                        <Text fontWeight="medium" fontFamily="monospace">{coupon.code}</Text>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme="green">{getDiscountDisplay(coupon)}</Badge>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm">{coupon.discountType}</Text>
                                    </Td>
                                    <Td>
                                        <Text fontWeight="medium">
                                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm">{new Date(coupon.validUntil).toLocaleDateString()}</Text>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme={getStatusColor(coupon)}>
                                            {getStatusText(coupon)}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Flex>
                                            <IconButton
                                                icon={<FiEdit />}
                                                aria-label="Edit Coupon"
                                                size="sm"
                                                mr={isRtl ? 0 : 2}
                                                ml={isRtl ? 2 : 0}
                                                variant="ghost"
                                                color="blue.500"
                                                onClick={() => handleEdit(coupon)}
                                            />
                                            <IconButton
                                                icon={<FiTrash2 />}
                                                aria-label="Delete Coupon"
                                                size="sm"
                                                variant="ghost"
                                                color="red.500"
                                                onClick={() => handleDelete(coupon._id)}
                                            />
                                        </Flex>
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={7} textAlign="center" py={10}>
                                    <Text color="gray.500">{t('noCouponsFound')}</Text>
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

            {/* Add/Edit Coupon Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{isEditMode ? t('editCoupon') : t('addNewCoupon')}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <form onSubmit={handleSubmit}>
                            <FormControl mb={4} isRequired>
                                <FormLabel>{t('couponCode')}</FormLabel>
                                <Flex>
                                    <Input
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        placeholder="SUMMER2024"
                                        toUpperCase
                                    />
                                </Flex>
                            </FormControl>

                            <FormControl mb={4} isRequired>
                                <FormLabel>{t('discountType')}</FormLabel>
                                <Select
                                    name="discountType"
                                    value={formData.discountType}
                                    onChange={handleInputChange}
                                >
                                    <option value="percentage">{t('percentage')}</option>
                                    <option value="fixed">{t('fixedAmount')}</option>
                                </Select>
                            </FormControl>

                            <FormControl mb={4} isRequired>
                                <FormLabel>{t('discountValue')}</FormLabel>
                                <Flex>
                                    <Input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={(e) => handleNumberChange('discountValue', e.target.value)}
                                        min={0}
                                        step={formData.discountType === 'percentage' ? 1 : 0.01}
                                    />
                                    <Text ml={2} mt={2}>
                                        {formData.discountType === 'percentage' ? '%' : '$'}
                                    </Text>
                                </Flex>
                            </FormControl>

                            <FormControl mb={4} isRequired>
                                <FormLabel>{t('validUntil')}</FormLabel>
                                <Input
                                    type="date"
                                    name="validUntil"
                                    value={formData.validUntil}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </FormControl>

                            <FormControl mb={6} display="flex" alignItems="center">
                                <FormLabel mb="0" mr={4}>{t('active')}</FormLabel>
                                <Switch
                                    name="isActive"
                                    isChecked={formData.isActive}
                                    onChange={handleToggleChange}
                                    colorScheme="green"
                                />
                            </FormControl>

                            <ModalFooter>
                                <Button type="button" mr={3} onClick={onClose} variant="ghost">
                                    {t('cancel')}
                                </Button>
                                <Button type="submit" colorScheme="blue">
                                    {isEditMode ? t('updateCoupon') : t('addCoupon')}
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
                            {t('deleteCoupon')}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {t('deleteCouponConfirmation')}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={setCancelRef} onClick={onDeleteClose}>
                                {t('cancel')}
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                                {t('deleteCoupon')}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default AdminCoupons;
