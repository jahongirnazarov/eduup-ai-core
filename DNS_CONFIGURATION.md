# 🌐 DNS CONFIGURATION - eduupai.uz
# Cloudflare Pages Domain Setup Guide

## Domain Information
- **Domain**: eduupai.uz
- **Provider**: Bilur.com
- **Target Hosting**: Cloudflare Pages

## Step 1: Get Cloudflare Nameservers
After creating a Cloudflare account and adding your site, Cloudflare will provide two nameservers:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

## Step 2: Update Nameservers at Bilur.com
1. Log in to your Bilur.com account
2. Navigate to DNS Management for eduupai.uz
3. Find the Nameservers (NS) section
4. Replace existing nameservers with:
   - Primary NS: `ns1.cloudflare.com`
   - Secondary NS: `ns2.cloudflare.com`
5. Save changes

## Step 3: Wait for DNS Propagation
DNS propagation typically takes 24-48 hours. You can check status using:
- https://www.whatsmydns.net/
- https://dnschecker.org/

## Step 4: Configure DNS Records in Cloudflare
Once nameservers are updated, configure the following records in Cloudflare DNS:

### A Records (for root domain)
```
Type: A
Name: @
IPv4 address: 192.0.2.1 (Cloudflare Pages IP - will be auto-assigned)
Proxy status: Proxied (orange cloud)
TTL: Auto
```

### CNAME Records (for www subdomain)
```
Type: CNAME
Name: www
Target: eduupai.pages.dev (or your Cloudflare Pages subdomain)
Proxy status: Proxied (orange cloud)
TTL: Auto
```

## Step 5: Configure Cloudflare Pages
1. Go to Cloudflare Pages dashboard
2. Create a new project or select existing one
3. Add custom domain: `eduupai.uz`
4. Add custom domain: `www.eduupai.uz`
5. Wait for SSL certificate to be issued (automatic)

## Step 6: Verify Domain Ownership
Cloudflare will automatically verify domain ownership via DNS records. No additional steps needed.

## Step 7: Test DNS Resolution
Use these commands to test:

### On Windows (Command Prompt)
```cmd
nslookup eduupai.uz
nslookup www.eduupai.uz
```

### On Linux/Mac (Terminal)
```bash
dig eduupai.uz
dig www.eduupai.uz
```

## Alternative: Using Cloudflare API
If you prefer programmatic setup, use this API call:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/custom_hostnames" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{
    "hostname": "eduupai.uz",
    "ssl": {
      "method": "http",
      "type": "dv"
    }
  }'
```

## Final DNS Configuration Summary
```
eduupai.uz
├── @ (A) → 192.0.2.1 (Cloudflare Pages)
├── www (CNAME) → eduupai.pages.dev
└── Nameservers: ns1.cloudflare.com, ns2.cloudflare.com
```

## Troubleshooting
- **DNS not propagating**: Wait up to 48 hours
- **SSL certificate pending**: Cloudflare issues certificates automatically
- **404 errors**: Check Cloudflare Pages build settings
- **Redirect loops**: Ensure no conflicting redirect rules

## Security Headers (Optional)
Add these Page Rules in Cloudflare for enhanced security:
```
URL Pattern: eduupai.uz/*
Settings:
  - SSL: Full (strict)
  - Always Use HTTPS: On
  - Auto Minify: CSS, JS, HTML
  - Browser Cache TTL: 4 hours
```

## Notes
- Cloudflare Pages provides automatic SSL certificates
- DNS changes may take time to propagate globally
- Always backup existing DNS records before making changes
- Use Cloudflare's proxy (orange cloud) for DDoS protection and CDN benefits
