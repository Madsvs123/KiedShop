import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box, Heading, Text, SimpleGrid, Spinner, Alert, AlertIcon,
    useColorModeValue, Input, Select, Flex, Slider, SliderTrack,
    SliderFilledTrack, SliderThumb, HStack, Button, Collapse,
    Icon, VStack, RangeSlider, RangeSliderTrack, RangeSliderFilledTrack,
    RangeSliderThumb, Tag, TagLabel, TagCloseButton, IconButton, Divider
} from '@chakra-ui/react';
import { FiSearch, FiSliders, FiX, FiFilter } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories, getBrands } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useTranslation } from 'react-i18next';

const SearchPage = () => {
    const { t } = useTranslation("pages");
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQ = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQ);
    const [sort, setSort] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [showFilters, setShowFilters] = useState(false);

    const bg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    const { data: products, isLoading } = useQuery({
        queryKey: ['search', query, sort, category, brand, priceRange],
        queryFn: async () => {
            const params = {};
            if (query) params.q = query;
            if (sort) params.sort = sort;
            if (category) params.category = category;
            if (brand) params.brand = brand;
            if (priceRange[0] > 0) params.minPrice = priceRange[0];
            if (priceRange[1] < 1000) params.maxPrice = priceRange[1];
            const res = await getProducts(params);
            return res.data;
        }
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => { const r = await getCategories(); return r.data; }
    });

    const { data: allBrands = [] } = useQuery({
        queryKey: ['brands'],
        queryFn: async () => { const r = await getBrands(); return r.data; }
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) setSearchParams({ q: query });
    };

    const clearFilters = () => {
        setQuery(initialQ);
        setSort('');
        setCategory('');
        setBrand('');
        setPriceRange([0, 1000]);
    };

    const hasActiveFilters = sort || category || brand || priceRange[0] > 0 || priceRange[1] < 1000;

    const results = useMemo(() => products || [], [products]);

    return (
        <Box bg={bg} minH="100vh" py={8}>
            <Box maxW="1200px" mx="auto" px={4}>
                {/* Search Bar */}
                <form onSubmit={handleSearch}>
                    <Flex gap={2} mb={6}>
                        <Input
                            size="lg" placeholder="Search products, brands, categories..."
                            value={query} onChange={(e) => setQuery(e.target.value)}
                            bg={cardBg} borderRadius="lg"
                        />
                        <IconButton type="submit" icon={<FiSearch />} colorScheme="teal" size="lg" aria-label="Search" />
                        <IconButton icon={<FiFilter />} variant="outline" size="lg"
                            onClick={() => setShowFilters(!showFilters)}
                            colorScheme={hasActiveFilters ? 'teal' : 'gray'} aria-label="Filters" />
                    </Flex>
                </form>

                {/* Active Filters Tags */}
                {hasActiveFilters && (
                    <Flex gap={2} mb={4} flexWrap="wrap" align="center">
                        <Text fontSize="sm" color="gray.500">Active filters:</Text>
                        {category && <Tag colorScheme="teal"><TagLabel>Category: {category}</TagLabel>
                            <TagCloseButton onClick={() => setCategory('')} /></Tag>}
                        {brand && <Tag colorScheme="blue"><TagLabel>Brand: {brand}</TagLabel>
                            <TagCloseButton onClick={() => setBrand('')} /></Tag>}
                        {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                            <Tag colorScheme="green"><TagLabel>${priceRange[0]}–${priceRange[1]}</TagLabel>
                                <TagCloseButton onClick={() => setPriceRange([0, 1000])} /></Tag>
                        )}
                        {sort && <Tag colorScheme="purple"><TagLabel>Sort: {sort}</TagLabel>
                            <TagCloseButton onClick={() => setSort('')} /></Tag>}
                        <Button size="xs" variant="ghost" onClick={clearFilters}>Clear all</Button>
                    </Flex>
                )}

                <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
                    {/* Filters Sidebar */}
                    <Collapse in={showFilters} style={{ width: showFilters ? '260px' : '0', flexShrink: 0 }}>
                        <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="sm" w="260px">
                            <Flex justify="space-between" align="center" mb={4}>
                                <Text fontWeight="semibold">Filters</Text>
                                <IconButton icon={<FiX />} size="xs" variant="ghost" onClick={() => setShowFilters(false)} aria-label="Close" />
                            </Flex>

                            <VStack spacing={5} align="stretch">
                                <Box>
                                    <Text fontSize="sm" fontWeight="semibold" mb={2}>Category</Text>
                                    <Select value={category} onChange={(e) => setCategory(e.target.value)} size="sm"
                                        placeholder="All categories">
                                        {categories.map(c => (
                                            <option key={c._id} value={c.slug || c._id}>{c.name}</option>
                                        ))}
                                    </Select>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" fontWeight="semibold" mb={2}>Brand</Text>
                                    <Select value={brand} onChange={(e) => setBrand(e.target.value)} size="sm"
                                        placeholder="All brands">
                                        {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
                                    </Select>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" fontWeight="semibold" mb={2}>
                                        Price: ${priceRange[0]} – ${priceRange[1]}
                                    </Text>
                                    <RangeSlider min={0} max={1000} step={10}
                                        value={priceRange}
                                        onChange={setPriceRange}
                                        colorScheme="teal" size="sm">
                                        <RangeSliderTrack>
                                            <RangeSliderFilledTrack />
                                        </RangeSliderTrack>
                                        <RangeSliderThumb index={0} />
                                        <RangeSliderThumb index={1} />
                                    </RangeSlider>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" fontWeight="semibold" mb={2}>Sort By</Text>
                                    <Select value={sort} onChange={(e) => setSort(e.target.value)} size="sm" placeholder="Relevance">
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="rating">Highest Rated</option>
                                        <option value="newest">Newest</option>
                                    </Select>
                                </Box>

                                <Button size="sm" variant="outline" onClick={clearFilters}>Reset</Button>
                            </VStack>
                        </Box>
                    </Collapse>

                    {/* Results */}
                    <Box flex={1}>
                        {query && (
                            <Text fontSize="sm" color="gray.500" mb={4}>
                                {isLoading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
                            </Text>
                        )}

                        {isLoading ? (
                            <Flex justify="center" py={16}><Spinner size="xl" color="teal.500" /></Flex>
                        ) : results.length === 0 ? (
                            <Box textAlign="center" py={16}>
                                <Icon as={FiSearch} boxSize={12} opacity={0.25} />
                                <Heading size="md" mt={4}>No products found</Heading>
                                <Text color="gray.500" mt={2}>Try different keywords or adjust your filters.</Text>
                            </Box>
                        ) : (
                            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={5}>
                                {results.map(p => <ProductCard key={p._id} product={p} />)}
                            </SimpleGrid>
                        )}
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
};

export default SearchPage;
