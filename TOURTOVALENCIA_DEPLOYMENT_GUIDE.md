# Streamlined Deployment Guide for tourtovalencia.com

This guide assumes you already have a VPS running Ubuntu with Node.js, Nginx, and other prerequisites installed from previous Remix deployments.

## 1. Clone and Set Up the Repository

### Authentication with GitHub

GitHub no longer supports password authentication for Git operations. You have two options:

#### Option A: Use SSH Authentication (Recommended)

1. If you don't already have an SSH key on your server:
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Start the SSH agent
eval "$(ssh-agent -s)"

# Add your SSH key to the agent
ssh-add ~/.ssh/id_ed25519

# Display your public key to add to GitHub
cat ~/.ssh/id_ed25519.pub
```

2. Add this SSH key to your GitHub account:
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste the key and give it a title (e.g., "VPS Server")
   - Click "Add SSH key"

3. Clone the repository using SSH:
```bash
# Create application directory
mkdir -p /var/www/tourtovalencia
cd /var/www/tourtovalencia

# Clone the repository using SSH
git clone git@github.com:jaivial/viajesolga.git .
git checkout master
```

#### Option B: Use Personal Access Token

1. Generate a Personal Access Token on GitHub:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name, select the "repo" scope
   - Click "Generate token" and copy the token

2. Clone the repository using HTTPS with the token:
```bash
# Create application directory
mkdir -p /var/www/tourtovalencia
cd /var/www/tourtovalencia

# Clone the repository using HTTPS with token
git clone https://USERNAME:TOKEN@github.com/jaivial/viajesolga.git .
# Replace USERNAME with your GitHub username
# Replace TOKEN with your personal access token
git checkout master
```

### Continue with Build and Setup

```bash
# Install dependencies and build
npm ci
npm run build

# Create environment file if needed
cp .env.example .env
nano .env  # Edit with your environment variables
```

## 2. Configure Nginx

Create a new Nginx configuration file:

```bash
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

## 3. Set Up PM2 for Process Management

```bash
# Start the application with PM2
pm2 start npm --name "tourtovalenciamaster" -- start

# Save PM2 configuration
pm2 save

# Ensure PM2 starts on system boot (if not already configured)
pm2 startup
```

## 4. Set Up SSL with Let's Encrypt

```bash
sudo certbot --nginx -d tourtovalencia.com -d www.tourtovalencia.com
```

## 5. Configure DNS Records

Log in to your domain registrar and add these records for tourtovalencia.com:

- Type: A
- Name: @ (or leave blank)
- Value: [Your VPS IP address]
- TTL: 3600 (or as recommended)

Add another record for www subdomain:
- Type: A
- Name: www
- Value: [Your VPS IP address]
- TTL: 3600 (or as recommended)

## 6. Set Up Continuous Deployment (Optional)

For automatic deployment when you push to GitHub, create a `.github/workflows/deploy.yml` file in your repository:

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

Add these secrets to your GitHub repository:
- HOST: Your VPS IP address
- USERNAME: Your SSH username
- SSH_PRIVATE_KEY: Your SSH private key

## 7. Deployment Script (Optional)

You can create a deployment script on your VPS to simplify future updates:

```bash
# Create a file named deploy.sh
cat > /var/www/tourtovalencia/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "Deploying tourtovalencia.com..."
cd /var/www/tourtovalencia
git pull
npm ci
npm run build
pm2 restart tourtovalencia
echo "Deployment completed successfully!"
EOF

# Make it executable
chmod +x /var/www/tourtovalencia/deploy.sh
```

## 8. MongoDB Setup (If Needed)

If your application requires MongoDB and you need to create a new database:

```bash
# Connect to MongoDB shell
mongosh

# Create a new database
use tourtovalencia

# Create necessary collections based on your application needs
db.createCollection('tours')
db.createCollection('bookings')
# Add more collections as needed

# Exit MongoDB shell
exit
```

## 9. Monitoring and Maintenance

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

## 10. Troubleshooting

If you encounter issues:

1. **Application not starting**
   - Check PM2 logs: `pm2 logs tourtovalencia`
   - Verify environment variables in `.env`

2. **Nginx configuration errors**
   - Test configuration: `sudo nginx -t`
   - Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

3. **SSL certificate issues**
   - Test renewal: `sudo certbot renew --dry-run`

4. **Domain not resolving**
   - Verify DNS records are correct
   - Check DNS propagation: [dnschecker.org](https://dnschecker.org)

---

## Quick Reference Commands

```bash
# Restart application
pm2 restart tourtovalencia

# View logs
pm2 logs tourtovalencia

# Reload Nginx
sudo systemctl reload nginx

# Renew SSL certificates
sudo certbot renew
``` 