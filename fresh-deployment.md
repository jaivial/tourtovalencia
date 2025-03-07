# Fresh Deployment Guide for tourtovalencia.com

This guide provides step-by-step instructions for a fresh deployment of the Remix project to your VPS.

## 1. SSH into your VPS

```bash
ssh root@178.16.130.178
```

## 2. Stop and Remove Existing PM2 Process

```bash
# List all PM2 processes
pm2 list

# Stop and delete the existing process
pm2 delete tourtovalenciamaster

# Save PM2 configuration
pm2 save
```

## 3. Remove Existing Nginx Configuration

```bash
# Remove the symbolic link
sudo rm /etc/nginx/sites-enabled/tourtovalencia

# Remove the configuration file
sudo rm /etc/nginx/sites-available/tourtovalencia

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 4. Delete the Existing Directory Content (but keep the directory)

```bash
# Move to the parent directory
cd /var/www

# Remove all content from the directory but keep the directory itself
sudo rm -rf /var/www/tourtovalencia/*
sudo rm -rf /var/www/tourtovalencia/.[!.]*

# Navigate back to the directory
cd /var/www/tourtovalencia
```

## 5. Clone the Repository

Choose one of the following options:

**Option A: Using SSH (if you have SSH keys set up)**
```bash
git clone git@github.com:jaivial/viajesolga.git .
```

**Option B: Using HTTPS (replace USERNAME and TOKEN)**
```bash
git clone https://USERNAME:TOKEN@github.com/jaivial/viajesolga.git .
```

If you still get an error about the directory not being empty, you can try:

```bash
# Alternative approach: Clone to a temporary directory and move the files
git clone https://USERNAME:TOKEN@github.com/jaivial/viajesolga.git /tmp/viajesolga
cp -a /tmp/viajesolga/. /var/www/tourtovalencia/
rm -rf /tmp/viajesolga
```

## 6. Checkout the Master Branch

```bash
git checkout master
```

## 7. Install Dependencies with Legacy-Peer-Deps Flag

```bash
npm install --legacy-peer-deps
```

## 8. Create/Update the .env File

```bash
cp .env.example .env
nano .env  # Edit with your environment variables
```

## 9. Build the Application

```bash
npm run build
```

## 10. Configure PM2 to Run on Port 3001

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

## 11. Start the Application with PM2

```bash
pm2 start ecosystem.config.cjs
```

## 12. Save PM2 Configuration

```bash
pm2 save
```

## 13. Ensure PM2 Starts on System Boot

```bash
pm2 startup
```
Follow the instructions provided by the command.

## 14. Configure Nginx

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
    
    # Static assets - serve directly from the build directory
    location /_assets/ {
        alias /var/www/tourtovalencia/build/client/assets/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files $uri =404;
    }
    
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
        try_files $uri $uri/ =404;
    }
}
```

## 15. Enable the Nginx Site

```bash
# Create symbolic link
sudo ln -sf /etc/nginx/sites-available/tourtovalencia /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If the test is successful, reload Nginx
sudo systemctl reload nginx
```

## 16. Set Up SSL with Let's Encrypt

Now we'll set up SSL certificates and update the Nginx configuration:

```bash
sudo certbot --nginx -d tourtovalencia.com -d www.tourtovalencia.com
```

When prompted, select option 1 to reinstall the existing certificate.

## 17. Verify the Deployment

```bash
curl -I https://tourtovalencia



  &
  
  
%                                                                                                                                                                                                                                                                                                                           Ç mcom
```

## 18. Set Proper File Permissions

```bash
sudo chown -R www-data:www-data /var/www/tourtovalencia/build
sudo chmod -R 755 /var/www/tourtovalencia/build
```

## 19. Create a Simple Deployment Script for Future Updates

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

## Troubleshooting

If you encounter any issues with styles not loading, check:

1. The build directory structure: `ls -la /var/www/tourtovalencia/build/client/assets/`
2. File permissions: Make sure Nginx can read the files
3. Browser developer tools: Check for 404 errors on CSS/JS files 