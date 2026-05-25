import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      // Swap the module registry implementation at build time:
      //   npm run build              → filesystem discovery (self-hosted)
      //   npm run build:hosted       → API-driven registry (hosted version)
      '@modules/registry': mode === 'hosted'
        ? path.resolve(__dirname, 'src/utils/moduleRegistryApi.js')
        : path.resolve(__dirname, 'src/utils/moduleRegistry.js'),
    },
  },
}))
