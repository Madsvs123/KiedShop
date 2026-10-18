import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import store from './store/store';
import theme from './theme';
import App from './App';
import AdminApp from './admin/App';
import { PayPalProvider } from './components/PayPalProvider';
import { initI18n } from './i18n/config';
import I18nInitWrapper from './i18n/I18nInitWrapper';

const queryClient = new QueryClient();

// Initialize i18n, then render
initI18n().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <PayPalProvider>
              <Router>
                <I18nInitWrapper>
                  <Routes>
                    <Route path="/*" element={<App />} />
                    <Route path="/admin/*" element={<AdminApp />} />
                  </Routes>
                </I18nInitWrapper>
              </Router>
            </PayPalProvider>
          </QueryClientProvider>
        </Provider>
      </ChakraProvider>
    </React.StrictMode>
  );
});
