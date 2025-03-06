# Deployment Instructions for tourtovalencia.com

This guide provides step-by-step instructions for deploying the Remix project to your VPS at 178.16.130.178 using PM2 and Nginx.

## 1. SSH into your VPS

```bash
ssh root@178.16.130.178
```

## 2. Create and navigate to the application directory

```bash
mkdir -p /var/www/tourtovalencia
cd /var/www/tourtovalencia
```

## 3. Clone the repository

Choose one of the following options:

**Option A: Using SSH (if you have SSH keys set up)**
```bash
git clone git@github.com:jaivial/viajesolga.git .
```

**Option B: Using HTTPS (replace USERNAME and TOKEN)**
```bash
git clone https://USERNAME:TOKEN@github.com/jaivial/viajesolga.git .
```

## 4. Checkout the master branch

```bash
git checkout master
```

## 5. Install dependencies with legacy-peer-deps flag

```bash
npm install --legacy-peer-deps
```

## 6. Create/update the .env file

```bash
cp .env.example .env
nano .env  # Edit with your environment variables
```

## 7. Build the application

```bash
npm run build
```

## 8. Configure PM2 to run on port 3001 (or any available port)

Create a PM2 ecosystem file with .cjs extension (important for ES Module compatibility):

```bash
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: "tourtovalenciamaster",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: "3001"
    },
    watch: false,
    max_memory_restart: "1G",
    exec_mode: "fork",
    instances: 1,
    autorestart: true
  }]
};
EOF
```

## 9. Start the application with PM2

```bash
pm2 start ecosystem.config.cjs
```

## 10. Save PM2 configuration

```bash
pm2 save
```

## 11. Ensure PM2 starts on system boot

```bash
pm2 startup
```
Follow the instructions provided by the command.

## 12. Configure Nginx

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/tourtovalencia
```

Paste the following configuration:

```nginx
# Initial HTTP-only configuration (before SSL is set up)
server {
    listen 80;
    server_name tourtovalencia.com www.tourtovalencia.com;
    
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
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    
    # Proxy settings for the Node.js application
    location / {
        proxy_pass http://localhost:3001;
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

## 13. Enable the Nginx site

```bash
# Create symbolic link (if it doesn't already exist)
sudo ln -sf /etc/nginx/sites-available/tourtovalencia /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If the test is successful, reload Nginx
sudo systemctl reload nginx
```

Note: If you see a message like `ln: failed to create symbolic link '/etc/nginx/sites-enabled/tourtovalencia': File exists`, this is not an error. It simply means the symbolic link already exists, which is fine. The `-f` flag in the command will force the creation of the link even if it already exists.

## 14. Set up SSL with Let's Encrypt

Now we'll set up SSL certificates and update the Nginx configuration:

```bash
sudo certbot --nginx -d tourtovalencia.com -d www.tourtovalencia.com
```

This command will:
1. Obtain SSL certificates for your domains
2. Automatically update your Nginx configuration to use these certificates
3. Configure the redirect from HTTP to HTTPS

After running Certbot, your Nginx configuration will be updated to include SSL settings and the HTTP to HTTPS redirect.

## 15. Verify the deployment

```bash
curl -I https://tourtovalencia.com
```

## 16. Create a simple deployment script for future updates

```bash
cat > /var/www/tourtovalencia/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "Deploying tourtovalencia.com..."
cd /var/www/tourtovalencia
git pull
npm install --legacy-peer-deps
npm run build
pm2 restart tourtovalenciamaster
echo "Deployment completed successfully!"
EOF

chmod +x /var/www/tourtovalencia/deploy.sh
```

## 17. DNS Configuration

Ensure your DNS records are properly configured for tourtovalencia.com:

- Type: A
- Name: @ (or leave blank)
- Value: 178.16.130.178
- TTL: 3600 (or as recommended)

Add another record for www subdomain:
- Type: A
- Name: www
- Value: 178.16.130.178
- TTL: 3600 (or as recommended)

## Troubleshooting

### If port 3001 is also in use:
You can change the port in the ecosystem.config.cjs file to another available port (e.g., 3002, 3003, etc.) and update the Nginx configuration accordingly.

### Checking PM2 status:
```bash
pm2 list
pm2 logs tourtovalenciamaster
```

### Checking Nginx status:
```bash
sudo systemctl status nginx
sudo nginx -t
```

### Checking SSL certificate:
```bash
sudo certbot certificates
```