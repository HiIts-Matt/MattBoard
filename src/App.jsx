import './App.css';
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { Page } from './components/Page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PageHandler } from './page-handler';

const queryClient = new QueryClient();
window.__TANSTACK_QUERY_CLIENT__ = queryClient

function App() {

    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider
                theme={theme}
                cssVariablesResolver={cssVariablesResolver}
            >
                <PageHandler />
            </MantineProvider>
        </QueryClientProvider>
    );
}

export default App;

const theme = createTheme({
    fontFamily: 'Space Grotesk, sans-serif',
    primaryColor: 'violet',

    other: {
        //general module styles
        bgColor: 'rgba(50, 50, 50, 0.2)',
        bgEffect: 'blur(12px)',
        darkenedBg: 'rgba(0, 0, 0, 0.2)',
        lightenedBd: 'rgba(255, 255, 255, 0.2)',
        componentRadius: '12px',
        componentPadding: '16px',
        componentW: '400px',
        bd: 'none',
        innerBd: '1px solid rgba(255, 255, 255, 0.5)',
        dimmedBd: '1px solid rgba(255, 255, 255, 0.2)',
        mainFont: '"Space Grotesk", sans-serif',
        titleFz: '32px',
        bodyFz: '12px',
        glyphColorFilled: 'rgba(255, 255, 255, 1)',
        glyphColorSolid: 'rgba(255, 255, 255, 0.7)',
        glyphColorMinimal: 'rgba(255, 255, 255, 0.5)',

        //nav styling
        navElementBg: 'black',
        navPillRadius: '100px',
        navOutline: '2px solid rgba(255, 255, 255, 0.3)',
        navOutlineHover: '2px solid white',
        navTextColor: 'white',
        navDivider: '1px solid rgba(255, 255, 255, 0.3)',

        // context menu styling
        contextMenuBg: 'var(--nav-element-bg)',
        contextMenuRadius: 'var(--component-rd)',
        contextMenuOutline: 'var(--nav-outline)',
        contextMenuTextColor: 'var(--nav-text-color)',
        contextMenuDivider: 'var(--nav-divider)',
        contextMenuPillRadius: 'var(--nav-pill-radius)',

    },
});

const cssVariablesResolver = (theme) => ({
    variables: {
        '--bg-color': theme.other.bgColor,
        '--bg-effect': theme.other.bgEffect,
        '--dark-bg': theme.other.darkenedBg,
        '--light-bg': theme.other.lightenedBg,
        '--component-rd': theme.other.componentRadius,
        '--component-pd': theme.other.componentPadding,
        '--component-w': theme.other.componentW,
        '--bd': theme.other.bd,
        '--inner-bd': theme.other.innerBd,
        '--dimmed-bd': theme.other.dimmedBd,
        '--main-font': theme.other.mainFont,
        '--title-fz': theme.other.titleFz,
        '--small-title-fz': theme.other.smallTitleFz,
        '--body-fz': theme.other.bodyFz,
        '--glyph-color-filled': theme.other.glyphColorFilled,
        '--glyph-color-solid': theme.other.glyphColorSolid,
        '--glyph-color-minimal': theme.other.glyphColorMinimal,

        //nav styling
        '--nav-element-bg': theme.other.navElementBg,
        '--nav-pill-radius': theme.other.navPillRadius,
        '--nav-outline': theme.other.navOutline,
        '--nav-outline-hover': theme.other.navOutlineHover,
        '--nav-text-color': theme.other.navTextColor,
        '--nav-divider': theme.other.navDivider,

        // context menu styling
        '--ctx-menu-bg': theme.other.contextMenuBg,
        '--ctx-menu-radius': theme.other.contextMenuRadius,
        '--ctx-menu-outline': theme.other.contextMenuOutline,
        '--ctx-menu-text-color': theme.other.contextMenuTextColor,
        '--ctx-menu-divider': theme.other.contextMenuDivider,
        '--ctx-menu-pill-radius': theme.other.contextMenuPillRadius,
    },
    dark: {},
    light: {},
});