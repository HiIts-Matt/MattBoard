import './App.css';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { config } from './appConfig/appConfig'
import { Page } from './components/Page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider>
                {config?.pages?.map(page => (
                    <Page page={page} />
                ))}
            </MantineProvider>
        </QueryClientProvider>
    );
}

export default App;
