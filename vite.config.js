import { defineConfig } from 'vite';
import { existsSync } from 'node:fs';

// If deploying to a custom domain (CNAME exists), base path should be '/'
// otherwise GitHub Actions sets GITHUB_REPOSITORY to "owner/repo" so asset URLs match /<repo>/
const hasCname = existsSync('CNAME') || existsSync('public/CNAME');
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];

export default defineConfig({
  base: hasCname ? '/' : (repoName ? `/${repoName}/` : '/'),
  build: {
    outDir: 'dist',
  },
});
