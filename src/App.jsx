import './App.css';
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { Page } from './components/Page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PageHandler } from './page-handler';
import { ModalHandler } from './components/ModalHandler';
import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { error: null }; }
    static getDerivedStateFromError(error) { return { error }; }
    render() {
        if (this.state.error) return (
            <div style={{ color: 'white', background: 'black', padding: 40, fontSize: 18, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                <b>Crash:</b> {this.state.error?.message}{'\n\n'}{this.state.error?.stack}
            </div>
        );
        return this.props.children;
    }
}

const queryClient = new QueryClient();
window.__TANSTACK_QUERY_CLIENT__ = queryClient

function App() {

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <MantineProvider theme={theme}>
                    <PageHandler />
                    <ModalHandler />
                </MantineProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;

const theme = createTheme({
    fontFamily: 'Space Grotesk, sans-serif',
    primaryColor: 'teal',
});
