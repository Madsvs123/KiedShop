import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    Box, Flex, Heading, Text, Button, useColorModeValue, Icon,
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, Avatar, Menu,
    MenuButton, MenuList, MenuItem, useDisclosure, Drawer,
    DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody,
    Badge, Spinner, HStack, Tooltip, VStack, Divider,
    IconButton, Collapse
} from '@chakra-ui/react';
import {
    FiBarChart2, FiPackage, FiShoppingCart, FiUsers, FiTag, FiGift,
    FiLogOut, FiMenu, FiBell,
    FiChevronLeft, FiChevronRight, FiSettings, FiGlobe, FiExternalLink
} from 'react-icons/fi';
import { getUnreadNotifications, markNotificationAsRead, getNotifications } from '../services/api';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ar';

dayjs.extend(relativeTime);

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 64;

const AdminLayout = () => {
    const { t, i18n } = useTranslation('admin');
    const { logout, user } = useAuth();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    const isRtl = i18n.language === 'ar';

    // Update dayjs locale
    useEffect(() => {
        dayjs.locale(isRtl ? 'ar' : 'en');
    }, [isRtl]);

    const sidebarBg = useColorModeValue('gray.800', 'gray.900');
    const sidebarHover = useColorModeValue('gray.700', 'gray.700');
    const headerBg = useColorModeValue('white', 'gray.800');
    const mainBg = useColorModeValue('gray.50', 'gray.900');
    const activeColor = useColorModeValue('teal.400', 'teal.300');

    const switchLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const [unreadRes, allRes] = await Promise.all([
                getUnreadNotifications(),
                getNotifications()
            ]);
            setNotifications(allRes.data || []);
            setUnreadCount(unreadRes.data?.count || 0);
        } catch (err) { /* silent */ }
    };

    const markAsRead = async (id) => {
        try { await markNotificationAsRead(id); await fetchNotifications(); }
        catch (err) { /* silent */ }
    };

    const markAllAsRead = async () => {
        try {
            await Promise.all(notifications.filter(n => !n.isRead).map(n => markNotificationAsRead(n._id)));
            await fetchNotifications();
        } catch (err) { /* silent */ }
    };

    const NAV_ITEMS = useMemo(() => [
        { path: '/admin/dashboard', name: t('dashboard'), icon: FiBarChart2 },
        { path: '/admin/products', name: t('products'), icon: FiPackage },
        { path: '/admin/orders', name: t('orders'), icon: FiShoppingCart },
        { path: '/admin/users', name: t('users'), icon: FiUsers },
        { path: '/admin/categories', name: t('categories'), icon: FiTag },
        { path: '/admin/coupons', name: t('coupons'), icon: FiGift },
    ], [t]);

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const breadcrumbs = useMemo(() => {
        const parts = location.pathname.replace('/admin/', '').split('/').filter(Boolean);
        let current = '/admin';
        const items = [];
        for (const part of parts) {
            current += `/${part}`;
            const navItem = NAV_ITEMS.find(n => n.path === current);
            if (navItem) {
                items.push({ path: current, name: navItem.name });
            } else if (part === 'edit' || part === 'new') {
                items.push({ path: current, name: part === 'edit' ? t('edit') : t('new') });
            } else {
                items.push({ path: current, name: part.charAt(0).toUpperCase() + part.slice(1) });
            }
        }
        return items;
    }, [location, NAV_ITEMS, t]);

    const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;
    const sidebarPlacement = isRtl ? 'right' : 'left';
    const mainMarginSide = isRtl ? 'marginRight' : 'marginLeft';

    return (
        <Flex minH="100vh" direction={isRtl ? 'row-reverse' : 'row'}>
            {/* Mobile Drawer */}
            <Drawer isOpen={mobileMenuOpen} placement={sidebarPlacement} onClose={() => setMobileMenuOpen(false)}>
                <DrawerOverlay />
                <DrawerContent bg={sidebarBg} color="white">
                    <DrawerHeader borderBottomWidth="1px" borderColor="gray.700">
                        <Flex align="center" gap={2}>
                            <Icon as={FiSettings} boxSize={5} color="teal.400" />
                            <Text fontSize="lg" fontWeight="bold">{t('panel')}</Text>
                        </Flex>
                    </DrawerHeader>
                    <DrawerBody p={0}>
                        <Box as="nav" py={4}>
                            {NAV_ITEMS.map(item => (
                                <Link key={item.path} to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', padding: '12px 20px',
                                        color: isActive(item.path) ? activeColor : 'gray.300',
                                        textDecoration: 'none',
                                        borderLeft: isActive(item.path) ? `3px solid ${activeColor}` : '3px solid transparent',
                                        background: isActive(item.path) ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    }}>
                                    <Icon as={item.icon} mr={3} boxSize={5} />
                                    <Text fontSize="sm">{item.name}</Text>
                                </Link>
                            ))}
                        </Box>
                    </DrawerBody>
                    <Box p={4} borderTop="1px solid" borderColor="gray.700">
                        <Button variant="ghost" color="gray.300" w="full" justifyContent="flex-start"
                            leftIcon={<FiLogOut />} onClick={logout} _hover={{ bg: sidebarHover }}>
                            {t('logout')}
                        </Button>
                    </Box>
                </DrawerContent>
            </Drawer>

            {/* Desktop Sidebar */}
            <Box as="aside" w={`${sidebarWidth}px`} bg={sidebarBg} color="white"
                display={{ base: 'none', md: 'flex' }} flexDirection="column"
                position="fixed"
                {...(isRtl ? { right: 0 } : { left: 0 })}
                h="100vh" transition="width 0.2s" overflow="hidden" zIndex={100}>

                {/* Logo */}
                <Flex p={sidebarCollapsed ? 3 : 5} align="center" gap={3}
                    borderBottom="1px solid" borderColor="gray.700"
                    justify={sidebarCollapsed ? 'center' : 'flex-start'}>
                    <Box bg="teal.500" p={2} borderRadius="lg">
                        <Icon as={FiSettings} boxSize={4} color="white" />
                    </Box>
                    {!sidebarCollapsed && (
                        <Box>
                            <Heading size="sm" letterSpacing="tight">{t('panel')}</Heading>
                            <Text fontSize="xs" color="gray.400">{t('manageStore')}</Text>
                        </Box>
                    )}
                </Flex>

                {/* Navigation */}
                <Box as="nav" flex={1} overflowY="auto" p={2}>
                    {NAV_ITEMS.map(item => {
                        const active = isActive(item.path);
                        return (
                            <Tooltip key={item.path} label={sidebarCollapsed ? item.name : ''} placement="right" hasArrow>
                                <Link to={item.path} style={{ textDecoration: 'none' }}>
                                    <Flex align="center" px={sidebarCollapsed ? 2 : 3} py={2.5} mb={0.5}
                                        borderRadius="md" cursor="pointer"
                                        bg={active ? sidebarHover : 'transparent'}
                                        color={active ? activeColor : 'gray.300'}
                                        _hover={{ bg: sidebarHover, color: 'white' }}
                                        transition="all 0.15s"
                                        justify={sidebarCollapsed ? 'center' : 'flex-start'}>
                                        <Icon as={item.icon} boxSize={5} flexShrink={0} />
                                        {!sidebarCollapsed && (
                                            <Text fontSize="sm" fontWeight={active ? 'semibold' : 'normal'} ml={3} flex={1}>
                                                {item.name}
                                            </Text>
                                        )}
                                    </Flex>
                                </Link>
                            </Tooltip>
                        );
                    })}
                </Box>

                {/* Language switcher in sidebar */}
                {!sidebarCollapsed && (
                    <Box px={3} py={2} borderTop="1px solid" borderColor="gray.700">
                        <HStack spacing={1} justify="center" direction={isRtl ? 'row-reverse' : 'row'}>
                            <Tooltip label="English" hasArrow>
                                <Button size="xs" variant={!isRtl ? 'solid' : 'ghost'}
                                    colorScheme="teal" px={2}
                                    onClick={() => switchLanguage('en')}
                                    fontWeight={!isRtl ? 'bold' : 'normal'}
                                    opacity={!isRtl ? 1 : 0.6}>
                                    🇺🇸
                                </Button>
                            </Tooltip>
                            <Tooltip label="العربية" hasArrow>
                                <Button size="xs" variant={isRtl ? 'solid' : 'ghost'}
                                    colorScheme="teal" px={2}
                                    onClick={() => switchLanguage('ar')}
                                    fontWeight={isRtl ? 'bold' : 'normal'}
                                    opacity={isRtl ? 1 : 0.6}>
                                    🇸🇦
                                </Button>
                            </Tooltip>
                        </HStack>
                    </Box>
                )}

                {/* Collapse toggle */}
                <Flex p={2} borderTop="1px solid" borderColor="gray.700" justify="center">
                    <IconButton
                        icon={sidebarCollapsed ? (isRtl ? <FiChevronLeft /> : <FiChevronRight />) : (isRtl ? <FiChevronRight /> : <FiChevronLeft />)}
                        size="sm" variant="ghost" color="gray.400"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        aria-label={sidebarCollapsed ? t('expandSidebar') : t('collapseSidebar')}
                    />
                </Flex>

                {/* Go to User Site */}
                {!sidebarCollapsed && (
                    <Box px={3} py={2} borderTop="1px solid" borderColor="gray.700">
                        <a href="/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <Button
                                size="sm"
                                variant="ghost"
                                color="gray.400"
                                w="full"
                                justifyContent="flex-start"
                                _hover={{ color: 'teal.300', bg: 'gray.700' }}
                            >
                                {t("viewUserPage")}
                            </Button>
                        </a>
                    </Box>
                )}

                {/* User info */}
                {!sidebarCollapsed && (
                    <Box p={4} borderTop="1px solid" borderColor="gray.700">
                        <Flex align="center" gap={3}>
                            <Avatar size="sm" name={user?.name || 'Admin'} bg="teal.500" />
                            <Box flex={1} minW={0}>
                                <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{user?.name || 'Admin'}</Text>
                                <Text fontSize="xs" color="gray.400">{t('administrator')}</Text>
                            </Box>
                            <IconButton icon={<FiLogOut />} size="xs" variant="ghost" color="gray.400"
                                onClick={logout} aria-label={t('logout')} />
                        </Flex>
                    </Box>
                )}
            </Box>

            {/* Main Content */}
            <Box flex={1} bg={mainBg} minH="100vh"
                {...{ [mainMarginSide]: { base: 0, md: `${sidebarWidth}px` } }}
                transition="margin 0.2s"
                display="flex" flexDirection="column">

                {/* Header */}
                <Box as="header" bg={headerBg} boxShadow="sm" position="sticky" top={0} zIndex={10}
                    px={{ base: 4, md: 6 }} py={3}>
                    <Flex align="center" justify="space-between" direction={isRtl ? 'row-reverse' : 'row'}>
                        <Flex align="center" gap={3}>
                            <IconButton icon={<FiMenu />} display={{ base: 'flex', md: 'none' }}
                                variant="ghost" size="sm" onClick={() => setMobileMenuOpen(true)} aria-label="Menu" />
                            {breadcrumbs.length > 0 && (
                                <Breadcrumb separator={isRtl ? "\\" : "/"} fontSize="sm" display={{ base: 'none', sm: 'flex' }} direction={isRtl ? 'row-reverse' : 'row'}>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink as={Link} to="/admin/dashboard" color="gray.500">{t('home')}</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    {breadcrumbs.map((item, idx) => (
                                        <BreadcrumbItem key={item.path} isCurrentPage={idx === breadcrumbs.length - 1}>
                                            <BreadcrumbLink as={Link} to={item.path}
                                                color={idx === breadcrumbs.length - 1 ? 'gray.800' : 'gray.500'}
                                                fontWeight={idx === breadcrumbs.length - 1 ? 'semibold' : 'normal'}>
                                                {item.name}
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                    ))}
                                </Breadcrumb>
                            )}
                        </Flex>

                        {/* Notifications Bell and User Page Link */}
                        <HStack spacing={2} gap={2} direction={isRtl ? 'row-reverse' : 'row'}>
                            <Tooltip label={t('viewUserPage')} hasArrow>
                                <IconButton
                                    as={Link}
                                    to="/"
                                    icon={<FiExternalLink />}
                                    variant="ghost"
                                    size="sm"
                                    aria-label={t('viewUserPage')}
                                />
                            </Tooltip>
                            <Menu closeOnSelect={false}>
                                <MenuButton as={IconButton} icon={<FiBell />} variant="ghost" size="sm"
                                    position="relative" aria-label={t('notifications')}
                                    onClick={() => setNotifOpen(!notifOpen)}>
                                    {unreadCount > 0 && (
                                        <Badge position="absolute" top="-4px" right="-4px"
                                            colorScheme="red" borderRadius="full" fontSize="10px" px={1.5}
                                            minW="18px" zIndex={1}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </Badge>
                                    )}
                                </MenuButton>
                            <MenuList minW="360px" maxH="480px" overflowY="auto" p={0}>
                                <Box position="sticky" top={0} bg={headerBg} zIndex={1}>
                                    <Flex justify="space-between" align="center" p={3}>
                                        <Text fontWeight="bold" fontSize="sm">{t('notifications')}</Text>
                                        {notifications.some(n => !n.isRead) && (
                                            <Button size="xs" variant="ghost" colorScheme="blue" onClick={markAllAsRead}>
                                                {t('markAllRead')}
                                            </Button>
                                        )}
                                    </Flex>
                                    <Divider />
                                </Box>
                                {notifications.length === 0 ? (
                                    <Flex direction="column" align="center" py={8}>
                                        <Icon as={FiBell} boxSize={8} opacity={0.25} />
                                        <Text mt={2} fontSize="sm" color="gray.500">{t('noNotifications')}</Text>
                                    </Flex>
                                ) : (
                                    notifications.map(notif => (
                                        <MenuItem key={notif._id} onClick={() => markAsRead(notif._id)}
                                            _hover={{ bg: 'gray.50' }} p={0}>
                                            <Box w="full" p={3}
                                                borderLeft={!notif.isRead ? '3px solid' : '3px solid transparent'}
                                                borderLeftColor={'teal.400'}
                                                bg={!notif.isRead ? 'blue.50' : 'transparent'}>
                                                <Text fontSize="sm" fontWeight={notif.isRead ? 'normal' : 'semibold'}>
                                                    {notif.title}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500" noOfLines={2} mt={0.5}>
                                                    {notif.message}
                                                </Text>
                                                <Text fontSize="xs" color="gray.400" mt={0.5}>
                                                    {dayjs(notif.createdAt).fromNow()}
                                                </Text>
                                            </Box>
                                        </MenuItem>
                                    ))
                                )}
                            </MenuList>
                        </Menu>
                        </HStack>
                    </Flex>
                </Box>

                {/* Page content */}
                <Box flex={1} p={{ base: 4, md: 6 }}>
                    <Outlet />
                </Box>
            </Box>
        </Flex>
    );
};

export default AdminLayout;
