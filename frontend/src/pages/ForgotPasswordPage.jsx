import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box, Flex, Heading, Text, FormControl, FormLabel, Input, Button,
    useColorModeValue, Alert, AlertIcon, VStack, Icon, Link
} from '@chakra-ui/react';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { forgotPassword } from '../services/api';

const ForgotPasswordPage = () => {
    const { t } = useTranslation("pages");
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const bg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setError('');
        try {
            await forgotPassword({ email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setLoading(false); }
    };

    return (
        <Flex minH="100vh" align="center" justify="center" bg={bg}>
            <Box bg={cardBg} p={8} borderRadius="xl" boxShadow="lg" w="full" maxW="440px">
                <Link as={RouterLink} to="/login" display="flex" alignItems="center" gap={2} color="gray.500" fontSize="sm" mb={6}>
                    <Icon as={FiArrowLeft} /> {t('backToLogin')}
                </Link>

                {sent ? (
                    <VStack spacing={4} textAlign="center">
                        <Icon as={FiCheckCircle} boxSize={12} color="green.500" />
                        <Heading size="md">Check Your Email</Heading>
                        <Text color="gray.500" fontSize="sm">If an account with that email exists, we've sent a password reset link.</Text>
                    </VStack>
                ) : (
                    <>
                        <Heading size="lg" mb={2}>Forgot Password?</Heading>
                        <Text color="gray.500" fontSize="sm" mb={6}>Enter your email and we'll send you a reset link.</Text>

                        {error && <Alert status="error" borderRadius="md" mb={4} size="sm"><AlertIcon />{error}</Alert>}

                        <form onSubmit={handleSubmit}>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Email</FormLabel>
                                    <Input type="email" placeholder={t("emailPlaceholder")} value={email}
                                        onChange={(e) => setEmail(e.target.value)} required />
                                </FormControl>
                                <Button type="submit" colorScheme="teal" size="lg" w="full"
                                    isLoading={loading} loadingText="Sending..." leftIcon={<FiMail />}>
                                    {t('sendResetLink')}
                                </Button>
                            </VStack>
                        </form>
                    </>
                )}
            </Box>
        </Flex>
    );
};

export default ForgotPasswordPage;
