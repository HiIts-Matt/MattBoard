import './App.css';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { config } from './appConfig'
import { Page } from './components/Page';

function App() {
    return (
        <MantineProvider>
            {config?.pages?.map(page => (
                <Page page={page} />
            ))}
        </MantineProvider>
    );
}

export default App;
