import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, FormControl, FormLabel, Input, Button,
    useColorModeValue, Link, Alert, AlertIcon, useToast, Divider,
    InputGroup, InputRightElement, VStack, Image, AbsoluteCenter,
    Icon, HStack, Spinner
} from '@chakra-ui/react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authActions';
import { clearError } from '../store/slices/authSlice';

// Login image - you can replace with your own image URL
const LOGIN_IMAGE = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';

const LoginPage = () => {
    const { t } = useTranslation("pages");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const toast = useToast();
    const formBg = useColorModeValue("white", "gray.900");
    const inputBg = useColorModeValue("white", "gray.900");
    const hoverBg = useColorModeValue("gray.50", "gray.700");
    const sectionBg = useColorModeValue("gray.50", "gray.800");
    
    const { userInfo, loading, error } = useSelector((state) => state.auth);
    
    useEffect(() => {
        if (userInfo) {
            toast({
                title: t('welcomeBack'),
                description: `Hello, ${userInfo.name}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            // Admin goes to admin dashboard, users go to home
            navigate(userInfo?.isAdmin ? '/admin/dashboard' : '/');
        }
    }, [userInfo, navigate, toast]);
    
    useEffect(() => {
        if (error) {
            toast({
                title: t('loginFailed'),
                description: error,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
            });
            dispatch(clearError());
        }
    }, [error, dispatch, toast]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            toast({
                title: t('missingFields'),
                description: t('missingFieldsDesc'),
                status: 'warning',
                duration: 3000,
            });
            return;
        }
        
        await dispatch(login({ email, password }));
    };
    
    const handleGoogleLogin = () => {
        setIsGoogleLoading(true);
        // Google OAuth would be implemented here
        setTimeout(() => {
            toast({
                title: t('googleLoginComing'),
                description: t('googleLoginComing'),
                status: 'info',
                duration: 3000,
            });
            setIsGoogleLoading(false);
        }, 1000);
    };
    
    return (
        <Flex minH="100vh" overflow="hidden">
            {/* Left Side - Image */}
            <Box
                flex="1"
                position="relative"
                display={{ base: 'none', lg: 'block' }}
                bg="brand.500"
            >
                <Image
                    src={LOGIN_IMAGE}
                    alt="Shopping"
                    objectFit="cover"
                    w="100%"
                    h="100%"
                    fallbackSrc="https://via.placeholder.com/800x1200?text=Shopping"
                />
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)"
                />
                <Box
                    position="absolute"
                    bottom={12}
                    left={8}
                    right={8}
                    color="white"
                >
                    <Heading size="2xl" mb={4}>
                        Welcome Back!
                    </Heading>
                    <Text fontSize="lg" opacity={0.9}>
                        {t('welcomeBackDesc')}
                    </Text>
                </Box>
            </Box>
            
            {/* Right Side - Login Form */}
            <Flex
                flex="1"
                align="center"
                justify="center"
                bg={formBg}
                p={8}
                overflowY="auto"
            >
                <Box w="full" maxW="450px">
                    {/* Logo/Brand */}
                    <Box textAlign="center" mb={8}>
                        <Box
                            as="span"
                            fontSize="3xl"
                            fontWeight="bold"
                            bgGradient="linear(to-r, brand.500, brand.700)"
                            bgClip="text"
                        >
                            E-Shop
                        </Box>
                        <Heading size="xl" mt={4} mb={2}>
                            {t('signIn')}
                        </Heading>
                        <Text color="gray.500">
                            {t('signInDesc')}
                        </Text>
                    </Box>
                    
                    {error && (
                        <Alert status="error" mb={6} borderRadius="lg">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={5}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="medium">{t("email")}</FormLabel>
                                <InputGroup>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t("emailPlaceholder")}
                                        size="lg"
                                        borderRadius="lg"
                                        pl={10}
                                    />
                                    <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                                        <FiMail color="gray.400" />
                                    </Box>
                                </InputGroup>
                            </FormControl>
                            
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="medium">{t("password")}</FormLabel>
                                <InputGroup>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t("passwordPlaceholder")}
                                        size="lg"
                                        borderRadius="lg"
                                        pl={10}
                                    />
                                    <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                                        <FiLock color="gray.400" />
                                    </Box>
                                    <InputRightElement h="full">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={t("signIn")}
                                            size="sm"
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                            
                            <Flex justify="flex-end" w="full">
                                <Link
                                    as={RouterLink}
                                    to="/forgot-password"
                                    color="brand.500"
                                    fontSize="sm"
                                    _hover={{ textDecoration: 'underline' }}
                                >
                                    {t('forgotPassword')}
                                </Link>
                            </Flex>
                            
                            <Button
                                type="submit"
                                colorScheme="brand"
                                size="lg"
                                w="full"
                                isLoading={loading}
                                loadingText={t("signingIn")}
                                leftIcon={<FiLogIn />}
                                _hover={{ transform: 'translateY(-2px)' }}
                                transition="all 0.2s"
                            >
                                {t('signIn')}
                            </Button>
                        </VStack>
                    </form>
                    
                    <Box position="relative" my={8}>
                        <Divider />
                        <AbsoluteCenter bg={formBg} px={4}>
                            <Text fontSize="sm" color="gray.500">{t("or")}</Text>
                        </AbsoluteCenter>
                    </Box>
                    
                    <Button
                        w="full"
                        size="lg"
                        variant="outline"
                        leftIcon={<FcGoogle size={20} />}
                        onClick={handleGoogleLogin}
                        isLoading={isGoogleLoading}
                        _hover={{ bg: hoverBg }}
                        borderRadius="lg"
                    >
                        {t('continueWithGoogle')}
                    </Button>
                    
                    <Flex justify="center" mt={6}>
                        <Text color="gray.500">
                            {t('dontHaveAccount')}{' '}
                            <Link
                                as={RouterLink}
                                to="/register"
                                color="brand.500"
                                fontWeight="semibold"
                                _hover={{ textDecoration: 'underline' }}
                            >
                                {t('createAccount')}
                            </Link>
                        </Text>
                    </Flex>
                    
                    {/* {t('demoCredentials')} */}
                    <Box
                        mt={8}
                        p={4}
                        bg={sectionBg}
                        borderRadius="lg"
                        textAlign="center"
                    >
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                            {t('demoCredentials')}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            {t('demoEmail')}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            {t('demoPassword')}
                        </Text>
                    </Box>
                </Box>
            </Flex>
        </Flex>
    );
};

export default LoginPage;