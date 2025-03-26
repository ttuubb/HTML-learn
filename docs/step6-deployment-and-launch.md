# Step 6: Project Deployment and Launch

## Objective
Deploy the completed Python learning website to a production environment, ensuring the website runs stably, securely, and efficiently.

## Detailed Tasks

### 1. Preparation

#### 1.1 Production Environment Requirements

- Server: Recommended to use a Linux server (such as Ubuntu 20.04 LTS)
- Web server: Nginx
- WSGI server: Gunicorn
- Database: PostgreSQL
- Python environment: Python 3.8+
- Domain name and SSL certificate

#### 1.2 Install Necessary Software

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Install Python-related tools
sudo apt install python3-pip python3-dev python3-venv

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install other dependencies
sudo apt install build-essential libssl-dev libffi-dev
```

### 2. Database Configuration

#### 2.1 Create PostgreSQL Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Execute the following commands in PostgreSQL
CREATE DATABASE python_learning_db;
CREATE USER python_learning_user WITH PASSWORD 'secure_password';
ALTER ROLE python_learning_user SET client_encoding TO 'utf8';
ALTER ROLE python_learning_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE python_learning_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE python_learning_db TO python_learning_user;
\q
```

#### 2.2 Modify Django Settings to Use PostgreSQL

Modify `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'python_learning_db',
        'USER': 'python_learning_user',
        'PASSWORD': 'secure_password',
        'HOST': 'localhost',
        'PORT': '',
    }
}
```

### 3. Project Preparation

#### 3.1 Create Production Environment Configuration File

Create `.env.production` file:

```
DEBUG=False
SECRET_KEY=your_very_secure_secret_key_here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgres://python_learning_user:secure_password@localhost:5432/python_learning_db
```

#### 3.2 Set Up Static Files and Media Files

Add to `settings.py`:

```python
# Static file settings
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

# Media file settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

### 4. Gunicorn Configuration

#### 4.1 Install Gunicorn

```bash
pip install gunicorn
```

#### 4.2 Create Gunicorn Service File

Create `/etc/systemd/system/gunicorn.service`:

```ini
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/python_learning_platform
EnvironmentFile=/home/ubuntu/python_learning_platform/.env.production
ExecStart=/home/ubuntu/python_learning_platform/venv/bin/gunicorn \
          --access-logfile - \
          --workers 3 \
          --bind unix:/home/ubuntu/python_learning_platform/python_learning_platform.sock \
          python_learning_platform.wsgi:application

[Install]
WantedBy=multi-user.target
```

#### 4.3 Start and Enable Gunicorn Service

```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

### 5. Nginx Configuration

#### 5.1 Create Nginx Configuration File

Create `/etc/nginx/sites-available/python_learning_platform`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /home/ubuntu/python_learning_platform;
    }

    location /media/ {
        root /home/ubuntu/python_learning_platform;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/ubuntu/python_learning_platform/python_learning_platform.sock;
    }
}
```

#### 5.2 Enable the Nginx Configuration

```bash
sudo ln -s /etc/nginx/sites-available/python_learning_platform /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Configuration

#### 6.1 Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

#### 6.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 6.3 Auto-renewal Configuration

```bash
sudo certbot renew --dry-run
```

### 7. Final Deployment Steps

#### 7.1 Collect Static Files

```bash
python manage.py collectstatic --no-input
```

#### 7.2 Apply Migrations

```bash
python manage.py migrate
```

#### 7.3 Create Superuser

```bash
python manage.py createsuperuser
```

#### 7.4 Set Up Proper Permissions

```bash
sudo chown -R ubuntu:www-data /home/ubuntu/python_learning_platform
sudo chmod -R 755 /home/ubuntu/python_learning_platform
```

### 8. Performance Optimization

#### 8.1 Database Optimization

- Add appropriate indexes to frequently queried fields
- Configure PostgreSQL for optimal performance

#### 8.2 Caching

Implement Django caching in `settings.py`:

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
    }
}
```

#### 8.3 Static File Optimization

- Compress static files
- Configure browser caching
- Use a CDN for static assets if needed

### 9. Monitoring and Maintenance

#### 9.1 Set Up Monitoring

- Configure server monitoring (e.g., with Prometheus, Grafana)
- Set up error logging and notification

#### 9.2 Regular Maintenance Tasks

- Create backup scripts for the database
- Schedule regular security updates
- Monitor disk space and resource usage

#### 9.3 Create Deployment Documentation

Document the deployment process, including:

- Server configuration details
- Deployment steps
- Backup and restore procedures
- Troubleshooting guide

## Conclusion

By following these deployment steps, the Python learning website will be successfully deployed to a production environment with proper security, performance, and reliability considerations. The website is now ready for users to access and begin their Python learning journey.