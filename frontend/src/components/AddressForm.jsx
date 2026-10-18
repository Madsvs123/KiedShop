import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    Input,
    Button,
    VStack,
} from '@chakra-ui/react';

const schema = yup.object({
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    postalCode: yup.string().required('Postal code is required').min(5, 'Must be at least 5 characters'),
    country: yup.string().required('Country is required'),
}).required();

export const AddressForm = ({ onSubmit, defaultValues }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues,
    });
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4}>
                <FormControl isInvalid={errors.address}>
                    <FormLabel>Street Address</FormLabel>
                    <Input {...register('address')} placeholder="123 Main St" />
                    <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.city}>
                    <FormLabel>City</FormLabel>
                    <Input {...register('city')} placeholder="New York" />
                    <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.postalCode}>
                    <FormLabel>Postal Code</FormLabel>
                    <Input {...register('postalCode')} placeholder="10001" />
                    <FormErrorMessage>{errors.postalCode?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.country}>
                    <FormLabel>Country</FormLabel>
                    <Input {...register('country')} placeholder="United States" />
                    <FormErrorMessage>{errors.country?.message}</FormErrorMessage>
                </FormControl>
                
                <Button
                    type="submit"
                    colorScheme="teal"
                    width="full"
                    isLoading={isSubmitting}
                >
                    Continue
                </Button>
            </VStack>
        </form>
    );
};