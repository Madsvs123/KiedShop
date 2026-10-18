import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
    primary: {
      50: '#e6fffa',
      100: '#b2f5ea',
      200: '#81e6d9',
      300: '#4fd1c5',
      400: '#38b2ac',
      500: '#319795',
      600: '#2c7a7b',
      700: '#285e61',
      800: '#234e52',
      900: '#1d4044',
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    // Arabic font — used via CSS class .rtl
    arabic: `'Cairo', 'Noto Naskh Arabic', 'Tajawal', 'Segoe UI', Tahoma, sans-serif`,
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
      // RTL Arabic styles
      '.rtl': {
        direction: 'rtl',
        textAlign: 'right',
        '& .chakra-heading, & .chakra-text': {
          fontFamily: `'Cairo', 'Noto Naskh Arabic', 'Tajawal', 'Segoe UI', Tahoma, sans-serif`,
        },
        '& .chakra-button': {
          flexDirection: 'row-reverse',
          '& .chakra-button__icon': {
            marginInlineEnd: '0!important',
            marginInlineStart: '0.5rem!important',
          },
        },
      },
      '.ltr': {
        direction: 'ltr',
        textAlign: 'left',
      },

      '.rtl .chakra-stack': {
        '&[direction="row"]': {
          flexDirection: 'row-reverse',
        },
      },
      '.page-container': {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px',
      },
      '.section-title': {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '24px',
      },
      '.card': {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        borderRadius: 'lg',
        boxShadow: 'sm',
        borderWidth: '1px',
        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
        overflow: 'hidden',
      },
      // RTL-aware scrollbar
      '.rtl [direction="row"]': {
        flexDirection: 'row-reverse',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'md',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === 'teal' ? 'primary.500' : `${props.colorScheme}.500`,
          color: 'white',
          _hover: {
            bg: props.colorScheme === 'teal' ? 'primary.600' : `${props.colorScheme}.600`,
            transform: 'translateY(-1px)',
            _disabled: { transform: 'none' },
          },
          transition: 'all 0.15s',
        }),
        outline: (props) => ({
          borderColor: props.colorScheme === 'teal' ? 'primary.500' : `${props.colorScheme}.500`,
          color: props.colorScheme === 'teal' ? 'primary.500' : `${props.colorScheme}.500`,
          _hover: {
            bg: props.colorScheme === 'teal' ? 'primary.50' : `${props.colorScheme}.50`,
          },
        }),
      },
      defaultProps: { colorScheme: 'teal' },
    },
    Heading: {
      baseStyle: {
        fontWeight: '700',
        letterSpacing: '-0.02em',
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
    Input: {
      variants: {
        outline: (props) => ({
          field: {
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
            _hover: { borderColor: 'gray.300' },
            _focus: { borderColor: 'primary.500', boxShadow: '0 0 0 1px #319795' },
          },
        }),
      },
      defaultProps: { focusBorderColor: 'primary.500' },
    },
    Textarea: {
      defaultProps: { focusBorderColor: 'primary.500' },
    },
    Select: {
      defaultProps: { focusBorderColor: 'primary.500' },
    },
    Badge: {
      baseStyle: { fontWeight: '500' },
    },
    Link: {
      baseStyle: {
        color: 'primary.500',
        _hover: { color: 'primary.600' },
      },
    },
    Tabs: {
      variants: {
        'soft-rounded': {
          tab: {
            _selected: { bg: 'primary.100', color: 'primary.700' },
          },
        },
      },
    },
    Progress: {
      baseStyle: (props) => ({
        filledTrack: {
          bg: props.colorScheme === 'teal' ? 'primary.500' : `${props.colorScheme}.500`,
        },
      }),
    },
  },
});

export default theme;
