# Deployment Guide - Football Ticketing Platform

## Prerequisites

### Required Software
- Docker 20.10+ and Docker Compose 2.0+
- Node.js 20+ (for local development)
- Git
- SSL certificate (for production)

### Required Accounts
- Stripe account (for payment processing)
- Domain name (for production)
- Cloud hosting provider (AWS, GCP, Azure, or DigitalOcean)

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/tiagorebelo97/Football-Ticketing.git
cd Football-Ticketing
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add your Stripe keys:
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### 3. Start Platform
```bash
docker-compose up
```

Wait for all services to start (this may take 3-5 minutes on first run).

### 4. Verify Services

Check health endpoints:
```bash
# Super Admin API
curl http://localhost:3001/health

# Fan API
curl http://localhost:3003/health

# POS API
curl http://localhost:3004/health

# Entry API
curl http://localhost:3005/health

# Club Backoffice API
curl http://localhost:3002/health
```

### 5. Access Applications

- Fan PWA: http://app.localhost or http://localhost:3100
- Super Admin: http://admin.localhost or http://localhost:3101
- Club Backoffice: http://club.localhost or http://localhost:3102
- Keycloak Admin: http://localhost:8081 (admin/admin)
- Traefik Dashboard: http://localhost:8080

## Production Deployment

### Option 1: Docker Compose on VPS

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Clone and Configure
```bash
git clone https://github.com/tiagorebelo97/Football-Ticketing.git
cd Football-Ticketing

# Set production environment variables
nano .env
```

Production `.env`:
```bash
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=YOUR_SECURE_PASSWORD_HERE
TRAEFIK_DOMAIN=yourdomain.com
```

#### 3. Configure SSL with Let's Encrypt

Update `docker-compose.yml` Traefik service:
```yaml
traefik:
  command:
    - "--api.insecure=false"
    - "--providers.docker=true"
    - "--entrypoints.web.address=:80"
    - "--entrypoints.websecure.address=:443"
    - "--certificatesresolvers.letsencrypt.acme.email=admin@yourdomain.com"
    - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
  volumes:
    - "./letsencrypt:/letsencrypt"
```

Add labels to services for SSL:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.fan-pwa.rule=Host(`app.yourdomain.com`)"
  - "traefik.http.routers.fan-pwa.tls=true"
  - "traefik.http.routers.fan-pwa.tls.certresolver=letsencrypt"
```

#### 4. DNS Configuration

Point your domains to server IP:
```
A     app.yourdomain.com          → SERVER_IP
A     admin.yourdomain.com        → SERVER_IP
A     club.yourdomain.com         → SERVER_IP
A     api.yourdomain.com          → SERVER_IP
```

#### 5. Deploy
```bash
# Create SSL directory
mkdir letsencrypt

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 2: Kubernetes Deployment

#### 1. Create Kubernetes Manifests

See `k8s/` directory for:
- `namespace.yaml`
- `postgres-deployment.yaml`
- `redis-deployment.yaml`
- `keycloak-deployment.yaml`
- API deployments
- Frontend deployments
- Ingress configuration

#### 2. Deploy to Cluster
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
```

### Option 3: Cloud-Specific Deployments

#### AWS (ECS + RDS)
1. Create RDS PostgreSQL instance
2. Create ElastiCache Redis cluster
3. Deploy containers to ECS
4. Use Application Load Balancer
5. Configure Route 53 for DNS

#### Google Cloud (Cloud Run)
1. Create Cloud SQL PostgreSQL
2. Create Memorystore Redis
3. Deploy services to Cloud Run
4. Use Cloud Load Balancing
5. Configure Cloud DNS

#### Azure (Container Instances)
1. Create Azure Database for PostgreSQL
2. Create Azure Cache for Redis
3. Deploy to Container Instances
4. Use Application Gateway
5. Configure Azure DNS

## Database Setup

### Initialize Database
The database is automatically initialized from `database/init.sql` on first run.

### Manual Initialization
```bash
docker exec -i postgres psql -U football_user -d football_ticketing < database/init.sql
```

### Backup Database
```bash
# Create backup
docker exec postgres pg_dump -U football_user football_ticketing > backup_$(date +%Y%m%d).sql

# Restore backup
docker exec -i postgres psql -U football_user -d football_ticketing < backup_20231215.sql
```

### Database Migrations
For schema updates, create migration scripts:
```bash
docker exec -i postgres psql -U football_user -d football_ticketing < migrations/001_add_feature.sql
```

## Monitoring Setup

### Prometheus & Grafana
```yaml
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Health Checks
All APIs expose `/health` endpoints for monitoring.

### Log Aggregation (ELK Stack)
```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0

logstash:
  image: docker.elastic.co/logstash/logstash:8.11.0

kibana:
  image: docker.elastic.co/kibana/kibana:8.11.0
  ports:
    - "5601:5601"
```

## Security Hardening

### 1. Environment Variables
- Never commit `.env` files
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate credentials regularly

### 2. Database Security
```bash
# Change default passwords
docker exec -it postgres psql -U postgres
ALTER USER football_user WITH PASSWORD 'strong_random_password';
```

### 3. Keycloak Security
- Change admin password
- Enable HTTPS only
- Configure CORS properly
- Set up realms with strict policies

### 4. Network Security
- Use firewall (UFW, Security Groups)
- Limit exposed ports
- Enable VPC/private networking

### 5. Application Security
- Enable rate limiting
- Add CORS headers
- Use helmet.js
- Validate all inputs

## Backup Strategy

### Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
docker exec postgres pg_dump -U football_user football_ticketing > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-bucket/backups/

# Keep last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

## Scaling

### Horizontal Scaling
```yaml
# docker-compose.yml
fan-api:
  deploy:
    replicas: 3
  # ... rest of config
```

### Load Balancing
Traefik automatically load balances across replicas.

### Database Scaling
1. Set up PostgreSQL replication
2. Configure read replicas
3. Use connection pooling (PgBouncer)

## Troubleshooting

### Common Issues

#### Services won't start
```bash
# Check logs
docker-compose logs service-name

# Restart services
docker-compose restart

# Rebuild
docker-compose up --build
```

#### Database connection errors
```bash
# Check database is running
docker exec -it postgres psql -U football_user -d football_ticketing

# Test connection from API
docker exec -it super-admin-api npm run test-db
```

#### Keycloak issues
```bash
# Access Keycloak admin
http://localhost:8081/admin

# Check realm configuration
# Verify client settings
```

### Performance Optimization

#### Enable Redis caching
```typescript
// In API services
import Redis from 'redis';
const redis = Redis.createClient({ url: process.env.REDIS_URL });

// Cache matches
const cachedMatches = await redis.get('matches:upcoming');
```

#### Database indexing
Already configured in `init.sql`. Monitor slow queries:
```sql
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

## Rollback Procedure

### Rollback Deployment
```bash
# Using Git tags
git checkout v1.0.0
docker-compose up -d

# Using Docker images
docker-compose down
docker-compose up -d --force-recreate
```

### Rollback Database
```bash
# Restore from backup
docker exec -i postgres psql -U football_user -d football_ticketing < backup_20231215.sql
```

## Maintenance

### Update Platform
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Update Dependencies
```bash
# Update Node packages
npm update --workspaces

# Rebuild images
docker-compose build --no-cache
```

### Clean Up
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Test database connectivity
4. Check Stripe webhook configuration
5. Review Keycloak realm settings

For production support, please open an issue on GitHub.
