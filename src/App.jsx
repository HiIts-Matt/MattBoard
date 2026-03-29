import './App.css';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Page } from './components/Page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PageHandler } from './page-handler';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider>
                <PageHandler/>
            </MantineProvider>
        </QueryClientProvider>
    );
}

export default App;
