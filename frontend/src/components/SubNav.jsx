import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Flex, Text, useColorModeValue, VStack, Icon, Link as ChakraLink,
  Grid, IconButton
} from '@chakra-ui/react';
import {
  FiChevronDown, FiChevronRight, FiStar, FiTrendingUp, FiAward, FiBookOpen, FiActivity,
  FiGrid
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCategoryTree } from '../services/api';
import { useTranslation } from 'react-i18next';

const SubNav = () => {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['category-tree'],
    queryFn: async () => {
      const response = await getCategoryTree();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { t } = useTranslation('nav');

  if (isLoading || error) return null;

  return (
    <Box
      bg={bgColor}
      borderBottomWidth="1px"
      borderColor={borderColor}
      position="relative"
      zIndex={20}
      boxShadow="sm"
    >
      <Box maxW="1400px" mx="auto" px={4}>
        <Flex
          py={1.5}
          alignItems="center"
          gap={1}
          overflowX="auto"
          sx={{
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { height: '3px' },
          }}
        >
          {/* Quick Links */}
          <CategoryLink icon={FiGrid} to="/products" label={t('allProducts')} />
          <CategoryLink icon={FiStar} to="/products?sort=bestselling" label={t('bestSellers')} />
          <CategoryLink icon={FiTrendingUp} to="/products?sort=newest" label={t('newArrivals')} />
          <CategoryLink icon={FiAward} to="/products?sort=sale" label={t('onSale')} />

          {/* Divider */}
          <Box w="1px" h="5" bg={borderColor} mx={2} flexShrink={0} />

          {/* Category Mega Menus */}
          <Flex gap={1} align="center">
            {categories.map((cat) => (
              <CategoryMegaMenu key={cat._id} category={cat} />
            ))}
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

// ─── Small inline category link (no dropdown) ───
const CategoryLink = ({ icon, to, label }) => {
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  return (
    <ChakraLink
      as={Link}
      to={to}
      display="inline-flex"
      alignItems="center"
      gap={1.5}
      fontSize="sm"
      fontWeight="medium"
      whiteSpace="nowrap"
      px={2.5}
      py={1.5}
      borderRadius="md"
      _hover={{ bg: hoverBg, color: 'teal.500' }}
      transition="all 0.15s"
    >
      {icon && <Icon as={icon} boxSize={3.5} />}
      {label}
    </ChakraLink>
  );
};

// ─── Category with hover dropdown (reliable click target) ───
const CategoryMegaMenu = ({ category }) => {
  const { t } = useTranslation('nav');
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const subcategoryBg = useColorModeValue('teal.50', 'teal.900');
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuBorder = useColorModeValue('gray.200', 'gray.700');

  const hasSubcategories = category.subcategories?.length > 0;

  const open = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 120);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      position="relative"
      onMouseEnter={open}
      onMouseLeave={close}
    >
      {/* Trigger */}
      <ChakraLink
        as={Link}
        to={`/category/${category.slug}`}
        display="inline-flex"
        alignItems="center"
        gap={1.5}
        fontSize="sm"
        fontWeight="medium"
        whiteSpace="nowrap"
        px={2.5}
        py={1.5}
        borderRadius="md"
        _hover={{ bg: hoverBg, color: 'teal.500' }}
        transition="all 0.15s"
      >
        {category.name}
        {hasSubcategories && <Icon as={FiChevronDown} boxSize={3} />}
      </ChakraLink>

      {/* Dropdown – render only when open, attach to this container */}
      {isOpen && hasSubcategories && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          mt={1}
          w="480px"
          bg={menuBg}
          borderWidth="1px"
          borderColor={menuBorder}
          borderRadius="lg"
          boxShadow="xl"
          zIndex={1001}
          onMouseEnter={open}
          onMouseLeave={close}
        >
          <Box p={4}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              {/* Subcategories column */}
              <Box>
                <Text
                  fontWeight="bold"
                  color="teal.500"
                  mb={2}
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {t('subcategories')}
                </Text>
                <VStack align="stretch" spacing={1}>
                  {category.subcategories.slice(0, 10).map((sub) => (
                    <ChakraLink
                      key={sub._id}
                      as={Link}
                      to={`/category/${category.slug}?subcategory=${encodeURIComponent(sub.slug || sub.name.toLowerCase().replace(/\s+/g, '-'))}`}
                      fontSize="sm"
                      py={1.5}
                      px={2}
                      display="flex"
                      alignItems="center"
                      gap={2}
                      borderRadius="md"
                      _hover={{ bg: hoverBg, color: 'teal.500', textDecoration: 'none' }}
                      transition="all 0.15s"
                    >
                      <Icon as={FiChevronRight} boxSize={3} flexShrink={0} />
                      {sub.name}
                    </ChakraLink>
                  ))}
                </VStack>
              </Box>

              {/* Featured column */}
              <Box>
                <Text
                  fontWeight="bold"
                  color="teal.500"
                  mb={2}
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {t('browse')}
                </Text>
                <VStack align="stretch" spacing={1}>
                  <ChakraLink
                    as={Link}
                    to={`/category/${category.slug}`}
                    fontSize="sm"
                    fontWeight="medium"
                    display="flex"
                    alignItems="center"
                    gap={2}
                    py={2}
                    px={3}
                    bg={subcategoryBg}
                    borderRadius="md"
                    _hover={{ bg: 'teal.100', textDecoration: 'none' }}
                  >
                    <FiStar />
                    {t('viewAll')} {category.name}
                  </ChakraLink>
                  {category.subcategories.length > 10 && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      + {category.subcategories.length - 10} more
                    </Text>
                  )}
                </VStack>
              </Box>
            </Grid>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SubNav;
