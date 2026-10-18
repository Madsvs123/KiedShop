import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box, Flex, Heading, Text, SimpleGrid, Spinner, Alert, AlertIcon,
    Input, Select, Button, HStack, VStack, Badge, useColorModeValue,
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, Icon, Slider,
    SliderTrack, SliderFilledTrack, SliderThumb, RangeSlider,
    RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb,
    Accordion, AccordionItem, AccordionButton, AccordionPanel,
    AccordionIcon, Checkbox, CheckboxGroup, Divider, Tag, TagLabel,
    TagCloseButton, Wrap, WrapItem
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories, getCategoryTree } from '../services/api';
import ProductCard from '../components/ProductCard';
import { FiFilter, FiX, FiGrid, FiList } from 'react-icons/fi';

const ProductsPage = () => {
    const { t, i18n } = useTranslation('pages');
    const isRtl = i18n.language === 'ar';
    const location = useLocation();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid');
    const [searchParams, setSearchParams] = useState({
        search: '',
        category: '',
        subcategory: '',
        sort: 'newest',
        minPrice: 0,
        maxPrice: 1000,
        inStock: false
    });
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 1000]);
    
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    
    // Parse URL params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const category = params.get('category');
        const search = params.get('search');
        const sort = params.get('sort');
        
        setSearchParams(prev => ({
            ...prev,
            category: category || '',
            search: search || '',
            sort: sort || prev.sort
        }));
    }, [location.search]);
    
    // Fetch categories
    const { data: categories = [] } = useQuery({
        queryKey: ['categories-tree'],
        queryFn: async () => {
            const response = await getCategoryTree();
            return response.data;
        }
    });
    
    // Fetch products
    const { data: products = [], isLoading, error } = useQuery({
        queryKey: ['products', searchParams],
        queryFn: async () => {
            const params = {};
            if (searchParams.category) params.category = searchParams.category;
            if (searchParams.subcategory) params.subcategory = searchParams.subcategory;
            if (searchParams.sort) params.sort = searchParams.sort;
            if (searchParams.search) params.q = searchParams.search;
            if (searchParams.minPrice > 0) params.minPrice = searchParams.minPrice;
            if (searchParams.maxPrice < 1000) params.maxPrice = searchParams.maxPrice;
            if (searchParams.inStock) params.inStock = 'true';
            const response = await getProducts(params);
            return response.data;
        }
    });
    
    const handleFilterChange = (key, value) => {
        setSearchParams(prev => ({ ...prev, [key]: value }));
    };
    
    const handlePriceRangeChange = (values) => {
        setPriceRange(values);
        setSearchParams(prev => ({ ...prev, minPrice: values[0], maxPrice: values[1] }));
    };
    
    const clearFilters = () => {
        setSearchParams({
            search: '',
            category: '',
            subcategory: '',
            sort: 'newest',
            minPrice: 0,
            maxPrice: 1000,
            inStock: false
        });
        setPriceRange([0, 1000]);
        navigate('/products');
    };
    
    const activeFilterCount = Object.values(searchParams).filter(v => 
        v !== '' && v !== false && v !== 'newest' && v !== 0 && v !== 1000
    ).length;
    
    const getCategoryName = (slug) => {
        const category = categories.find(c => c.slug === slug);
        return category?.name || slug;
    };
    
    if (isLoading) {
        return (
            <Flex justify="center" align="center" minH="400px">
                <Spinner size="xl" color="teal.500" />
            </Flex>
        );
    }
    
    if (error) {
        return (
            <Alert status="error" borderRadius="lg">
                <AlertIcon />
                Error loading products: {error.message}
            </Alert>
        );
    }
    
    return (
        <Box bg={bgColor} minH="100vh" py={6}>
            <Box maxW="1400px" mx="auto" px={4}>
                {/* Breadcrumb */}
                <Breadcrumb mb={6} fontSize="sm" direction={isRtl ? 'row-reverse' : 'row'}>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to="/">{t('home')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink>{t('products')}</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>
                
                {/* Header */}
                <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                    <Heading size="xl">
                        {searchParams.category ? getCategoryName(searchParams.category) : t('allProducts')}
                    </Heading>
                    
                    <HStack spacing={3}>
                        <Button
                            leftIcon={<FiGrid />}
                            variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                            colorScheme="teal"
                            onClick={() => setViewMode('grid')}
                            size="sm"
                        />
                        <Button
                            leftIcon={<FiList />}
                            variant={viewMode === 'list' ? 'solid' : 'ghost'}
                            colorScheme="teal"
                            onClick={() => setViewMode('list')}
                            size="sm"
                        />
                        <Button
                            leftIcon={<FiFilter />}
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            size="sm"
                        >
                            {t('filters')} {activeFilterCount > 0 && `(${activeFilterCount})`}
                        </Button>
                    </HStack>
                </Flex>
                
                {/* Active Filters */}
                {activeFilterCount > 0 && (
                    <Wrap mb={4} spacing={2}>
                        {searchParams.search && (
                            <Tag size="lg" borderRadius="full" variant="solid" colorScheme="teal">
                                <TagLabel>{t('search')}: {searchParams.search}</TagLabel>
                                <TagCloseButton onClick={() => handleFilterChange('search', '')} />
                            </Tag>
                        )}
                        {searchParams.category && (
                            <Tag size="lg" borderRadius="full" variant="solid" colorScheme="teal">
                                <TagLabel>{t('category')}: {getCategoryName(searchParams.category)}</TagLabel>
                                <TagCloseButton onClick={() => handleFilterChange('category', '')} />
                            </Tag>
                        )}
                        {searchParams.subcategory && (
                            <Tag size="lg" borderRadius="full" variant="solid" colorScheme="teal">
                                <TagLabel>{t('subcategory')}: {searchParams.subcategory}</TagLabel>
                                <TagCloseButton onClick={() => handleFilterChange('subcategory', '')} />
                            </Tag>
                        )}
                        {(searchParams.minPrice > 0 || searchParams.maxPrice < 1000) && (
                            <Tag size="lg" borderRadius="full" variant="solid" colorScheme="teal">
                                <TagLabel>{t('price')}: ${searchParams.minPrice} - ${searchParams.maxPrice}</TagLabel>
                                <TagCloseButton onClick={() => handlePriceRangeChange([0, 1000])} />
                            </Tag>
                        )}
                        {searchParams.inStock && (
                            <Tag size="lg" borderRadius="full" variant="solid" colorScheme="teal">
                                <TagLabel>{t('inStockOnly')}</TagLabel>
                                <TagCloseButton onClick={() => handleFilterChange('inStock', false)} />
                            </Tag>
                        )}
                        <Button size="sm" variant="ghost" onClick={clearFilters} leftIcon={<FiX />}>
                            {t('clearAll')}
                        </Button>
                    </Wrap>
                )}
                
                <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <Box
                            w={{ base: '100%', lg: '280px' }}
                            bg={cardBg}
                            p={4}
                            borderRadius="lg"
                            position="sticky"
                            top="20px"
                            h="fit-content"
                        >
                            <VStack spacing={4} align="stretch">
                                <Flex justify="space-between" align="center">
                                    <Heading size="sm">{t('filters')}</Heading>
                                    <Button size="xs" variant="ghost" onClick={clearFilters}>
                                        {t('clearAll')}
                                    </Button>
                                </Flex>
                                
                                <Divider />
                                
                                {/* Search */}
                                <Box>
                                    <Text fontWeight="semibold" mb={2}>{t('search')}</Text>
                                    <Input
                                        placeholder={t('searchProductsPlaceholder')}
                                        value={searchParams.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        size="sm"
                                    />
                                </Box>
                                
                                <Divider />
                                
                                {/* Categories */}
                                <Box>
                                    <Text fontWeight="semibold" mb={2}>{t('categories')}</Text>
                                    <VStack spacing={2} align="stretch">
                                        {categories.map((category) => (
                                            <Box key={category._id}>
                                                <Button
                                                    variant={searchParams.category === category.slug ? 'solid' : 'ghost'}
                                                    colorScheme="teal"
                                                    size="sm"
                                                    justifyContent="flex-start"
                                                    w="full"
                                                    onClick={() => handleFilterChange('category', category.slug)}
                                                >
                                                    {category.name}
                                                </Button>
                                                {category.subcategories?.length > 0 && searchParams.category === category.slug && (
                                                    <VStack pl={4} mt={1} spacing={1}>
                                                        {category.subcategories.map((sub) => (
                                                            <Button
                                                                key={sub._id}
                                                                variant={searchParams.subcategory === sub.name ? 'solid' : 'ghost'}
                                                                colorScheme="teal"
                                                                size="xs"
                                                                justifyContent="flex-start"
                                                                w="full"
                                                                onClick={() => handleFilterChange('subcategory', sub.name)}
                                                            >
                                                                {sub.name}
                                                            </Button>
                                                        ))}
                                                    </VStack>
                                                )}
                                            </Box>
                                        ))}
                                    </VStack>
                                </Box>
                                
                                <Divider />
                                
                                {/* Price Range */}
                                <Box>
                                    <Text fontWeight="semibold" mb={2}>{t('priceRange')}</Text>
                                    <RangeSlider
                                        aria-label={['min', 'max']}
                                        min={0}
                                        max={1000}
                                        step={10}
                                        value={priceRange}
                                        onChange={handlePriceRangeChange}
                                    >
                                        <RangeSliderTrack>
                                            <RangeSliderFilledTrack bg="teal.500" />
                                        </RangeSliderTrack>
                                        <RangeSliderThumb index={0} />
                                        <RangeSliderThumb index={1} />
                                    </RangeSlider>
                                    <Flex justify="space-between" mt={2}>
                                        <Text fontSize="sm">${priceRange[0]}</Text>
                                        <Text fontSize="sm">${priceRange[1]}</Text>
                                    </Flex>
                                </Box>
                                
                                <Divider />
                                
                                {/* Stock Status */}
                                <Box>
                                    <Checkbox
                                        isChecked={searchParams.inStock}
                                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                                        colorScheme="teal"
                                    >
                                        {t('inStockOnly')}
                                    </Checkbox>
                                </Box>
                                
                                <Divider />
                                
                                {/* Sort */}
                                <Box>
                                    <Text fontWeight="semibold" mb={2}>{t('sortBy')}</Text>
                                    <Select
                                        value={searchParams.sort}
                                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                                        size="sm"
                                    >
                                        <option value="newest">{t('newest')}</option>
                                        <option value="price_asc">{t('priceLowToHigh')}</option>
                                        <option value="price_desc">{t('priceHighToLow')}</option>
                                        <option value="name_asc">{t('nameAsc')}</option>
                                        <option value="name_desc">{t('nameDesc')}</option>
                                        <option value="rating">{t('rating')}</option>
                                    </Select>
                                </Box>
                            </VStack>
                        </Box>
                    )}
                    
                    {/* Products Grid */}
                    <Box flex={1}>
                        <Text mb={4} color="gray.500">
                            {t('showing')} {products.length} {t('products')}
                        </Text>
                        
                        {products.length === 0 ? (
                            <Alert status="info" borderRadius="lg">
                                <AlertIcon />
                                {t('noProductsFound')}
                            </Alert>
                        ) : viewMode === 'grid' ? (
                            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6}>
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </SimpleGrid>
                        ) : (
                            <VStack spacing={4} align="stretch">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} viewMode="list" />
                                ))}
                            </VStack>
                        )}
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
};

export default ProductsPage;