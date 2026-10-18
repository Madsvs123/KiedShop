import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, FormControl, FormLabel, Input, Button,
    useColorModeValue, Link, Alert, AlertIcon, useToast, Divider,
    InputGroup, InputRightElement, VStack, Image, AbsoluteCenter,
    Progress, Checkbox, HStack
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../store/slices/authActions';
import { clearError } from '../store/slices/authSlice';

// Register image - you can replace with your own image URL
const REGISTER_IMAGE = 'https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';

const RegisterPage = () => {
    const { t } = useTranslation("pages");
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const formBg = useColorModeValue('white', 'gray.900');
    const inputBg = useColorModeValue('white', 'gray.900');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const toast = useToast();
    
    const { userInfo, loading, error } = useSelector((state) => state.auth);
    
    useEffect(() => {
        if (userInfo) {
            toast({
                title: 'Welcome aboard!',
                description: `Your account has been created successfully, ${userInfo.name}`,
                status: 'success',
                duration: 4000,
                isClosable: true,
                position: 'top-right',
            });
            navigate('/');
        }
    }, [userInfo, navigate, toast]);
    
    useEffect(() => {
        if (error) {
            toast({
                title: 'Registration failed',
                description: error,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
            });
            dispatch(clearError());
        }
    }, [error, dispatch, toast]);
    
    useEffect(() => {
        const password = formData.password;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        setPasswordStrength(strength);
    }, [formData.password]);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const validateForm = () => {
        if (!formData.name.trim()) {
            toast({ title: 'Name required', status: 'warning', duration: 3000 });
            return false;
        }
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast({ title: 'Valid email required', status: 'warning', duration: 3000 });
            return false;
        }
        if (formData.password.length < 6) {
            toast({ title: `${t('password')} must be at least 6 characters`, status: 'warning', duration: 3000 });
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast({ title: `${t('password')}s do not match`, status: 'warning', duration: 3000 });
            return false;
        }
        if (!acceptTerms) {
            toast({ title: `Please accept ${t('terms')} & Conditions`, status: 'warning', duration: 3000 });
            return false;
        }
        return true;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        await dispatch(register({
            name: formData.name,
            email: formData.email,
            password: formData.password
        }));
    };
    
    const handleGoogleRegister = () => {
        setIsGoogleLoading(true);
        setTimeout(() => {
            toast({
                title: 'Google Registration',
                description: 'Google OAuth integration coming soon',
                status: 'info',
                duration: 3000,
            });
            setIsGoogleLoading(false);
        }, 1000);
    };
    
    const getPasswordStrengthColor = () => {
        const colors = ['red.400', 'orange.400', 'yellow.400', 'green.500'];
        return colors[passwordStrength - 1] || 'gray.200';
    };

    const getPasswordStrengthText = () => {
        const texts = [t('weak'), t('fair'), t('good'), t('strong')];
        return texts[passwordStrength - 1] || t('veryWeak') || 'Very weak';
    };
    
    const passwordsMatch = formData.password && formData.confirmPassword &&
        formData.password === formData.confirmPassword;
    
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
                    src={REGISTER_IMAGE}
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
                        {t("joinUs")}
                    </Heading>
                    <Text fontSize="lg" opacity={0.9}>
                        {t('joinUsDesc')}
                    </Text>
                </Box>
            </Box>
            
            {/* Right Side - Register Form */}
            <Flex
                flex="1"
                align="center"
                justify="center"
                bg={formBg}
                p={8}
                overflowY="auto"
            >
                <Box w="full" maxW="500px">
                    {/* Logo/Brand */}
                    <Box textAlign="center" mb={6}>
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
                            {t("createAccount")}
                        </Heading>
                        <Text color="gray.500">
                            {t('createAccountDesc')}
                        </Text>
                    </Box>
                    
                    {error && (
                        <Alert status="error" mb={6} borderRadius="lg">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="medium">
                                    {t("fullName")}
                                </FormLabel>
                                <InputGroup>
                                    <Input
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={t("fullNamePlaceholder")}
                                        size="lg"
                                        borderRadius="lg"
                                        pl={10}
                                    />
                                    <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                                        <FiUser color="gray.400" />
                                    </Box>
                                </InputGroup>
                            </FormControl>
                            
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="medium">
                                    {t("email")}
                                </FormLabel>
                                <InputGroup>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
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
                                <FormLabel fontSize="sm" fontWeight="medium">
                                    {t("password")}
                                </FormLabel>
                                <InputGroup>
                                    <Input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={t("createPassword")}
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
                                            size="sm"
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                                
                                {formData.password && (
                                    <Box mt={2}>
                                        <HStack justify="space-between" mb={1}>
                                            <Text fontSize="xs" color="gray.500">{t('passwordStrength')}</Text>
                                            <Text fontSize="xs" fontWeight="medium" color={getPasswordStrengthColor()}>
                                                {getPasswordStrengthText()}
                                            </Text>
                                        </HStack>
                                        <Progress
                                            value={passwordStrength * 25}
                                            size="xs"
                                            colorScheme={passwordStrength >= 3 ? 'green' : 'orange'}
                                            borderRadius="full"
                                        />
                                    </Box>
                                )}
                            </FormControl>
                            
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="medium">
                                    Confirm {t("password")}
                                </FormLabel>
                                <InputGroup>
                                    <Input
                                        name="confirmPassword" 
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder={t("confirmPasswordPlaceholder")}
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
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            size="sm"
                                        >
                                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                                    {formData.confirmPassword && (
                                        <Text fontSize="xs" color={passwordsMatch ? 'green.500' : 'red.500'} mt={1}>
                                            {passwordsMatch ? `✓ ${t('password')}s match` : `✗ ${t('password')}s do not match`}
                                        </Text>
                                    )}
                            </FormControl>
                            
                            <Checkbox
                                isChecked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                colorScheme="brand"
                                size="sm"
                            >
                                <Text fontSize="sm">
                                    {t('termsAgree')}{' '}
                                    <Link href="#" color="brand.500">{t('terms')}</Link>
                                    {' '}and{' '}
                                    <Link href="#" color="brand.500">{t('privacyPolicy')}</Link>
                                </Text>
                            </Checkbox>
                            
                            <Button
                                type="submit"
                                colorScheme="brand"
                                size="lg"
                                w="full"
                                isLoading={loading}
                                loadingText={t("signingUp")}
                                leftIcon={<FiUserPlus />}
                                _hover={{ transform: 'translateY(-2px)' }}
                                transition="all 0.2s"
                            >
                                {t("createAccount")}
                            </Button>
                        </VStack>
                    </form>
                    
                    <Box position="relative" my={6}>
                        <Divider />
                        <AbsoluteCenter bg={inputBg} px={4}>
                            <Text fontSize="sm" color="gray.500">{t("or")}</Text>
                        </AbsoluteCenter>
                    </Box>
                    
                    <Button
                        w="full"
                        size="lg"
                        variant="outline"
                        leftIcon={<FcGoogle size={20} />}
                        onClick={handleGoogleRegister}
                        isLoading={isGoogleLoading}
                        _hover={{ bg: hoverBg }}
                        borderRadius="lg"
                    >
                        {t('signUpWithGoogle')}
                    </Button>
                    
                    <Flex justify="center" mt={6}>
                        <Text color="gray.500">
                            {t('alreadyHaveAccount')}{' '}
                            <Link
                                as={RouterLink}
                                to="/login"
                                color="brand.500"
                                fontWeight="semibold"
                                _hover={{ textDecoration: 'underline' }}
                            >
                                {t('signIn')}
                            </Link>
                        </Text>
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
};

export default RegisterPage;