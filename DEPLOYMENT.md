# EcoMerce Deployment Guide

Complete instructions for deploying EcoMerce to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
3. [Firebase Hosting](#firebase-hosting)
4. [Docker Deployment](#docker-deployment)
5. [AWS EC2 Deployment](#aws-ec2-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Performance Optimization](#performance-optimization)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, verify all items:

### Security
- [ ] All Firebase credentials in `.env.production`
- [ ] No credentials in source code
- [ ] Firebase Security Rules tested and reviewed
- [ ] CORS properly configured
- [ ] Admin authorization middleware implemented
- [ ] Payment signature verification implemented
- [ ] Rate limiting on sensitive endpoints
- [ ] HTTPS enforced

### Code Quality
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] ESLint passing on all files
- [ ] TypeScript compilation successful
- [ ] Dead code removed
- [ ] Debug logging removed

### Functionality
- [ ] Authentication (signup/login/logout)
- [ ] Product browsing and filtering
- [ ] Shopping cart persistence
- [ ] Checkout flow complete
- [ ] Order creation and tracking
- [ ] Admin dashboard operational
- [ ] Excel import working
- [ ] Image uploads working
- [ ] Payment flow (Razorpay) tested

### Performance
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Database indexes created
- [ ] Caching strategy implemented
- [ ] Load time < 3 seconds

### Documentation
- [ ] README.md updated
- [ ] API documentation complete
- [ ] Database schema documented
- [ ] Deployment steps recorded

---

## Vercel Deployment (Recommended)

### Why Vercel?
- Native Next.js support
- Automatic builds and deployments
- Global CDN
- Zero-config deployment
- Serverless functions
- Built-in analytics

### Step-by-Step

#### 1. Prepare Repository

```bash
# Initialize Git if not already done
git init
git add .
git commit -m "Initial commit: EcoMerce platform"

# Push to GitHub
git remote add origin https://github.com/your-username/ecommerce.git
git branch -M main
git push -u origin main
```

#### 2. Create Vercel Account

- Visit [vercel.com](https://vercel.com)
- Sign up with GitHub account
- Click "Authorize Vercel"

#### 3. Import Project

- Click "Add New..." → "Project"
- Select your GitHub repository
- Click "Import"

#### 4. Configure Environment Variables

In Vercel dashboard:

```
Settings → Environment Variables
```

Add all variables from `.env.production`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
FIREBASE_ADMIN_SDK_KEY=your_admin_key
```

#### 5. Deploy

```
Click "Deploy"
```

Vercel will:
1. Build the project
2. Run optimizations
3. Deploy to global CDN
4. Provide preview URL

#### 6. Configure Custom Domain (Optional)

```
Settings → Domains → Add custom domain
```

Follow DNS configuration steps provided by Vercel.

#### 7. Enable Analytics (Optional)

```
Analytics tab → Enable Web Analytics
```

### Automatic Deployments

Every push to `main` branch triggers automatic deployment:

```bash
git commit -m "Add new feature"
git push origin main
# ↓
# Vercel automatically builds and deploys
# ↓
# Check status at vercel.com dashboard
```

---

## Firebase Hosting

### Alternative to Vercel

**Pros:**
- Same Firebase backend reduces data transfer
- Free tier generous
- Direct Firebase integration

**Cons:**
- Manual deployment required
- No automatic deployments
- Limited serverless function support

### Deployment Steps

#### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### 2. Login to Firebase

```bash
firebase login
```

#### 3. Initialize Firebase Project

```bash
firebase init
```

Select:
- Hosting
- Use existing project
- Choose your project

When asked:
- Public directory: `.next` (or `out` if exporting)
- Single page app: No
- Auto-generated index.html: No

#### 4. Build Next.js

```bash
# Static export
npm run build
npm run export  # if configured
```

Or for SSR (requires Cloud Functions):

```bash
npm run build
```

#### 5. Deploy

```bash
firebase deploy
```

Your site will be available at:
```
https://your-project.firebaseapp.com
```

---

## Docker Deployment

### Containerized Deployment

Ideal for self-hosted and cloud platforms (AWS, GCP, Digital Ocean).

#### 1. Create Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. Create .dockerignore

```
node_modules
.git
.gitignore
README.md
.env
.env.local
.next
out
dist
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.idea
.vscode
```

#### 3. Build Docker Image

```bash
docker build -t ecommerce:latest .
```

#### 4. Test Locally

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=your_key \
  -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain \
  # ... other env vars ...
  ecommerce:latest
```

Visit `http://localhost:3000`

#### 5. Push to Registry

**Option A: Docker Hub**

```bash
docker tag ecommerce:latest your-username/ecommerce:latest
docker push your-username/ecommerce:latest
```

**Option B: GitHub Container Registry**

```bash
docker tag ecommerce:latest ghcr.io/your-username/ecommerce:latest
docker login ghcr.io
docker push ghcr.io/your-username/ecommerce:latest
```

#### 6. Deploy to Server

SSH into your server:

```bash
ssh user@your-server.com

# Pull and run container
docker pull ghcr.io/your-username/ecommerce:latest
docker run -d \
  -p 3000:3000 \
  --name ecommerce \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=your_key \
  # ... other env vars ...
  ghcr.io/your-username/ecommerce:latest
```

### Docker Compose (Multi-Container)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_FIREBASE_API_KEY: ${NEXT_PUBLIC_FIREBASE_API_KEY}
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
      # ... other env vars ...
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
```

---

## AWS EC2 Deployment

### Launch and Configure Instance

#### 1. Create EC2 Instance

- Launch Ubuntu 22.04 LTS instance (t3.micro for free tier eligible)
- Create security group allowing ports: 80, 443, 22 (SSH)
- Create/use key pair for access

#### 2. Connect via SSH

```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

#### 3. Install Dependencies

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt-get install -y nginx

# Install Git
sudo apt-get install -y git
```

#### 4. Deploy Application

```bash
# Clone repository
git clone https://github.com/your-username/ecommerce.git
cd ecommerce

# Install dependencies
npm install --production

# Build
npm run build

# Create .env.production
nano .env.production
# Paste environment variables

# Start with PM2
pm2 start npm --name "ecommerce" -- start
pm2 save
```

#### 5. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/default
```

Replace with:

```nginx
upstream ecommerce {
    server localhost:3000;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://ecommerce;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://ecommerce/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 6. Enable SSL (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx

sudo certbot certonly --nginx -d your-domain.com

# Configure auto-renewal
sudo systemctl enable certbot.timer
```

Update Nginx config to use SSL:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    # ... rest of config
}
```

---

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxxxxxxxxxx

# Application
NEXT_PUBLIC_API_URL=https://your-domain.com
NODE_ENV=production

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret_key

# Firebase Admin SDK (for server-side operations)
FIREBASE_ADMIN_SDK_KEY=your_base64_encoded_service_account_key
```

### Secrets Management Best Practices

1. **Never commit secrets** to version control
2. **Use environment management**:
   - Vercel Dashboard for Vercel
   - AWS Secrets Manager for AWS
   - GitHub Secrets for CI/CD
3. **Rotate secrets regularly**
4. **Restrict secret access** to only what's needed
5. **Audit secret usage** logs

---

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Create next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
})

# Run analysis
ANALYZE=true npm run build
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={product.imageUrl}
  alt={product.name}
  width={300}
  height={300}
  priority={false}
  loading="lazy"
/>
```

### Database Performance

**Firestore Indexes:**

```
Collection: products
Index on: category (Ascending), price (Descending)

Collection: orders
Index on: userId (Ascending), createdAt (Descending)
```

### CDN Configuration

**Firebase Storage CDN:**
- Automatically CDN distributed
- Images cached globally
- Configure cache headers in rules

### Caching Strategy

```typescript
// API route caching
export async function GET(req: NextRequest) {
  const response = NextResponse.json(data);
  
  // Cache for 1 hour (3600 seconds)
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  );
  
  return response;
}
```

---

## Post-Deployment Verification

### Test All Features

```
✓ Homepage loads correctly
✓ Authentication (signup/login/logout)
✓ Product browsing and filtering
✓ Add to cart functionality
✓ Checkout process
✓ Order creation
✓ Admin dashboard access
✓ Excel import functionality
✓ Image uploads
✓ Payment flow
```

### Check Critical Pages

```bash
# Test home page
curl -I https://your-domain.com

# Test API endpoint
curl -I https://your-domain.com/api/products

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-domain.com/api/orders
```

### Performance Testing

```bash
# Use Lighthouse
npx lighthouse https://your-domain.com

# Check response times
curl -w "@curl-format.txt" \
  -o /dev/null \
  -s https://your-domain.com
```

### Security Check

- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] CORS properly configured
- [ ] API authentication working
- [ ] No secrets in responses
- [ ] Rate limiting active

---

## Monitoring & Maintenance

### Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:

```javascript
const withSentry = require('@sentry/nextjs').withSentry;

module.exports = withSentry(
  {
    // ... other config
  },
  {
    org: 'your-org',
    project: 'your-project',
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }
);
```

### Application Monitoring (PM2+)

```bash
pm2 monit          # Real-time monitoring
pm2 logs           # Application logs
pm2 restart all    # Restart all apps
pm2 stop all       # Stop all apps
```

### Database Monitoring

**Firebase Console:**
- Monitor read/write operations
- Check query performance
- Review security rules logs

### Log Analysis

```bash
# View application logs
pm2 logs ecommerce

# Save logs to file
pm2 logs ecommerce > ecommerce.log

# Monitor logs in real-time
tail -f ecommerce.log
```

### Backup Strategy

```bash
# Firestore backup to Cloud Storage (automated)
gcloud firestore export gs://your-bucket/firestore-backup-$(date +%Y%m%d)

# Schedule weekly backups
0 2 * * 0 /path/to/backup.sh
```

---

## Troubleshooting

### Common Issues

#### Issue: High Memory Usage

```bash
# Check memory
pm2 monit

# Restart app
pm2 restart ecommerce

# Investigate memory leaks
node --inspect=9229 npm start
```

#### Issue: Database Connection Slow

```
✓ Check Firebase quotas
✓ Add Firestore indexes
✓ Review query optimization
✓ Check network latency
```

#### Issue: Build Failing

```bash
# Clear cache and rebuild
rm -rf .next
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check ESLint
npx eslint .
```

#### Issue: Deployment Timeout

Vercel:
```
Settings → Build & Development Settings
→ Increase Function Timeout to 60s
```

#### Issue: Environment Variables Not Loaded

```bash
# Frontend env vars must be prefixed with NEXT_PUBLIC_
NEXT_PUBLIC_API_URL=xxx  ✓
API_URL=xxx              ✗ (not available on frontend)

# Verify in production
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
```

### Debug Mode

Enable verbose logging:

```
# PM2
pm2 start npm --name "ecommerce" -- start --log-level verbose

# CRA
DEBUG=* npm start

# Firebase
export DEBUG=*
```

### Performance Debugging

```bash
# Analyze Next.js build
npm run build -- --debug

# Check bundle composition
npm run analyze

# Monitor API response times
curl -w "%{time_total}\n" https://your-domain.com/api/products
```

---

## Rollback Procedure

### Vercel Automatic

```
Dashboard → Production Deployments → Select Previous Build → Redeploy
```

### Manual Rollback

```bash
git revert <commit-hash>
git push origin main

# Vercel automatically redeploys
```

### Docker Rollback

```bash
# Stop current container
docker stop ecommerce

# Run previous image
docker run -d \
  --name ecommerce-v2 \
  ghcr.io/your-username/ecommerce:v1.0.0

# Point traffic to new container
docker rename ecommerce-v2 ecommerce
```

---

## Next Steps

1. ✅ Deploy to staging environment first
2. ✅ Run full testing suite
3. ✅ Set up monitoring and alerts
4. ✅ Document deployment process
5. ✅ Train team on monitoring
6. ✅ Schedule regular backups
7. ✅ Plan for disaster recovery

For more help, consult:
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Next.js Deployment](https://nextjs.org/docs/deployment/static-exports)
