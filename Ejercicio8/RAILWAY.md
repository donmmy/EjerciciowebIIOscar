# Deploying to Railway

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Ejercicio8
   ```

2. **Connect to Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   ```

3. **Set Environment Variables in Railway**
   ```bash
   railway variables set \
     PORT=3000 \
     NODE_ENV=production \
     JWT_SECRET=your_32_char_secret_here \
     DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/blog
   ```

   Or use the Railway Dashboard:
   - Go to your project
   - Click "Variables"
   - Add each variable from `.env.example`

4. **Deploy**
   ```bash
   railway up
   ```

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `production` |
| `DATABASE_URL` | MongoDB connection string (Railway uses this) | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT (min 32 chars) | `your_secure_32_char_key_here!!!` |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `SLACK_WEBHOOK` | Slack error notifications (optional) | `https://hooks.slack.com/...` |

## MongoDB Setup

### Option 1: Railway MongoDB
1. In Railway Dashboard, click "Add Service"
2. Select "MongoDB"
3. Railway will automatically set `DATABASE_URL` variable

### Option 2: External MongoDB (Atlas)
1. Create MongoDB Atlas cluster
2. Get connection string
3. Set as `DATABASE_URL` environment variable

## Health Check

Railway will automatically detect the health check endpoint at `/health`

## Logs

View logs in Railway Dashboard or via CLI:
```bash
railway logs
```

## Troubleshooting

### Port issues
- Railway automatically assigns ports, read from `process.env.PORT`
- Already configured in code ✓

### Database connection
- Use `DATABASE_URL` instead of `DB_URI`
- Already configured in `.env.example` ✓

### Module issues
- Using ES Modules (type: "module" in package.json) ✓
- All imports use `.js` extensions ✓

## Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with local MongoDB URI and JWT secret

# Run dev server
npm run dev
```

## Production Checklist

- [x] Dockerfile configured
- [x] .dockerignore optimized
- [x] railway.json created
- [x] Environment variables documented
- [x] Health check endpoint available
- [x] PORT uses environment variable
- [x] Error handling configured
- [x] Swagger docs available
- [x] Tests included

## After Deployment

Access your app at: `https://<railway-domain>.railway.app`

- API: `https://<railway-domain>.railway.app/api`
- Docs: `https://<railway-domain>.railway.app/api-docs`
- Health: `https://<railway-domain>.railway.app/health`
