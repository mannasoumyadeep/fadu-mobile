# Fadu Card Game: Sevalla Deployment Guide

This guide provides detailed instructions for deploying the Fadu Card Game on Sevalla.com.

## What We've Done

We've optimized the project for deployment on Sevalla by:

1. **Added Node.js Version Specification**: Set Node.js 18.x in package.json.
2. **Created Nixpacks Configuration**: Added nixpacks.toml with custom build commands.
3. **Added NPM Configuration**: Created .npmrc with legacy-peer-deps flag.
4. **Web Compatibility Layer**: Added capacitor-web-compat.js to handle Capacitor in web environments.
5. **Modified App.js**: Updated to conditionally use web compatibility implementations.
6. **Updated Scripts**: Added serve script to package.json.
7. **GitHub Setup**: Updated README.md and created GitHub workflow.

## Deploying to Sevalla

Follow these steps to deploy your application on Sevalla:

### 1. Login to Sevalla

- Navigate to [app.sevalla.com](https://app.sevalla.com)
- Sign in with your Sevalla credentials

### 2. Create a New Application

- Click on "Deploy an application" from the main dashboard
- Connect your GitHub account if not already connected

### 3. Select Your Repository

- Choose the "mannasoumyadeep/fadu-mobile" repository
- Select the main branch for deployment

### 4. Configure Deployment Settings

- **Build Package**: Select "Nixpacks" (this should be automatically detected)
- **Node.js Version**: Should be automatically detected from package.json
- **Framework**: React.js
- **Build Command**: Should be automatically detected from nixpacks.toml

### 5. Deploy the Application

- Click "Deploy" to start the deployment process
- Sevalla will build and deploy your application based on the configuration

### 6. Monitor Deployment

- Monitor the build logs for any issues
- Once deployment is successful, Sevalla will provide a URL to access your application

## Troubleshooting

If you encounter any issues during deployment:

### Issue: NPM Installation Failures

- Check the build logs to identify the specific package causing issues
- You may need to update the `nixpacks.toml` file with additional packages or configuration

### Issue: Build Process Failures

- Verify that your Node.js version (18.x) is compatible with all dependencies
- Check the build logs for errors related to specific build steps

### Issue: Runtime Errors

- Test the application locally using `npm run build` and `npm run serve`
- Check for any browser console errors that might indicate compatibility issues

## Future Updates

When you need to update the application:

1. Make your changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Sevalla will automatically redeploy your application if you've configured automatic deployments

## Resources

- [Sevalla Documentation](https://docs.sevalla.com/application-hosting)
- [Nixpacks Documentation](https://nixpacks.com/docs)
- [React Deployment Best Practices](https://create-react-app.dev/docs/deployment/)
