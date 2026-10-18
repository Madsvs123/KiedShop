import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
    Box, Flex, Heading, Text, SimpleGrid, Spinner, Alert, AlertIcon, 
    useColorModeValue, Select, Checkbox, RangeSlider, RangeSliderTrack, 
    RangeSliderFilledTrack, RangeSliderThumb, VStack, HStack, Badge, 
    Button, Icon, Collapse, Divider, Breadcrumb, BreadcrumbItem, 
    BreadcrumbLink, Tag, TagLabel, TagCloseButton
} from '@chakra-ui/react';
import { FiFilter, FiChevronDown, FiChevronUp, FiX, FiSliders } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { getProductsByCategory, getCategoryBySlug } from '../services/api';
import ProductCard from '../components/ProductCard';
import SubNav from '../components/SubNav';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const MotionBox = motion(Box);

const CategoryPage = () => {
    const { t, i18n } = useTranslation("pages");
    const isRtl = i18n.language === 'ar';
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const subcategory = searchParams.get('subcategory');
    
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        sort: 'featured',
        priceRange: [0, 500],
        inStock: false,
        minRating: 0,
        brands: []
    });
    const [activeFilters, setActiveFilters] = useState([]);
    
    const { data: category, isLoading: categoryLoading } = useQuery({
        queryKey: ['category', slug],
        queryFn: async () => {
            const response = await getCategoryBySlug(slug);
            return response.data;
        }
    });
    
    const { data: products = [], isLoading, error } = useQuery({
        queryKey: ['products', slug, subcategory, filters],
        queryFn: async () => {
            const response = await getProductsByCategory(slug, { subcategory, ...filters });
            return response.data;
        }
    });
    
    const bgColor = useColorModeValue('white', 'gray.800');
    const sidebarBg = useColorModeValue('gray.50', 'gray.700');
    
    const getSortedProducts = () => {
        let sorted = [...products];
        switch (filters.sort) {
            case 'price-asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                break;
        }
        return sorted;
    };
    
    const filteredProducts = getSortedProducts().filter(product => {
        const priceOk = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
        const stockOk = !filters.inStock || product.countInStock > 0;
        const ratingOk = (product.rating || 0) >= filters.minRating;
        return priceOk && stockOk && ratingOk;
    });
    
    const addActiveFilter = (label, value, type) => {
        setActiveFilters([...activeFilters, { label, value, type }]);
    };
    
    const removeActiveFilter = (index) => {
        const newFilters = [...activeFilters];
        newFilters.splice(index, 1);
        setActiveFilters(newFilters);
    };
    
    const clearAllFilters = () => {
        setFilters({
            sort: 'featured',
            priceRange: [0, 500],
            inStock: false,
            minRating: 0,
            brands: []
        });
        setActiveFilters([]);
    };
    
    if (isLoading || categoryLoading) {
        return (
            <Flex justifyContent="center" alignItems="center" height="300px">
                <Spinner size="xl" color="primary.500" />
            </Flex>
        );
    }
    
    if (error) {
        return (
            <Alert status="error" mt={4}>
                <AlertIcon />
                Error loading products: {error.message}
            </Alert>
        );
    }
    
    return (
        <Box>
            <SubNav />
            
            <Box bg={bgColor} py={6}>
                <Box maxW="1400px" mx="auto" px={4}>
                    <Breadcrumb mb={4} fontSize="sm" direction={isRtl ? 'row-reverse' : 'row'}>
                        <BreadcrumbItem>
                            <BreadcrumbLink as={Link} to="/">{t('home')}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <BreadcrumbLink as={Link} to={`/category/${slug}`}>
                                {category?.name || slug.replace(/-/g, ' ')}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {subcategory && (
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink>{subcategory.replace(/-/g, ' ')}</BreadcrumbLink>
                            </BreadcrumbItem>
                        )}
                    </Breadcrumb>
                    
                    <Flex justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap" gap={4}>
                        <Box>
                            <Heading size="xl" textTransform="capitalize">
                                {category?.name || slug.replace(/-/g, ' ')}
                            </Heading>
                            {category?.description && (
                                <Text color="gray.500" mt={2}>{category.description}</Text>
                            )}
                        </Box>
                        <HStack>
                            <Button 
                                leftIcon={<FiSliders />} 
                                variant="outline" 
                                onClick={() => setShowFilters(!showFilters)}
                                display={{ base: 'flex', md: 'none' }}
                            >
                                Filters
                            </Button>
                            <Select 
                                value={filters.sort} 
                                onChange={(e) => setFilters({...filters, sort: e.target.value})}
                                width="200px"
                            >
                                <option value="featured">Sort: Featured</option>
                                <option value="newest">Sort: Newest</option>
                                <option value="price-asc">Sort: Price Low to High</option>
                                <option value="price-desc">Sort: Price High to Low</option>
                                <option value="rating">Sort: Top Rated</option>
                            </Select>
                        </HStack>
                    </Flex>
                    
                    {activeFilters.length > 0 && (
                        <Flex wrap="wrap" gap={2} mb={4}>
                            {activeFilters.map((filter, idx) => (
                                <Tag key={idx} size="md" borderRadius="full" variant="solid" colorScheme="primary">
                                    <TagLabel>{filter.label}</TagLabel>
                                    <TagCloseButton onClick={() => removeActiveFilter(idx)} />
                                </Tag>
                            ))}
                            <Button size="xs" variant="ghost" onClick={clearAllFilters}>Clear All</Button>
                        </Flex>
                    )}
                    
                    <Flex gap={8} direction={{ base: 'column', md: 'row' }}>
                        <Collapse in={showFilters} animateOpacity>
                            <Box 
                                w={{ base: 'full', md: '280px' }}
                                flexShrink={0}
                                bg={sidebarBg}
                                p={5}
                                borderRadius="lg"
                                mb={{ base: 6, md: 0 }}
                                position="sticky"
                                top={20}
                                height="fit-content"
                            >
                                <Flex justifyContent="space-between" alignItems="center" mb={4}>
                                    <Text fontWeight="bold" fontSize="lg">Filters</Text>
                                    <Button size="sm" variant="ghost" onClick={clearAllFilters}>Reset</Button>
                                </Flex>
                                
                                <Divider mb={4} />
                                
                                <Box mb={6}>
                                    <Text fontWeight="semibold" mb={3}>Price Range</Text>
                                    <RangeSlider 
                                        aria-label={['min', 'max']}
                                        defaultValue={[0, 500]}
                                        min={0}
                                        max={500}
                                        step={25}
                                        onChange={(val) => {
                                            setFilters({...filters, priceRange: val});
                                            addActiveFilter(`Price: $${val[0]} - $${val[1]}`, val, 'price');
                                        }}
                                    >
                                        <RangeSliderTrack>
                                            <RangeSliderFilledTrack bg="primary.500" />
                                        </RangeSliderTrack>
                                        <RangeSliderThumb index={0} boxSize={4} />
                                        <RangeSliderThumb index={1} boxSize={4} />
                                    </RangeSlider>
                                    <Flex justifyContent="space-between" mt={2}>
                                        <Text fontSize="sm">${filters.priceRange[0]}</Text>
                                        <Text fontSize="sm">${filters.priceRange[1]}</Text>
                                    </Flex>
                                </Box>
                                
                                <Divider mb={4} />
                                
                                <Box mb={6}>
                                    <Text fontWeight="semibold" mb={3}>Availability</Text>
                                    <Checkbox 
                                        isChecked={filters.inStock}
                                        onChange={(e) => {
                                            setFilters({...filters, inStock: e.target.checked});
                                            if (e.target.checked) addActiveFilter('In Stock Only', null, 'stock');
                                        }}
                                        colorScheme="primary"
                                    >
                                        In Stock Only
                                    </Checkbox>
                                </Box>
                                
                                <Divider mb={4} />
                                
                                <Box mb={6}>
                                    <Text fontWeight="semibold" mb={3}>Minimum Rating</Text>
                                    <VStack align="start" spacing={2}>
                                        {[4, 3, 2, 1].map((rating) => (
                                            <Checkbox 
                                                key={rating}
                                                isChecked={filters.minRating === rating}
                                                onChange={() => {
                                                    setFilters({...filters, minRating: rating});
                                                    addActiveFilter(`${rating}+ Stars`, rating, 'rating');
                                                }}
                                                colorScheme="primary"
                                            >
                                                {rating}+ Stars ⭐
                                            </Checkbox>
                                        ))}
                                    </VStack>
                                </Box>
                            </Box>
                        </Collapse>
                        
                        <Box flex={1}>
                            <Flex justifyContent="space-between" alignItems="center" mb={4}>
                                <Text color="gray.500">{filteredProducts.length} products found</Text>
                            </Flex>
                            
                            {filteredProducts.length === 0 ? (
                                <Alert status="info" borderRadius="lg">
                                    <AlertIcon />
                                    No products match your filters. Try adjusting your criteria.
                                </Alert>
                            ) : (
                                <SimpleGrid columns={{ base: 2, sm: 2, md: 3, lg: 4 }} spacing={6}>
                                    {filteredProducts.map((product, idx) => (
                                        <MotionBox
                                            key={product._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <ProductCard product={product} />
                                        </MotionBox>
                                    ))}
                                </SimpleGrid>
                            )}
                        </Box>
                    </Flex>
                </Box>
            </Box>
        </Box>
    );
};

export default CategoryPage;