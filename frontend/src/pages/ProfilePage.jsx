import React, { useState, useEffect } from 'react';
import {
    Box, Heading, Text, VStack, HStack, Avatar, Button, useToast,
    FormControl, FormLabel, Input, useColorModeValue,
    SimpleGrid, Card, CardBody, Divider, Icon, Spinner, Alert,
    AlertIcon, Tabs, TabList, TabPanels, Tab, TabPanel, Badge,
    Flex
} from '@chakra-ui/react';
import { FiUser, FiMail, FiMapPin, FiPhone, FiSave, FiEdit2, FiShoppingBag, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, updateUserProfile, getOrders } from '../services/api';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
    const { t } = useTranslation("pages");
    const { user, logout, updateLocalUserInfo } = useAuth();
    const toast = useToast();
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        phone: ''
    });
    
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                address: user.address || '',
                phone: user.phone || ''
            });
        }
        fetchOrders();
    }, [user]);
    
    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);
            const response = await getOrders();
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await updateUserProfile(formData);
            updateLocalUserInfo(response.data);
            toast({
                title: 'Profile updated',
                description: 'Your profile has been successfully updated.',
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            setIsEditing(false);
        } catch (error) {
            toast({
                title: 'Update failed',
                description: error.response?.data?.message || 'Failed to update profile',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };
    
    const getOrderStatusColor = (status) => {
        const colors = {
            pending: 'orange',
            processing: 'blue',
            shipped: 'purple',
            delivered: 'green',
            cancelled: 'red'
        };
        return colors[status] || 'gray';
    };
    
    if (!user) {
        return (
            <Flex justify="center" align="center" minH="400px">
                <Spinner size="xl" />
            </Flex>
        );
    }
    
    return (
        <Box maxW="1200px" mx="auto" px={4} py={8} minH="100vh" bg={bgColor}>
            <Heading size="xl" mb={8}>{t("myAccount")}</Heading>
            
            <Tabs variant="enclosed" colorScheme="teal">
                <TabList mb={6}>
                    <Tab><HStack><Icon as={FiUser} /><Text>{t("profile")}</Text></HStack></Tab>
                    <Tab><HStack><Icon as={FiShoppingBag} /><Text>{t("orders")}</Text></HStack></Tab>
                </TabList>
                
                <TabPanels>
                    {/* Profile Tab */}
                    <TabPanel p={0}>
                        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
                            {/* Profile Info Card */}
                            <Card bg={cardBg} borderRadius="lg" boxShadow="sm" p={6}>
                                <VStack spacing={4}>
                                    <Avatar size="2xl" name={user.name} bg="teal.500" icon={<FiUser size={40} />} />
                                    <Heading size="md">{user.name}</Heading>
                                    <Text color="gray.500">{user.email}</Text>
                                    <Badge colorScheme={user.isAdmin ? 'purple' : 'green'}>
                                        {user.isAdmin ? 'Admin' : 'Customer'}
                                    </Badge>
                                    <Button
                                        leftIcon={<FiEdit2 />}
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsEditing(!isEditing)}
                                        w="full"
                                    >
                                        {isEditing ? t("cancel") : t("editProfile")}
                                    </Button>
                                    <Button
                                        leftIcon={<FiLogOut />}
                                        size="sm"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={logout}
                                        w="full"
                                    >
                                        Logout
                                    </Button>
                                </VStack>
                            </Card>
                            
                            {/* Edit Form Card */}
                            <Card bg={cardBg} borderRadius="lg" boxShadow="sm" p={6} gridColumn={{ lg: 'span 2' }}>
                                <Heading size="md" mb={6}>
                                    {isEditing ? t("editProfileInformation") : t("profileInformation")}
                                </Heading>
                                
                                {!isEditing ? (
                                    <VStack spacing={4} align="stretch">
                                        <HStack>
                                            <Icon as={FiUser} color="gray.400" />
                                            <Box>
                                                <Text fontSize="sm" color="gray.500">{t("fullName")}</Text>
                                                <Text fontWeight="medium">{user.name}</Text>
                                            </Box>
                                        </HStack>
                                        <Divider />
                                        <HStack>
                                            <Icon as={FiMail} color="gray.400" />
                                            <Box>
                                                <Text fontSize="sm" color="gray.500">{t("emailAddress")}</Text>
                                                <Text fontWeight="medium">{user.email}</Text>
                                            </Box>
                                        </HStack>
                                        <Divider />
                                        <HStack>
                                            <Icon as={FiMapPin} color="gray.400" />
                                            <Box flex={1}>
                                                <Text fontSize="sm" color="gray.500">{t("address")}</Text>
                                                <Text fontWeight="medium">{user.address || 'Not provided'}</Text>
                                            </Box>
                                        </HStack>
                                        <Divider />
                                        <HStack>
                                            <Icon as={FiPhone} color="gray.400" />
                                            <Box>
                                                <Text fontSize="sm" color="gray.500">{t("phoneNumber")}</Text>
                                                <Text fontWeight="medium">{user.phone || 'Not provided'}</Text>
                                            </Box>
                                        </HStack>
                                    </VStack>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <VStack spacing={4}>
                                            <FormControl>
                                                <FormLabel>{t("fullName")}</FormLabel>
                                                <Input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your full name"
                                                />
                                            </FormControl>
                                            
                                            <FormControl>
                                                <FormLabel>{t("emailAddress")}</FormLabel>
                                                <Input
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your email"
                                                />
                                            </FormControl>
                                            
                                            <FormControl>
                                                <FormLabel>{t("address")}</FormLabel>
                                                <Input
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your address"
                                                />
                                            </FormControl>
                                            
                                            <FormControl>
                                                <FormLabel>{t("phoneNumber")}</FormLabel>
                                                <Input
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your phone number"
                                                />
                                            </FormControl>
                                            
                                            <Button
                                                type="submit"
                                                colorScheme="teal"
                                                leftIcon={<FiSave />}
                                                isLoading={loading}
                                                w="full"
                                            >
                                                Save Changes
                                            </Button>
                                        </VStack>
                                    </form>
                                )}
                            </Card>
                        </SimpleGrid>
                    </TabPanel>
                    
                    {/* Orders Tab */}
                    <TabPanel p={0}>
                        <Card bg={cardBg} borderRadius="lg" boxShadow="sm">
                            <CardBody>
                                <Heading size="md" mb={4}>{t("orderHistory")}</Heading>
                                
                                {ordersLoading ? (
                                    <Flex justify="center" py={8}>
                                        <Spinner />
                                    </Flex>
                                ) : orders.length === 0 ? (
                                    <Alert status="info" borderRadius="md">
                                        <AlertIcon />
                                        {t("youHaventPlacedOrders")}
                                        <Button as={Link} to="/products" size="sm" ml={4} colorScheme="teal">
                                            {t("startShopping")}
                                        </Button>
                                    </Alert>
                                ) : (
                                    <VStack spacing={4} align="stretch">
                                        {orders.map((order) => (
                                            <Box
                                                key={order._id}
                                                p={4}
                                                borderWidth="1px"
                                                borderRadius="lg"
                                                _hover={{ shadow: 'sm' }}
                                            >
                                                <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
                                                    <HStack>
                                                        <Text fontWeight="bold">Order #{order._id?.slice(-8)}</Text>
                                                        <Badge colorScheme={getOrderStatusColor(order.status)}>
                                                            {order.status?.toUpperCase()}
                                                        </Badge>
                                                    </HStack>
                                                    <Text fontSize="sm" color="gray.500">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </Text>
                                                </Flex>
                                                
                                                <Divider mb={3} />
                                                
                                                <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                                                    <Text>
                                                        <Text as="span" fontWeight="semibold">Total:</Text> ${order.totalPrice?.toFixed(2)}
                                                    </Text>
                                                    <Text>
                                                        <Text as="span" fontWeight="semibold">Items:</Text> {order.orderItems?.length}
                                                    </Text>
                                                    <Button
                                                        as={Link}
                                                        to={`/orders/${order._id}`}
                                                        size="sm"
                                                        variant="outline"
                                                        colorScheme="teal"
                                                    >
                                                        View Details
                                                    </Button>
                                                </Flex>
                                            </Box>
                                        ))}
                                    </VStack>
                                )}
                            </CardBody>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default ProfilePage;