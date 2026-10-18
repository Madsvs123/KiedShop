import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Heading, Text, Button, Icon, useColorModeValue, Flex } from '@chakra-ui/react';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => {
    const { t } = useTranslation("pages");
  const bg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg}>
      <Box textAlign="center">
        <Heading fontSize="9xl" fontWeight="black" color="teal.400" lineHeight="1">
          404
        </Heading>
        <Text fontSize="2xl" fontWeight="semibold" mt={4}>
          {t('pageNotFound')}
        </Text>
        <Text color="gray.500" mt={2} maxW="md" mx="auto">
          {t('pageNotFoundDesc')}
        </Text>
        <Flex justify="center" gap={4} mt={8}>
          <Button as={Link} to="/" leftIcon={<FiHome />} colorScheme="teal" size="lg">
            {t('goHome')}
          </Button>
          <Button as={Link} to="/products" leftIcon={<FiArrowLeft />} variant="outline" size="lg">
            {t('browseProducts')}
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export default NotFoundPage;
