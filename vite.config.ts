import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves:
// - User/Org site: https://<user>.github.io/ (repo name: <user>.github.io)  -> base should be '/'
// - Project site:  https://<user>.github.io/<repo>/                      -> base should be '/<repo>/'
//
// In GitHub Actions we can detect the repo name via GITHUB_REPOSITORY.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')?.[1]
const isUserOrOrgSite = Boolean(repoName && repoName.endsWith('.github.io'))
const base = process.env.GITHUB_ACTIONS && repoName && !isUserOrOrgSite ? `/${repoName}/` : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
