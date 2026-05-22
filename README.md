# Innovatek AI Automation Solutions

This project is a high-tech landing page for Innovatek, featuring AI-powered automation solutions.

## Deployment to GitHub Pages

This repository is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1.  **Initialize Git & Push to GitHub**:
    If you haven't already, initialize a git repository and push your code to a new GitHub repository:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

2.  **Enable GitHub Actions Deployment**:
    *   Go to your repository on GitHub.
    *   Navigate to **Settings** > **Pages**.
    *   Under **Build and deployment** > **Source**, select **GitHub Actions**.

3.  **Automatic Deployment**:
    *   Once enabled, every push to the `main` branch will automatically trigger the deployment workflow defined in `.github/workflows/deploy.yml`.
    *   You can monitor the progress in the **Actions** tab.

### Local Development

To run the project locally:

```bash
npm install
npm run dev
```

To build the project:

```bash
npm run build
```
