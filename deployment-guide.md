# Deployment Guide for tourtovalencia.jaimedigitalstudio.com

This guide provides step-by-step instructions for deploying the Viajes Olga application to a subdomain on a VPS running Ubuntu.

## Prerequisites

- A VPS running Ubuntu (preferably Ubuntu 22.04 LTS or 24.04 LTS)
- SSH access to the VPS
- Domain name (jaimedigitalstudio.com) with DNS management access
- The application code in a Git repository

## 1. Initial VPS Setup

### Update the system

```bash
sudo apt update
sudo apt upgrade -y
```

### Install essential packages

```bash
sudo apt install -y curl wget git build-essential
```

### Set up a firewall

```bash
sudo apt install -y ufw
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

## 2. Install and Configure Nginx

### Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Configure the subdomain

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/tourtovalencia
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name tourtovalencia.jaimedigitalstudio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/tourtovalencia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 3. Install and Configure MongoDB

### Install MongoDB 7.0

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create a list file for MongoDB (using jammy repository for compatibility)
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Reload local package database
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Create the demo database

```bash
# Connect to MongoDB shell
mongosh

# Create the new database
use demoolgatravel

# Create necessary collections (based on the original database structure)
db.createCollection('bookingLimits')
db.createCollection('tours')
db.createCollection('pages')
db.createCollection('translations')
db.createCollection('bookings')

# Create indexes
db.bookingLimits.createIndex({ date: 1 }, { unique: true })
db.tours.createIndex({ slug: 1 }, { unique: true })
db.pages.createIndex({ slug: 1 }, { unique: true })
db.translations.createIndex({ key: 1 }, { unique: true })
db.bookings.createIndex({ bookingId: 1 }, { unique: true })

# Exit MongoDB shell
exit
```

### Import data (if you have a dump of the original database)

```bash
# If you have a MongoDB dump file
mongorestore --db demoolgatravel /path/to/dump/olgatravel/
```

## 4. Install Node.js and PM2

### Install Node.js (v20.x)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install PM2 globally

```bash
sudo npm install -g pm2
```

## 5. Deploy the Application

### Clone the repository

```bash
mkdir -p /var/www
cd /var/www
git clone <your-repository-url> tourtovalencia
cd tourtovalencia
git checkout dev
```

### Install dependencies and build the application

```bash
npm ci
npm run build
```

### Create environment file

```bash
nano .env
```

Add the following content (adjust as needed):

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/demoolgatravel

# Stripe (if applicable)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email (if applicable)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# OpenRouter API Key (if applicable)
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Start the application with PM2

```bash
pm2 start npm --name "tourtovalencia" -- start
pm2 save
pm2 startup
```

## 6. Set up SSL with Let's Encrypt

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL certificate

```bash
sudo certbot --nginx -d tourtovalencia.jaimedigitalstudio.com
```

Follow the prompts to complete the SSL setup.

## 7. Set up DNS Records

Add an A record in your DNS management panel:

- Type: A
- Name: tourtovalencia
- Value: [Your VPS IP address]
- TTL: 3600 (or as recommended)

## 8. Monitoring and Maintenance

### View application logs

```bash
pm2 logs tourtovalencia
```

### Restart the application

```bash
pm2 restart tourtovalencia
```

### Update the application

```bash
cd /var/www/tourtovalencia
git pull
npm ci
npm run build
pm2 restart tourtovalencia
```

## Troubleshooting

### Check Nginx status

```bash
sudo systemctl status nginx
```

### Check MongoDB status

```bash
sudo systemctl status mongod
```

### Check application logs

```bash
pm2 logs tourtovalencia
```

### Check Nginx error logs

```bash
sudo tail -f /var/log/nginx/error.log
```

### Check Nginx access logs

```bash
sudo tail -f /var/log/nginx/access.log
```
