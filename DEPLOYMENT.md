# Deploying Fadu Card Game to Sevalla.com

This guide provides step-by-step instructions for deploying the Fadu Card Game application to Sevalla.com.

## Prerequisites

- GitHub repository is set up and code is pushed (✓ completed)
- Production build has been tested locally (✓ completed)
- Sevalla.com account is active

## Deployment Steps

### 1. Log in to Sevalla.com

- Navigate to [app.sevalla.com](https://app.sevalla.com)
- Sign in with your credentials

### 2. Create a New Application Deployment

1. From the Sevalla dashboard, click on "Deploy an application" (visible in the Application section)
2. Connect your GitHub account if not already connected
3. Select the `fadu-mobile` repository
4. Choose the main branch for deployment

### 3. Configure Deployment Settings

- **Framework**: Select React.js
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Node Version**: Choose the appropriate Node.js version (recommended: 16.x or newer)

### 4. Environment Variables

No specific environment variables are required for basic deployment.

### 5. Advanced Settings (Optional)

- **Auto Deploy**: Enable to automatically deploy when new commits are pushed to the main branch
- **Preview Deployments**: Consider enabling for branch previews

### 6. Deploy

Click "Deploy" to start the deployment process. Sevalla will:
1. Clone the repository
2. Install dependencies
3. Build the application
4. Deploy the build to their hosting infrastructure

## Post-Deployment

After successful deployment, you'll receive a URL where your application is hosted. Test the application to ensure:

- All game functionality works correctly
- Styles and assets are loading properly
- The responsive design works on different device sizes

Note that since this is a Capacitor-enabled application, some mobile-specific features (haptic feedback, status bar customization) will only work in the native mobile app builds, not in the web deployment.

## Troubleshooting

If you encounter deployment issues:

1. Check the build logs provided by Sevalla
2. Verify that all dependencies are correctly listed in package.json
3. Ensure the build process completes successfully
4. Check for any console errors in the deployed application

## Future Updates

For future updates:

1. Make changes to your local repository
2. Test locally
3. Commit and push to GitHub
4. If auto-deploy is enabled, Sevalla will automatically deploy the updates
5. If manual deployment is configured, trigger a new deployment from the Sevalla dashboard
