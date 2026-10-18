import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Heading, SimpleGrid, Text, useColorModeValue, Spinner,
    Alert, AlertIcon, Flex, Icon, HStack, Button
} from '@chakra-ui/react';
import {
    FiPackage, FiShoppingCart, FiUsers, FiTag, FiDollarSign,
    FiClock, FiTrendingUp, FiAlertTriangle, FiRefreshCw
} from 'react-icons/fi';
import { getProducts, getOrders, getAllUsers, getCategories, getCoupons } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const COLORS = ['#48BB78', '#4299E1', '#ECC94B', '#F56565', '#9F7AEA', '#ED8936', '#38B2AC', '#667EEA'];

const AdminDashboard = () => {
    const { t } = useTranslation('admin');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cardBg = useColorModeValue('white', 'gray.800');

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [productsRes, ordersRes, usersRes, categoriesRes] = await Promise.all([
                getProducts(), getOrders(), getAllUsers(), getCategories()
            ]);
            setData({ products: productsRes.data, orders: ordersRes.data, users: usersRes.data, categories: categoriesRes.data });
        } catch (err) {
            setError(err.response?.data?.message || t('failedToLoadDashboard'));
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const stats = useMemo(() => {
        if (!data) return null;
        const { products, orders, users, categories } = data;
        const totalRevenue = orders.reduce((s, o) => s + (o.isPaid ? (o.totalPrice || 0) : 0), 0);
        const paidOrders = orders.filter(o => o.isPaid).length;
        const delivered = orders.filter(o => o.isDelivered).length;
        const pending = orders.length - paidOrders;
        const lowStock = products.filter(p => (p.countInStock || 0) <= 5).length;
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const newUsers = users.filter(u => new Date(u.createdAt) > weekAgo).length;

        // Category distribution
        const catMap = {};
        categories.forEach(c => catMap[c._id] = c.name);
        const catCounts = {};
        products.forEach(p => {
            const name = catMap[p.category] || p.category || 'Uncategorized';
            catCounts[name] = (catCounts[name] || 0) + 1;
        });

        // Orders by month
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const monthlyOrders = Array(12).fill(0);
        const monthlyRevenue = Array(12).fill(0);
        orders.forEach(o => {
            const m = new Date(o.createdAt).getMonth();
            monthlyOrders[m]++;
            if (o.isPaid) monthlyRevenue[m] += (o.totalPrice || 0);
        });

        // Top products by revenue
        const productSales = {};
        orders.forEach(o => {
            if (!o.isPaid) return;
            (o.orderItems || []).forEach(item => {
                const name = item.name;
                productSales[name] = (productSales[name] || 0) + (item.price * item.qty);
            });
        });
        const topProducts = Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            counts: {
                products: products.length, orders: orders.length, users: users.length,
                categories: categories.length, totalRevenue, paidOrders, delivered,
                pending, lowStock, newUsers
            },
            catCounts,
            monthlyOrders,
            monthlyRevenue,
            months,
            topProducts
        };
    }, [data]);

    if (loading) return <Flex justify="center" py={16}><Spinner size="xl" thickness="4px" color="teal.500" /></Flex>;
    if (error) return <Alert status="error" borderRadius="lg"><AlertIcon />{error} <Button ml={4} size="sm" onClick={fetchAll}>{t('retry')}</Button></Alert>;
    if (!stats) return null;

    const { counts, catCounts, monthlyOrders, monthlyRevenue, months, topProducts } = stats;

    const pieData = {
        labels: Object.keys(catCounts),
        datasets: [{ data: Object.values(catCounts), backgroundColor: COLORS.slice(0, Object.keys(catCounts).length) }]
    };
    const monthlyOrdersChart = {
        labels: months,
        datasets: [{ label: t('monthlyOrders'), data: monthlyOrders, backgroundColor: '#4299E1', borderRadius: 4 }]
    };
    const revenueChart = {
        labels: months,
        datasets: [{
            label: t('revenueTrend'), data: monthlyRevenue, borderColor: '#48BB78',
            backgroundColor: 'rgba(72, 187, 120, 0.1)', fill: true, tension: 0.3
        }]
    };
    const topProductsChart = {
        labels: topProducts.map(p => p[0].length > 15 ? p[0].slice(0, 15) + '…' : p[0]),
        datasets: [{ label: t('topProductsByRevenue'), data: topProducts.map(p => p[1]), backgroundColor: COLORS }]
    };

    return (
        <Box p={6}>
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="xl">{t('dashboard')}</Heading>
                <Button leftIcon={<FiRefreshCw />} size="sm" variant="ghost" onClick={fetchAll}>{t('refresh')}</Button>
            </Flex>

            {/* KPI Cards */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
                {[
                    { label: t('totalRevenue'), value: `$${counts.totalRevenue.toFixed(2)}`, icon: FiDollarSign, color: 'green.500' },
                    { label: t('orders'), value: counts.orders, icon: FiShoppingCart, color: 'blue.500' },
                    { label: t('products'), value: counts.products, icon: FiPackage, color: 'purple.500' },
                    { label: t('users'), value: counts.users, icon: FiUsers, color: 'orange.500' },
                    { label: t('paid'), value: counts.paidOrders, icon: FiTrendingUp, color: 'green.500' },
                    { label: t('delivered'), value: counts.delivered, icon: FiClock, color: 'teal.500' },
                    { label: t('pending'), value: counts.pending, icon: FiClock, color: 'yellow.500' },
                    { label: t('lowStock'), value: counts.lowStock, icon: FiAlertTriangle, color: 'red.500' },
                ].map(s => (
                    <Box key={s.label} bg={cardBg} p={4} borderRadius="lg" boxShadow="sm" borderLeft="4px" borderLeftColor={s.color}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Text fontSize="xs" color="gray.500">{s.label}</Text>
                                <Text fontSize="2xl" fontWeight="bold">{s.value}</Text>
                            </Box>
                            <Icon as={s.icon} boxSize={8} color={s.color} opacity={0.5} />
                        </Flex>
                    </Box>
                ))}
            </SimpleGrid>

            {/* Charts Row */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
                    <Heading size="sm" mb={4}>{t('monthlyOrders')}</Heading>
                    <Box h="250px"><Bar data={monthlyOrdersChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></Box>
                </Box>
                <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
                    <Heading size="sm" mb={4}>{t('revenueTrend')}</Heading>
                    <Box h="250px"><Line data={revenueChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + v } } } }} /></Box>
                </Box>
                <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
                    <Heading size="sm" mb={4}>{t('productsByCategory')}</Heading>
                    <Box h="250px" display="flex" justifyContent="center">
                        <Box w="220px"><Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } } } }} /></Box>
                    </Box>
                </Box>
                <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
                    <Heading size="sm" mb={4}>{t('topProductsByRevenue')}</Heading>
                    <Box h="250px"><Bar data={topProductsChart} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { callback: v => '$' + v } } } }} /></Box>
                </Box>
            </SimpleGrid>

            {/* Recent Orders */}
            {data?.orders && (
                <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
                    <Heading size="sm" mb={4}>{t('recentOrders')}</Heading>
                    {data.orders.slice(0, 5).map(o => (
                        <Flex key={o._id} justify="space-between" align="center" py={2} borderBottomWidth="1px" _last={{ borderBottom: 'none' }}>
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold">#{o._id?.slice(-8).toUpperCase()}</Text>
                                <Text fontSize="xs" color="gray.500">{new Date(o.createdAt).toLocaleDateString()}</Text>
                            </Box>
                            <HStack>
                                <Text fontSize="sm" fontWeight="bold">${o.totalPrice?.toFixed(2)}</Text>
                                <Text fontSize="xs" color={o.isPaid ? 'green.500' : 'orange.500'}>{o.isPaid ? t('paid') : t('pending')}</Text>
                            </HStack>
                        </Flex>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default AdminDashboard;
