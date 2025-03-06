# Deployment Scripts for tourtovalencia.jaimedigitalstudio.com

This repository contains scripts and configuration files to help deploy the Viajes Olga application to a subdomain on a VPS running Ubuntu.

## Files Included

- `deployment-guide.md`: Comprehensive step-by-step guide for setting up the VPS, installing dependencies, and deploying the application.
- `deploy.sh`: Bash script to automate the deployment process on the VPS.
- `migrate-db.sh`: Bash script to migrate data from the original database to the demo database.
- `mongodb-setup.js`: MongoDB script to initialize the demo database with the necessary collections and indexes.
- `nginx-tourtovalencia.conf`: Nginx configuration template for the subdomain.

## Prerequisites

- A VPS running Ubuntu (preferably Ubuntu 22.04 LTS)
- SSH access to the VPS
- Domain name (jaimedigitalstudio.com) with DNS management access
- The application code in a Git repository

## Quick Start

1. Set up your VPS according to the instructions in `deployment-guide.md`.
2. Copy the deployment scripts to your VPS:

```bash
scp deploy.sh migrate-db.sh mongodb-setup.js nginx-tourtovalencia.conf user@your-vps-ip:~/
```

3. SSH into your VPS:

```bash
ssh user@your-vps-ip
```

4. Make the scripts executable:

```bash
chmod +x deploy.sh migrate-db.sh
```

5. Update the repository URL in `deploy.sh`:

```bash
nano deploy.sh
# Update the REPO_URL variable with your repository URL
```

6. Run the deployment script:

```bash
./deploy.sh
```

7. If you need to migrate data from an existing database, run:

```bash
./migrate-db.sh
```

## DNS Configuration

Add an A record in your DNS management panel:

- Type: A
- Name: tourtovalencia
- Value: [Your VPS IP address]
- TTL: 3600 (or as recommended)

## Environment Variables

Make sure to update the `.env` file on your VPS with the appropriate values:

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/demoolgatravel

# Add other environment variables as needed
```

## Nginx Configuration

Copy the Nginx configuration file to the appropriate location:

```bash
sudo cp nginx-tourtovalencia.conf /etc/nginx/sites-available/tourtovalencia
sudo ln -s /etc/nginx/sites-available/tourtovalencia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Certificate

Set up SSL with Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tourtovalencia.jaimedigitalstudio.com
```

## Monitoring

Monitor your application with PM2:

```bash
pm2 logs tourtovalencia
pm2 monit
```

## Troubleshooting

If you encounter any issues, check the logs:

- Application logs: `pm2 logs tourtovalencia`
- Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`

## Updating the Application

To update the application:

```bash
cd /var/www/tourtovalencia
git pull
npm ci
npm run build
pm2 restart tourtovalencia
```
