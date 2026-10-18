import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Flex, Heading, Text, FormControl, FormLabel, Input, Button,
    useColorModeValue, Alert, AlertIcon, VStack, Icon, Link,
    InputGroup, InputRightElement
} from '@chakra-ui/react';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { resetPassword } from '../services/api';
import { useTranslation } from 'react-i18next';

const ResetPasswordPage = () => {
    const { t } = useTranslation("pages");
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const bg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) { setError('Invalid or missing reset token.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }

        setLoading(true);
        setError('');
        try {
            await resetPassword(token, { password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally { setLoading(false); }
    };

    if (!token) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg={bg}>
                <Box bg={cardBg} p={8} borderRadius="xl" boxShadow="lg" w="full" maxW="440px" textAlign="center">
                    <Alert status="error" borderRadius="md"><AlertIcon />Invalid or missing reset token.</Alert>
                    <Button as={RouterLink} to="/forgot-password" mt={4} colorScheme="teal" size="sm">Request New Link</Button>
                </Box>
            </Flex>
        );
    }

    return (
        <Flex minH="100vh" align="center" justify="center" bg={bg}>
            <Box bg={cardBg} p={8} borderRadius="xl" boxShadow="lg" w="full" maxW="440px">
                {success ? (
                    <VStack spacing={4} textAlign="center">
                        <Icon as={FiCheckCircle} boxSize={12} color="green.500" />
                        <Heading size="md">Password Reset!</Heading>
                        <Text color="gray.500" fontSize="sm">Redirecting you to login...</Text>
                    </VStack>
                ) : (
                    <>
                        <Heading size="lg" mb={2}>Set New Password</Heading>
                        <Text color="gray.500" fontSize="sm" mb={6}>Enter your new password below.</Text>

                        {error && <Alert status="error" borderRadius="md" mb={4} size="sm"><AlertIcon />{error}</Alert>}

                        <form onSubmit={handleSubmit}>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>New Password</FormLabel>
                                    <InputGroup>
                                        <Input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                                            value={password} onChange={(e) => setPassword(e.target.value)} required />
                                        <InputRightElement>
                                            <Button size="sm" variant="ghost" onClick={() => setShowPw(!showPw)}>
                                                <Icon as={showPw ? FiEyeOff : FiEye} />
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <Input type="password" placeholder="Repeat password"
                                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </FormControl>
                                <Button type="submit" colorScheme="teal" size="lg" w="full"
                                    isLoading={loading} loadingText="Resetting..." leftIcon={<FiLock />}>
                                    Reset Password
                                </Button>
                            </VStack>
                        </form>
                    </>
                )}
            </Box>
        </Flex>
    );
};

export default ResetPasswordPage;
