import React, { useState } from 'react';
import { Select, VStack, FormLabel } from '@chakra-ui/react';
import { CountryRegionData } from 'react-country-region-selector';

export const LocationSelector = ({ onChange }) => {
    const [country, setCountry] = useState('');
    const [region, setRegion] = useState('');
    
    return (
        <VStack spacing={4}>
            <Select
                placeholder="Select Country"
                value={country}
                onChange={(e) => {
                    setCountry(e.target.value);
                    onChange?.({ country: e.target.value, region });
                }}
            >
                {CountryRegionData.map(([code, name]) => (
                    <option key={code} value={name}>{name}</option>
                ))}
            </Select>
            
            {country && (
                <Select
                    placeholder="Select State/Province"
                    value={region}
                    onChange={(e) => {
                        setRegion(e.target.value);
                        onChange?.({ country, region: e.target.value });
                    }}
                >
                    {CountryRegionData.find(cr => cr[1] === country)?.[2]?.map(state => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </Select>
            )}
        </VStack>
    );
};