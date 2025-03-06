# Deployment Guide for tourtovalencia.com

This guide provides step-by-step instructions for deploying your Remix website from GitHub to your domain tourtovalencia.com.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [GitHub Repository Setup](#github-repository-setup)
3. [Hosting Options](#hosting-options)
   - [Option 1: VPS Deployment](#option-1-vps-deployment)
   - [Option 2: Vercel Deployment](#option-2-vercel-deployment)
   - [Option 3: Netlify Deployment](#option-3-netlify-deployment)
4. [Domain Configuration](#domain-configuration)
5. [SSL Certificate Setup](#ssl-certificate-setup)
6. [Continuous Deployment](#continuous-deployment)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following:

- Access to your GitHub account
- Access to your domain registrar account for tourtovalencia.com
- Node.js v20.x or later installed on your local machine
- Git installed on your local machine
- (For VPS option) SSH access to a VPS running Ubuntu

## GitHub Repository Setup

1. **Ensure your code is in the GitHub repository**

   Your code should already be in the GitHub repository at https://github.com/jaivial/viajesolga.git on the master branch.

2. **Verify your repository structure**

   Make sure your repository has the following structure:
   
   ```
   viajesolga/
   ├── app/                  # Remix application code
   ├── public/               # Static assets
   ├── build/                # Build output (generated)
   ├── package.json          # Dependencies and scripts
   ├── remix.env.d.ts        # Remix environment types
   ├── tsconfig.json         # TypeScript configuration
   ├── vite.config.ts        # Vite configuration
   └── .env.example          # Example environment variables
   ```

3. **Update your package.json**

   Ensure your package.json has the correct build and start scripts:

   ```json
   "scripts": {
     "build": "remix vite:build",
     "dev": "remix vite:dev",
     "start": "remix-serve ./build/server/index.js"
   }
   ```

## Hosting Options

You have several options for hosting your Remix application. Choose the one that best fits your needs.

### Option 1: VPS Deployment

This option gives you full control over your server environment.

#### 1. Initial VPS Setup

```bash
# Update the system
sudo apt update
sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git build-essential

# Set up a firewall
sudo apt install -y ufw
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

#### 2. Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/tourtovalencia
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name tourtovalencia.com www.tourtovalencia.com;
    
    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name tourtovalencia.com www.tourtovalencia.com;
    
    # SSL configuration (will be updated by Certbot)
    # ssl_certificate and ssl_certificate_key will be added by Certbot
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Root directory
    root /var/www/tourtovalencia/public;
    
    # Logs
    access_log /var/log/nginx/tourtovalencia.access.log;
    error_log /var/log/nginx/tourtovalencia.error.log;
    
    # Increase maximum body size for large uploads
    client_max_body_size 20M;
    
    # Gzip settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;
    
    # Proxy settings for the Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/tourtovalencia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. Install MongoDB (if needed)

If your application requires MongoDB:

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create a list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Reload local package database
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 4. Install Node.js and PM2

```bash
# Install Node.js v20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

#### 5. Deploy the Application

```bash
# Create application directory
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www

# Clone the repository
cd /var/www
git clone https://github.com/jaivial/viajesolga.git tourtovalencia
cd tourtovalencia
git checkout master

# Install dependencies and build
npm ci
npm run build

# Create environment file
cp .env.example .env
nano .env  # Edit with your environment variables

# Start the application with PM2
pm2 start npm --name "tourtovalencia" -- start
pm2 save
pm2 startup
```

#### 6. Set up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d tourtovalencia.com -d www.tourtovalencia.com
```

### Option 2: Vercel Deployment

Vercel is a cloud platform for static sites and Serverless Functions that fits perfectly with Remix.

#### 1. Create a Vercel Account

If you don't have one already, sign up at [vercel.com](https://vercel.com).

#### 2. Install Vercel CLI (optional)

```bash
npm install -g vercel
```

#### 3. Deploy to Vercel

You can deploy directly from the GitHub repository:

1. Go to [vercel.com](https://vercel.com) and log in
2. Click "Add New..." > "Project"
3. Import your GitHub repository (https://github.com/jaivial/viajesolga.git)
4. Configure the project:
   - Framework Preset: Remix
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm ci`
   - Development Command: `npm run dev`
5. Add environment variables from your `.env` file
6. Click "Deploy"

#### 4. Configure Custom Domain

1. In your Vercel project dashboard, go to "Settings" > "Domains"
2. Add your domain: `tourtovalencia.com`
3. Add `www.tourtovalencia.com` as well
4. Follow Vercel's instructions to update your DNS records

### Option 3: Netlify Deployment

Netlify is another excellent platform for hosting Remix applications.

#### 1. Create a Netlify Account

If you don't have one already, sign up at [netlify.com](https://netlify.com).

#### 2. Deploy to Netlify

You can deploy directly from the GitHub repository:

1. Go to [netlify.com](https://netlify.com) and log in
2. Click "Add new site" > "Import an existing project"
3. Choose GitHub and select your repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
5. Add environment variables from your `.env` file
6. Click "Deploy site"

#### 3. Configure Custom Domain

1. In your Netlify site dashboard, go to "Site settings" > "Domain management"
2. Click "Add custom domain"
3. Enter your domain: `tourtovalencia.com`
4. Follow Netlify's instructions to update your DNS records

## Domain Configuration

Regardless of which hosting option you choose, you'll need to configure your domain to point to your hosting provider.

### 1. Access Your Domain Registrar

Log in to the registrar where tourtovalencia.com is registered.

### 2. Update DNS Records

#### For VPS Hosting:

Add these records:
- Type: A
- Name: @ (or leave blank)
- Value: [Your VPS IP address]
- TTL: 3600 (or as recommended)

Add another record for www subdomain:
- Type: A
- Name: www
- Value: [Your VPS IP address]
- TTL: 3600 (or as recommended)

#### For Vercel:

Follow Vercel's specific instructions, but typically:
- Type: A
- Name: @
- Value: 76.76.21.21
- TTL: 3600

And:
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com.
- TTL: 3600

#### For Netlify:

Follow Netlify's specific instructions, but typically:
- Type: A
- Name: @
- Value: Netlify's load balancer IP (provided in their instructions)
- TTL: 3600

And:
- Type: CNAME
- Name: www
- Value: [your-netlify-site-name].netlify.app.
- TTL: 3600

### 3. Wait for DNS Propagation

DNS changes can take up to 48 hours to propagate globally, although they often take effect much sooner.

## SSL Certificate Setup

### For VPS (Let's Encrypt):

Already covered in the VPS deployment section.

### For Vercel and Netlify:

SSL certificates are automatically provisioned and renewed by these platforms when you add your custom domain.

## Continuous Deployment

### GitHub Actions (for VPS)

You can set up GitHub Actions to automatically deploy to your VPS when you push to the master branch.

1. Create a `.github/workflows/deploy.yml` file in your repository:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: SSH and deploy
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/tourtovalencia
            git pull
            npm ci
            npm run build
            pm2 restart tourtovalencia
```

2. Add the following secrets to your GitHub repository:
   - HOST: Your VPS IP address
   - USERNAME: Your SSH username
   - SSH_PRIVATE_KEY: Your SSH private key

### Vercel and Netlify

Both Vercel and Netlify automatically set up continuous deployment from your GitHub repository. When you push to the master branch, they will automatically rebuild and deploy your site.

## Monitoring and Maintenance

### VPS Monitoring

```bash
# View application logs
pm2 logs tourtovalencia

# Monitor application
pm2 monit

# Check Nginx logs
sudo tail -f /var/log/nginx/tourtovalencia.error.log

# Update the application
cd /var/www/tourtovalencia
git pull
npm ci
npm run build
pm2 restart tourtovalencia
```

### Vercel and Netlify Monitoring

Both platforms provide dashboards with deployment logs, analytics, and other monitoring tools.

## Troubleshooting

### Common Issues and Solutions

1. **Domain not pointing to the correct server**
   - Verify DNS records are correct
   - Check DNS propagation using a tool like [dnschecker.org](https://dnschecker.org)

2. **SSL certificate issues**
   - For VPS: `sudo certbot renew --dry-run` to test renewal
   - For Vercel/Netlify: Contact their support

3. **Application not starting**
   - Check application logs
   - Verify all environment variables are set correctly
   - Ensure MongoDB (if used) is running

4. **Nginx configuration errors**
   - Run `sudo nginx -t` to test configuration
   - Check Nginx error logs

5. **Build failures**
   - Check build logs
   - Ensure all dependencies are correctly installed
   - Verify your code works locally before deploying

---

## Conclusion

You now have a comprehensive guide for deploying your Remix application to your domain tourtovalencia.com. Whether you choose a VPS, Vercel, or Netlify, following these steps will ensure a smooth deployment process.

Remember to regularly update your application and dependencies to maintain security and performance. 