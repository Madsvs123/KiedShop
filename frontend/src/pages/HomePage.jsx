import React, { useState } from 'react';
import {
  Box, Flex, Text, Heading, SimpleGrid, Spinner, Alert, AlertIcon,
  useColorModeValue, Button, Icon, VStack, HStack, useToast,
  Input, Stack
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import { FiArrowRight, FiStar, FiTruck, FiShield, FiBookOpen, FiHeadphones, FiTrendingUp, FiAward } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t } = useTranslation('home');
  const [email, setEmail] = useState('');
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const sectionBg = useColorModeValue('gray.50', 'gray.900');

  // Fetch products
  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => { const r = await getProducts(); return r.data; },
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const r = await getCategories(); return r.data; },
  });

  const isLoading = productsLoading || categoriesLoading;
  const hasError = productsError || categoriesError;

  // Featured products
  const featuredProducts = products.filter((p) => p.featured).slice(0, 10);
  const mainCategories = categories.filter((c) => !c.isSubcategory);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      toast({
        title: t('subscribed'),
        description: t('subscribedDesc'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setEmail('');
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="70vh">
        <Spinner size="xl" thickness="4px" color="teal.500" />
      </Flex>
    );
  }

  if (hasError) {
    return (
      <Alert status="error" maxW="1200px" mx="auto" mt={8} borderRadius="lg">
        <AlertIcon /> {t('error')}
      </Alert>
    );
  }

  return (
    <Box>
      {/* ─── Hero Section ─── */}
      <Box
        bgGradient="linear(135deg, teal.500 0%, blue.600 100%)"
        color="white"
        py={{ base: 14, md: 20 }}
        textAlign="center"
        position="relative"
        overflow="hidden"
      >
        <Box maxW="900px" mx="auto" px={4} position="relative" zIndex={1}>
          <Heading size={{ base: 'xl', md: '2xl' }} mb={3}>
            {t('heroTitle')}
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} mb={6} opacity={0.9}>
            {t('heroSubtitle')}
          </Text>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} justify="center">
            <Button
              as={Link}
              to="/products"
              size="lg"
              colorScheme="whiteAlpha"
              rightIcon={<FiArrowRight />}
              _hover={{ bg: 'white', color: 'teal.600' }}
              px={8}
            >
              {t('shopAll')}
            </Button>
            <Button
              as={Link}
              to="/products?sort=bestselling"
              size="lg"
              variant="outline"
              colorScheme="whiteAlpha"
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              {t('bestSellers')}
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* ─── Features Strip ─── */}
      <Box bg={cardBg} py={8} borderBottomWidth="1px">
        <Box maxW="1200px" mx="auto" px={4}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            {[
              { icon: FiTruck, title: t('freeShipping'), desc: t('freeShippingDesc') },
              { icon: FiShield, title: t('securePayment'), desc: t('securePaymentDesc') },
              { icon: FiBookOpen, title: t('medicalResources'), desc: t('medicalResourcesDesc') },
              { icon: FiHeadphones, title: t('support247'), desc: t('support247Desc') },
            ].map((f) => (
              <VStack key={f.title} spacing={1} textAlign="center">
                <Icon as={f.icon} boxSize={8} color="teal.500" />
                <Text fontWeight="semibold" fontSize="sm">{f.title}</Text>
                <Text fontSize="xs" color="gray.500">{f.desc}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* ─── Featured Products Carousel ─── */}
      {featuredProducts.length > 0 && (
        <Box py={12}>
          <Box maxW="1200px" mx="auto" px={4}>
            <Flex justify="space-between" align="center" mb={6}>
              <Box>
                <Heading size="lg">{t('featuredProducts')}</Heading>
                <Text fontSize="sm" color="gray.500" mt={1}>{t('featuredProductsDesc')}</Text>
              </Box>
              <Button as={Link} to="/products" rightIcon={<FiArrowRight />} variant="ghost" colorScheme="teal" size="sm">
                {t('viewAll')}
              </Button>
            </Flex>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={2}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
            >
              {featuredProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Box>
      )}

      {/* ─── Shop by Category ─── */}
      <Box bg={sectionBg} py={12}>
        <Box maxW="1200px" mx="auto" px={4}>
          <Box mb={6}>
            <Heading size="lg">{t('shopByCategory')}</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>{t('shopByCategoryDesc')}</Text>
          </Box>
          {mainCategories.length === 0 ? (
            <Alert status="info" borderRadius="lg"><AlertIcon />{t('noCategories')}</Alert>
          ) : (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}>
              {mainCategories.slice(0, 10).map((cat) => (
                <Box
                  key={cat._id}
                  as={Link}
                  to={`/category/${cat.slug}`}
                  bg={cardBg}
                  p={5}
                  borderRadius="lg"
                  boxShadow="sm"
                  textAlign="center"
                  transition="all 0.2s"
                  _hover={{ shadow: 'md', transform: 'translateY(-3px)', borderColor: 'teal.400' }}
                  borderWidth="1px"
                  borderColor="transparent"
                >
                  <Icon as={FiStar} boxSize={8} color="teal.500" mb={2} />
                  <Text fontWeight="bold" fontSize="md">{cat.name}</Text>
                  {cat.subcategories?.length > 0 && (
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      {cat.subcategories.length} {t('subcategories')}
                    </Text>
                  )}
                </Box>
              ))}
            </SimpleGrid>
          )}
          {mainCategories.length > 10 && (
            <Flex justify="center" mt={6}>
              <Button as={Link} to="/products" variant="outline" colorScheme="teal" rightIcon={<FiArrowRight />}>
                {t('shopAllCategories')}
              </Button>
            </Flex>
          )}
        </Box>
      </Box>

      {/* ─── All Products Grid ─── */}
      <Box py={12}>
        <Box maxW="1200px" mx="auto" px={4}>
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Heading size="lg">{t('latestProducts')}</Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>{t('latestProductsDesc')}</Text>
            </Box>
            <Button as={Link} to="/products" rightIcon={<FiArrowRight />} variant="ghost" colorScheme="teal" size="sm">
              {t('viewAll')}
            </Button>
          </Flex>
          {products.length === 0 ? (
            <Alert status="info" borderRadius="lg"><AlertIcon />{t('noProducts')}</Alert>
          ) : (
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6}>
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Box>

      {/* ─── Newsletter ─── */}
      <Box bgGradient="linear(135deg, teal.500, blue.600)" color="white" py={14} textAlign="center">
        <Box maxW="600px" mx="auto" px={4}>
          <Heading size="lg" mb={2}>{t('newsletterTitle')}</Heading>
          <Text mb={5} opacity={0.9}>{t('newsletterDesc')}</Text>
          <form onSubmit={handleSubscribe}>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} maxW="500px" mx="auto">
              <Input
                placeholder={t('newsletterPlaceholder')}
                bg="white"
                color="gray.800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                borderRadius="lg"
                _placeholder={{ color: 'gray.400' }}
              />
              <Button
                type="submit"
                colorScheme="whiteAlpha"
                bg="white"
                color="teal.600"
                _hover={{ bg: 'gray.100' }}
                px={8}
                borderRadius="lg"
              >
                {t('subscribe')}
              </Button>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
