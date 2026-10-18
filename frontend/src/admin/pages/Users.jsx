import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, Select, useToast, Flex, IconButton, Badge, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, AlertDialogCloseButton, Switch, Avatar, Alert, AlertIcon } from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiUser, FiMail, FiLock, FiUnlock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { getAllUsers as getUsers, updateUser, deleteUser, getUserById } from '../services/api';

const AdminUsers = () => {
    const { t, i18n } = useTranslation("admin");
    const isRtl = i18n.language === 'ar';
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        isAdmin: false,
        address: ''
    });
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [cancelRef, setCancelRef] = useState(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
            const response = await getUsers();
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            const errorMessage = err.response?.data?.message || t("error");
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
            await updateUser(selectedUser._id, formData);
            toast({
                title: t("statusUpdated"),
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            fetchUsers();
            onClose();
        } catch (err) {
            toast({
                title: t("error"),
                description: err.response?.data?.message || t("error"),
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handleEdit = async (userId) => {
        try {
            const response = await getUserById(userId);
            setSelectedUser(response.data);
            setFormData({
                name: response.data.name,
                email: response.data.email,
                isAdmin: response.data.isAdmin,
                address: response.data.address || ''
            });
            onOpen();
        } catch (err) {
            toast({
                title: t("error"),
                description: err.response?.data?.message || 'Failed to fetch user details',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handleDelete = (userId) => {
        setDeleteUserId(userId);
        onDeleteOpen();
    };

    const confirmDelete = async () => {
        try {
            await deleteUser(deleteUserId);
            toast({
                title: t("statusUpdated"),
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            fetchUsers();
            onDeleteClose();
        } catch (err) {
            toast({
                title: t("error"),
                description: err.response?.data?.message || t("error"),
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.address && user.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <Box p={6}>
                <Heading as="h2" size="xl" mb={6}>{t("userManagement")}</Heading>
                <Text>Loading users...</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={6}>
                <Heading as="h2" size="xl" mb={6}>{t("userManagement")}</Heading>
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
                <Heading as="h2" size="xl">{t("userManagement")}</Heading>
            </Flex>

            {/* User statistics */}
            <Flex mb={6} wrap="wrap" gap={4}>
                <Box bg="blue.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t("totalUsers")}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{users.length}</Text>
                </Box>
                <Box bg="green.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t("adminUsers")}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{users.filter(u => u.isAdmin).length}</Text>
                </Box>
                <Box bg="purple.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t("regularUsers")}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{users.filter(u => !u.isAdmin).length}</Text>
                </Box>
                <Box bg="orange.50" p={4} borderRadius="md" flex="1" minW="200px">
                    <Text fontSize="sm" color="gray.500">{t("usersWithAddress")}</Text>
                    <Text fontSize="2xl" fontWeight="bold">{users.filter(u => u.address).length}</Text>
                </Box>
            </Flex>

            {/* Search bar */}
            <Box mb={6}>
                <FormControl>
                    <Flex>
                        <Input
                            placeholder={t("searchUsersPlaceholder")}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            mr={2}
                        />
                        <IconButton
                            icon={<FiSearch />}
                            aria-label="Search"
                            colorScheme="blue"
                        />
                    </Flex>
                </FormControl>
            </Box>

            {/* Users table */}
            <Box bg="white" borderRadius="lg" boxShadow="md" overflow="hidden" mb={6}>
                <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>{t("id")}</Th>
                            <Th>{t("name")}</Th>
                            <Th>{t("email")}</Th>
                            <Th>{t("role")}</Th>
                            <Th>{t("address")}</Th>
                            <Th>{t("joined")}</Th>
                            <Th>{t("actions")}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentUsers.length > 0 ? (
                            currentUsers.map((user) => (
                                <Tr key={user._id} _hover={{ bg: 'gray.50' }}>
                                    <Td>
                                        <Text fontWeight="medium">{user._id.substring(0, 8)}...</Text>
                                    </Td>
                                    <Td>
                                        <Flex alignItems="center">
                                            {user.avatar ? (
                                                <Avatar size="sm" name={user.name} src={user.avatar} mr={isRtl ? 0 : 2} ml={isRtl ? 2 : 0} />
                                            ) : (
                                                <Avatar size="sm" name={user.name} mr={isRtl ? 0 : 2} ml={isRtl ? 2 : 0} />
                                            )}
                                            <Text fontWeight="medium">{user.name}</Text>
                                        </Flex>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm">{user.email}</Text>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme={user.isAdmin ? 'purple' : 'green'}>
                                            {user.isAdmin ? t("admin") : t("user")}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm" noOfLines={2}>{user.address || 'N/A'}</Text>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm">{new Date(user.createdAt).toLocaleDateString()}</Text>
                                    </Td>
                                    <Td>
                                        <Flex>
                                            <IconButton
                                                icon={<FiEdit />}
                                                aria-label="Edit User"
                                                size="sm"
                                                mr={isRtl ? 0 : 2}
                                                ml={isRtl ? 2 : 0}
                                                variant="ghost"
                                                color="blue.500"
                                                onClick={() => handleEdit(user._id)}
                                            />
                                            {!user.isAdmin && (
                                                <IconButton
                                                    icon={<FiTrash2 />}
                                                    aria-label="Delete User"
                                                    size="sm"
                                                    variant="ghost"
                                                    color="red.500"
                                                    onClick={() => handleDelete(user._id)}
                                                />
                                            )}
                                        </Flex>
                                    </Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={7} textAlign="center" py={10}>
                                    <Text color="gray.500">{t("noUsersFound")}</Text>
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

            {/* Edit User Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t("editUser")}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <form onSubmit={handleSubmit}>
                            <FormControl mb={4} isRequired>
                                <FormLabel>{t("name")}</FormLabel>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder={t("userNamePlaceholder")}
                                />
                            </FormControl>

                            <FormControl mb={4} isRequired>
                                <FormLabel>{t("email")}</FormLabel>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder={t("userEmailPlaceholder")}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel>{t("address")}</FormLabel>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder={t("userAddressPlaceholder")}
                                />
                            </FormControl>

                            <FormControl mb={6} display="flex" alignItems="center">
                                <FormLabel mb="0" mr={4}>{t("adminStatus")}</FormLabel>
                                <Switch
                                    name="isAdmin"
                                    isChecked={formData.isAdmin}
                                    onChange={handleToggleChange}
                                    colorScheme="purple"
                                />
                                <Text ml={2} fontSize="sm">
                                    {formData.isAdmin ? t("adminFullAccess") : t("regularUser")}
                                </Text>
                            </FormControl>

                            <ModalFooter>
                                <Button type="button" mr={isRtl ? 0 : 3} ml={isRtl ? 3 : 0} onClick={onClose} variant="ghost">
                                    {t("cancel")}
                                </Button>
                                <Button type="submit" colorScheme="blue">
                                    {t("updateUser")}
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
                            {t("deleteUser")}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {t("deleteUserConfirmation")}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={setCancelRef} onClick={onDeleteClose}>
                                {t("cancel")}
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={isRtl ? 0 : 3} mr={isRtl ? 3 : 0}>
                                {t("deleteUser")}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default AdminUsers;
