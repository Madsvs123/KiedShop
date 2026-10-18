import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Flex, Text, Button, useColorModeValue, IconButton, Menu, MenuButton, MenuList, MenuItem,
    useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Badge,
    HStack, VStack, Input, InputGroup, InputLeftElement, InputRightElement, Avatar, Tooltip,
    Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverArrow, Divider,
    Alert, AlertIcon, Icon
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/react';
import {
    FiMenu, FiX, FiSearch, FiUser, FiLogIn, FiLogOut, FiShoppingCart, FiChevronDown,
    FiBookOpen, FiBell, FiCheckCircle, FiInfo, FiAlertCircle, FiSettings,
    FiGlobe
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { motion } from 'framer-motion';
import {
    getNotifications, getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead
} from '../services/api';
import { initSocket, connectSocket, disconnectSocket } from '../services/socket';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

const MotionBox = motion(Box);

const Navbar = () => {
    const { t, i18n } = useTranslation('nav');
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.auth);
    const { items: cartItems = [] } = useSelector((state) => state.cart);
    const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifLoading, setNotifLoading] = useState(false);

    // Update dayjs locale when language changes
    useEffect(() => {
        dayjs.locale(i18n.language === 'ar' ? 'ar' : 'en');
    }, [i18n.language]);

    // --- Socket connection for real-time notifications ---
    useEffect(() => {
        if (!userInfo || !userInfo.token) return;

        const setupSocket = async () => {
            try {
                const socket = initSocket(userInfo.token);
                await connectSocket();

                socket.on('notification', () => {
                    fetchNotifications();
                });
            } catch (err) {
                // Silent — socket is best-effort
            }
        };

        setupSocket();

        return () => { disconnectSocket(); };
    }, [userInfo]);

    const fetchNotifications = useCallback(async () => {
        if (!userInfo) return;
        try {
            setNotifLoading(true);
            const [unreadRes, allRes] = await Promise.all([
                getUnreadNotifications(),
                getNotifications()
            ]);
            setNotifications(allRes.data || []);
            setUnreadCount(unreadRes.data?.count || 0);
        } catch (err) {
            // Silent
        } finally {
            setNotifLoading(false);
        }
    }, [userInfo]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markNotifAsRead = async (notifId, notifData) => {
        try {
            await markNotificationAsRead(notifId);
            await fetchNotifications();
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            await fetchNotifications();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const getNotifIcon = (notif) => {
        switch (notif.type) {
            case 'new-order':
            case 'order-update': return FiShoppingCart;
            case 'order-cancelled':
            case 'system-announcement': return FiAlertCircle;
            default: return FiInfo;
        }
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const bgColor = useColorModeValue('white', 'gray.800');
    const scrolledBg = useColorModeValue('rgba(255,255,255,0.95)', 'rgba(26,32,44,0.95)');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const searchBg = useColorModeValue('gray.100', 'gray.700');
    const searchBorderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.100', 'gray.700');

    const handleLogout = () => { dispatch(logout()); navigate('/login'); };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const switchLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
    };

    const isRtl = i18n.language === 'ar';

    return (
        <Box as="nav" position="sticky" top={0} zIndex={1000}
            transition="all 0.3s ease"
            bg={isScrolled ? scrolledBg : bgColor}
            backdropFilter={isScrolled ? "blur(10px)" : "none"}
            boxShadow={isScrolled ? "lg" : "sm"}
            borderBottomWidth="1px" borderColor={borderColor}>
            <Box maxW="1400px" mx="auto" px={4} py={3}>
                <Flex alignItems="center" justifyContent="space-between" gap={4}>
                    {/* Logo */}
                    <Flex alignItems="center" gap={3}>
                        <IconButton icon={<FiMenu />} display={{ base: 'flex', md: 'none' }}
                            onClick={onOpen} aria-label="Menu" variant="ghost" size="lg" />
                        <Link to="/">
                            <MotionBox whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
                                <Flex alignItems="center" gap={2}>
                                    <Box bg="teal.500" p={2} borderRadius="full" display={{ base: 'none', sm: 'block' }}>
                                        <FiBookOpen color="white" size={20} />
                                    </Box>
                                    <Box>
                                        <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold"
                                            bgGradient="linear(to-r, teal.500, blue.600)" bgClip="text" letterSpacing="tight">
                                            {t('brand')}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500" display={{ base: 'none', md: 'block' }}>
                                            {t('tagline')}
                                        </Text>
                                    </Box>
                                </Flex>
                            </MotionBox>
                        </Link>
                    </Flex>

                    {/* Search Desktop */}
                    <Box display={{ base: 'none', md: 'flex' }} flex={1} maxW="600px">
                        <form onSubmit={handleSearch} style={{ width: '100%' }}>
                            <InputGroup size="lg">
                                <InputLeftElement pointerEvents="none"><FiSearch color="teal.500" /></InputLeftElement>
                                <Input placeholder={t('searchPlaceholder')}
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    bg={searchBg} borderColor={searchBorderColor} borderRadius="full"
                                    _focus={{ bg: 'white', borderColor: 'teal.500', boxShadow: "0 0 0 2px teal.200" }}
                                    _hover={{ borderColor: 'teal.300' }} />
                                {searchQuery && (
                                    <InputRightElement width="4.5rem">
                                        <Button h="1.75rem" size="sm" onClick={() => setSearchQuery('')} variant="ghost">{t('clear')}</Button>
                                    </InputRightElement>
                                )}
                            </InputGroup>
                        </form>
                    </Box>

                    {/* Right Icons */}
                    <HStack spacing={2}>
                        {/* Language Switcher */}
                        <Tooltip label={t('language')} hasArrow>
                            <Menu>
                                <MenuButton as={IconButton}
                                    icon={<FiGlobe />}
                                    aria-label={t('language')}
                                    variant="ghost"
                                    size="md"
                                />
                                <MenuList minW="140px" shadow="lg">
                                    <MenuItem
                                        onClick={() => switchLanguage('en')}
                                        fontWeight={i18n.language === 'en' ? 'bold' : 'normal'}
                                        color={i18n.language === 'en' ? 'teal.500' : 'inherit'}
                                        icon={<Text fontSize="sm">🇺🇸</Text>}
                                    >
                                        {t('english')}
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => switchLanguage('ar')}
                                        fontWeight={i18n.language === 'ar' ? 'bold' : 'normal'}
                                        color={i18n.language === 'ar' ? 'teal.500' : 'inherit'}
                                        icon={<Text fontSize="sm">🇸🇦</Text>}
                                    >
                                        {t('arabic')}
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </Tooltip>

                        {/* Search Mobile */}
                        <IconButton icon={<FiSearch />} aria-label={t('search')} variant="ghost"
                            display={{ base: 'flex', md: 'none' }} onClick={() => navigate('/search')} />

                        {/* Notification Bell */}
                        {userInfo && (
                            <Menu closeOnSelect={false}>
                                <Tooltip label={t('notifications')} hasArrow>
                                    <MenuButton as={Box} position="relative" cursor="pointer">
                                        <IconButton icon={<FiBell />} aria-label={t('notifications')}
                                            variant="ghost" position="relative" />
                                        {unreadCount > 0 && (
                                            <Badge colorScheme="red" borderRadius="full"
                                                position="absolute" top="-2px" right="-2px"
                                                fontSize="10px" px={1.5} minW="18px" zIndex={1}>
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </Badge>
                                        )}
                                    </MenuButton>
                                </Tooltip>
                                <MenuList minWidth="360px" maxHeight="480px" overflowY="auto" p={0} zIndex={1002}>
                                    <Box position="sticky" top={0} bg={bgColor} zIndex={1}>
                                        <Flex justifyContent="space-between" alignItems="center" p={3}>
                                            <Text fontWeight="bold">{t('notifications')}</Text>
                                            {unreadCount > 0 && (
                                                <Button size="xs" colorScheme="blue" variant="ghost" onClick={markAllAsRead}>
                                                    {t('markAllRead')}
                                                </Button>
                                            )}
                                        </Flex>
                                        <Divider />
                                    </Box>
                                    {notifications.length === 0 ? (
                                        <Flex direction="column" align="center" py={8}>
                                            <Icon as={FiBell} boxSize={8} opacity={0.3} />
                                            <Text mt={2} fontSize="sm" color="gray.500">{t('noNotifications')}</Text>
                                        </Flex>
                                    ) : (
                                        notifications.map((notif) => {
                                            const NotifIcon = getNotifIcon(notif);
                                            return (
                                                <MenuItem key={notif._id}
                                                    onClick={() => markNotifAsRead(notif._id, notif)}
                                                    _hover={{ bg: hoverBg }} p={0}>
                                                    <Box w="full" p={3}
                                                        borderLeft={!notif.isRead ? `3px solid teal.400` : '3px solid transparent'}
                                                        bg={!notif.isRead ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}>
                                                        <Flex>
                                                            <Box mr={3} mt={0.5}><Icon as={NotifIcon} color="teal.500" boxSize={4} /></Box>
                                                            <Box flex="1">
                                                                <Text fontSize="sm" fontWeight={notif.isRead ? 'normal' : 'semibold'}>{notif.title}</Text>
                                                                <Text fontSize="xs" color="gray.500" noOfLines={2} mt={1}>{notif.message}</Text>
                                                                <Text fontSize="xs" color="gray.400" mt={1}>
                                                                    {new Date(notif.createdAt).toLocaleString()}
                                                                </Text>
                                                            </Box>
                                                            {!notif.isRead && (
                                                                <Box ml={2}><Badge colorScheme="red" borderRadius="full" px={1.5} fontSize="xs">{t('new')}</Badge></Box>
                                                            )}
                                                        </Flex>
                                                    </Box>
                                                </MenuItem>
                                            );
                                        })
                                    )}
                                </MenuList>
                            </Menu>
                        )}

                        {/* Cart */}
                        <Popover trigger="hover" placement="bottom-end">
                            <PopoverTrigger>
                                <Button variant="ghost" position="relative" leftIcon={<FiShoppingCart />}
                                    onClick={() => navigate('/cart')}>
                                    {t('cart')}
                                    {cartItemCount > 0 && (
                                        <Badge position="absolute" top="-1" right="-1" colorScheme="teal"
                                            borderRadius="full" fontSize="xs" px={1.5}>{cartItemCount}</Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent width="320px" shadow="lg">
                                <PopoverArrow />
                                <PopoverBody p={3}>
                                    {cartItemCount === 0 ? (
                                        <Text textAlign="center" py={4}>{t('yourCartIsEmpty')}</Text>
                                    ) : (
                                        <>
                                            <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto">
                                                {cartItems.slice(0, 4).map((item) => (
                                                    <Flex key={item.product} gap={2} align="center">
                                                        <Image src={item.image} alt={item.name} boxSize="40px" objectFit="cover" borderRadius="md" />
                                                        <Box flex={1}>
                                                            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>{item.name}</Text>
                                                            <Text fontSize="xs" color="gray.500">${item.price} x {item.qty}</Text>
                                                        </Box>
                                                        <Text fontWeight="bold" fontSize="sm">${(item.price * item.qty).toFixed(2)}</Text>
                                                    </Flex>
                                                ))}
                                            </VStack>
                                            <Divider my={3} />
                                            <Flex justify="space-between" mb={3}>
                                                <Text fontWeight="bold">{t('total')}:</Text>
                                                <Text fontWeight="bold" color="teal.500">
                                                    ${cartItems.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}
                                                </Text>
                                            </Flex>
                                            <Button colorScheme="teal" size="sm" w="full" onClick={() => navigate('/cart')}>{t('viewCart')}</Button>
                                        </>
                                    )}
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>

                        {/* User Menu */}
                        {userInfo ? (
                            <Menu>
                                <MenuButton as={Button} variant="ghost" borderRadius="full" _hover={{ bg: hoverBg }}>
                                    <Flex alignItems="center" gap={2}>
                                        <Avatar size="sm" name={userInfo.name} bg="teal.500" icon={<FiUser />} />
                                        <Text display={{ base: 'none', lg: 'block' }}>{userInfo.name}</Text>
                                        <FiChevronDown />
                                    </Flex>
                                </MenuButton>
                                <MenuList shadow="lg">
                                    <MenuItem icon={<FiUser />} onClick={() => navigate('/profile')}>{t('myProfile')}</MenuItem>
                                    <MenuItem icon={<FiShoppingCart />} onClick={() => navigate('/orders')}>{t('myOrders')}</MenuItem>
                                    {userInfo?.isAdmin && (
                                        <MenuItem icon={<FiSettings />} onClick={() => navigate('/admin/dashboard')}
                                            color="teal.500" fontWeight="semibold">{t('goToAdmin')}</MenuItem>
                                    )}
                                    <Divider />
                                    <MenuItem icon={<FiLogOut />} onClick={handleLogout} color="red.500">{t('logout')}</MenuItem>
                                </MenuList>
                            </Menu>
                        ) : (
                            <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
                                <Button leftIcon={<FiLogIn />} variant="ghost" onClick={() => navigate('/login')} size="sm">{t('login')}</Button>
                                <Button bgGradient="linear(to-r, teal.500, blue.600)" color="white"
                                    onClick={() => navigate('/register')} size="sm"
                                    _hover={{ opacity: 0.9 }} _active={{ transform: 'scale(0.98)' }}>{t('signUp')}</Button>
                            </HStack>
                        )}
                    </HStack>
                </Flex>
            </Box>

            {/* Mobile Drawer */}
            <Drawer isOpen={isOpen} placement={isRtl ? 'right' : 'left'} onClose={onClose} size="xs">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">
                        <Flex alignItems="center" gap={2}>
                            <Box bg="teal.500" p={2} borderRadius="full"><FiBookOpen color="white" size={20} /></Box>
                            <Text fontSize="lg" fontWeight="bold" bgGradient="linear(to-r, teal.500, blue.600)" bgClip="text">{t('brand')}</Text>
                        </Flex>
                    </DrawerHeader>
                    <DrawerBody>
                        <VStack spacing={4} align="stretch" mt={4}>
                            <form onSubmit={handleSearch}>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none"><FiSearch color="teal.500" /></InputLeftElement>
                                    <Input placeholder={t('searchMobilePlaceholder')} value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)} borderRadius="full" />
                                </InputGroup>
                            </form>
                            <Button leftIcon={<FiShoppingCart />} onClick={() => { navigate('/cart'); onClose(); }}
                                w="full" justifyContent="flex-start">{t('cart')} ({cartItemCount})</Button>
                            {userInfo ? (
                                <>
                                    <Button leftIcon={<FiUser />} onClick={() => { navigate('/profile'); onClose(); }}
                                        w="full" justifyContent="flex-start">{t('profile')}</Button>
                                    <Button leftIcon={<FiShoppingCart />} onClick={() => { navigate('/orders'); onClose(); }}
                                        w="full" justifyContent="flex-start">{t('orders')}</Button>
                                    <Button leftIcon={<FiLogOut />} onClick={() => { handleLogout(); onClose(); }}
                                        w="full" justifyContent="flex-start" colorScheme="red">{t('logout')}</Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={() => { navigate('/login'); onClose(); }} w="full"
                                        colorScheme="teal" variant="outline">{t('login')}</Button>
                                    <Button onClick={() => { navigate('/register'); onClose(); }} w="full"
                                        bgGradient="linear(to-r, teal.500, blue.600)" color="white">{t('signUp')}</Button>
                                </>
                            )}
                            {/* Language switch in mobile drawer */}
                            <Divider />
                            <Text fontSize="sm" fontWeight="medium" color="gray.500" px={1}>{t('language')}</Text>
                            <HStack spacing={2}>
                                <Button size="sm" variant={i18n.language === 'en' ? 'solid' : 'outline'}
                                    colorScheme="teal" flex={1}
                                    onClick={() => { switchLanguage('en'); onClose(); }}>
                                    🇺🇸 {t('english')}
                                </Button>
                                <Button size="sm" variant={i18n.language === 'ar' ? 'solid' : 'outline'}
                                    colorScheme="teal" flex={1}
                                    onClick={() => { switchLanguage('ar'); onClose(); }}>
                                    🇸🇦 {t('arabic')}
                                </Button>
                            </HStack>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

export default Navbar;
