import React from 'react';
import { Box, Flex, Text, Image, Badge, useColorModeValue, Icon, useToast } from '@chakra-ui/react';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';

const PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23e2e8f0' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' fill='%23a0aec0' font-size='14' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E`;

const ProductCard = ({ product }) => {
  const { t } = useTranslation('products');
  const dispatch = useDispatch();
  const toast = useToast();
  const { userInfo } = useSelector((state) => state.auth);
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const imageBg = useColorModeValue('gray.100', 'gray.700');

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userInfo) {
      toast({ title: t('pleaseLogin'), status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    dispatch(addToCart({
      product: product._id, name: product.name,
      image: product.primaryImage, price: product.price,
      countInStock: product.countInStock, qty: 1
    }));
    toast({ title: t('addedToCart'), status: 'success', duration: 2000 });
  };

  const inStock = (product.countInStock || 0) > 0;

  return (
    <Box
      as={Link} to={`/products/${product._id}`}
      bg={cardBg} borderRadius="xl" overflow="hidden"
      borderWidth="1px" borderColor={borderColor}
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-3px)', shadow: 'lg', borderColor: 'teal.300' }}
      display="flex" flexDirection="column"
    >
      {/* Image area */}
      <Box bg={imageBg} h="200px" display="flex" alignItems="center" justifyContent="center" position="relative" overflow="hidden">
        <Image
          src={product.primaryImage || ''}
          alt={product.name}
          objectFit="contain"
          h="full" w="full" p={4}
          fallbackSrc={PLACEHOLDER}
          loading="lazy"
        />
        {!inStock && (
          <Badge position="absolute" top={3} left={3} colorScheme="red" borderRadius="full" px={3} py={1} fontSize="xs">
            {t('outOfStock')}
          </Badge>
        )}
      </Box>

      {/* Info area */}
      <Box p={4} flex={1} display="flex" flexDirection="column">
        {/* Brand / category label */}
        <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={1}>
          {product.brand || product.category?.name || t('general')}
        </Text>

        {/* Product name */}
        <Text fontWeight="semibold" fontSize="md" noOfLines={2} mb={2} minH="2.5em" lineHeight="1.3">
          {product.name}
        </Text>

        {/* Rating */}
        {(product.rating || 0) > 0 && (
          <Flex align="center" gap={1} mb={2}>
            <Icon as={FiStar} color="yellow.400" fill="yellow.400" boxSize={3.5} />
            <Text fontSize="sm" fontWeight="medium">{product.rating?.toFixed(1)}</Text>
            <Text fontSize="xs" color="gray.400">({product.numReviews || 0})</Text>
          </Flex>
        )}

        {/* Price row */}
        <Flex align="baseline" gap={2} mt="auto" mb={3}>
          <Text fontSize="xl" fontWeight="bold" color="teal.600">${(product.price || 0).toFixed(2)}</Text>
          {product.originalPrice > product.price && (
            <Text fontSize="sm" color="gray.400" textDecoration="line-through">
              ${product.originalPrice.toFixed(2)}
            </Text>
          )}
        </Flex>

        {/* Add to cart */}
        <Flex
          as="button"
          align="center" justify="center" gap={2}
          w="full" py={2.5} borderRadius="lg"
          bg={inStock ? 'teal.500' : 'gray.300'}
          color={inStock ? 'white' : 'gray.500'}
          fontWeight="semibold" fontSize="sm"
          cursor={inStock ? 'pointer' : 'not-allowed'}
          _hover={inStock ? { bg: 'teal.600' } : {}}
          transition="all 0.15s"
          onClick={handleAddToCart}
          disabled={!inStock}
        >
          <Icon as={FiShoppingCart} boxSize={4} />
          {inStock ? t('addToCart') : t('outOfStock')}
        </Flex>
      </Box>
    </Box>
  );
};

export default ProductCard;
