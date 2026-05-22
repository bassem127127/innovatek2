import { defineConfig } from 'vite';

// Automatically determine base path from GitHub environment or fallback to root
const base = process.env.GITHUB_REPOSITORY 
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` 
  : '/';

export default defineConfig({
  base: base,
  build: {
    outDir: 'dist',
  },
});
