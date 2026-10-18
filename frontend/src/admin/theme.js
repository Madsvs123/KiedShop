import { extendTheme } from '@chakra-ui/react';
import baseTheme from '../theme';

const adminTheme = extendTheme({
    ...baseTheme,
    config: {
        initialColorMode: 'light',
        useSystemColorMode: false,
    },
    styles: {
        global: (props) => ({
            body: {
                bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
                color: props.colorMode === 'dark' ? 'white' : 'gray.800',
                fontSize: '14px',
            },
            '.admin-card': {
                bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
                borderRadius: 'lg',
                boxShadow: 'sm',
                borderWidth: '1px',
                borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
            },
            '.stat-value': {
                fontSize: '24px',
                fontWeight: 'bold',
                lineHeight: '1.2',
            },
            '.stat-label': {
                fontSize: '12px',
                color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
            },
        }),
    },
    components: {
        ...baseTheme.components,
        Table: {
            variants: {
                admin: {
                    th: {
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'gray.500',
                        bg: 'gray.50',
                        borderBottom: '2px solid',
                        borderColor: 'gray.200',
                        py: 3,
                    },
                    td: {
                        fontSize: '13px',
                        py: 3,
                        borderBottom: '1px solid',
                        borderColor: 'gray.100',
                    },
                    tr: {
                        _hover: { bg: 'gray.50' },
                        transition: 'background 0.15s',
                    },
                },
            },
        },
        Card: {
            baseStyle: (props) => ({
                bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
                borderRadius: 'lg',
                boxShadow: 'sm',
                borderWidth: '1px',
                borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
                overflow: 'hidden',
            }),
        },
        Stat: {
            baseStyle: {
                label: { fontSize: 'xs', color: 'gray.500', textTransform: 'uppercase', letterSpacing: '0.05em' },
                number: { fontSize: '2xl', fontWeight: 'bold' },
            },
        },
        Badge: {
            variants: {
                admin: (props) => ({
                    px: 2,
                    py: 0.5,
                    borderRadius: 'full',
                    fontSize: '11px',
                    fontWeight: '500',
                    textTransform: 'capitalize',
                }),
            },
        },
    },
});

export default adminTheme;
