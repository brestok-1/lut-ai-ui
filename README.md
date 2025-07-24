# LUT AI Transformer

A Vite application for transforming LUT files with AI-powered prompts.

## Development

```bash
npm install
npm run dev
```

## Deployment to GitHub Pages

### Automatic Deployment (Recommended)

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy your app
3. Configure the API URL in your repository settings:
   - Go to Settings > Secrets and variables > Actions
   - Add a new repository variable: `VITE_API_BASE_URL` with your production API URL

### Manual Deployment

```bash
npm run deploy
```

### Configuration

Create a `.env` file for local development:

```
VITE_API_BASE_URL=http://localhost:8000
```

For production, set the `VITE_API_BASE_URL` environment variable to your production API endpoint.

## GitHub Pages Setup

1. Go to your repository Settings > Pages
2. Select "GitHub Actions" as the source
3. The app will be available at `https://yourusername.github.io/lut-ai/`

## API Requirements

This application requires a backend API with the following endpoints:
- `GET /cube-files` - Get uploaded files
- `POST /upload-cube` - Upload LUT file  
- `POST /transform-lut` - Transform LUT with AI prompt 