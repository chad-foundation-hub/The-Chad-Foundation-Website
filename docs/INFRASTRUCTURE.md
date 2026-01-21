# Infrastructure & Domain Configuration

## 🌐 Domains and DNS

This project manages two domains:

1. **Primary Domain:** `chad-foundation.org` (Hosted on Netlify)
2. **Legacy Domain:** `chadfoundation.org` (Redirects to Primary)

### Legacy Domain Setup (`chadfoundation.org`)

The legacy domain is registered with **Network Solutions**, but we have migrated the **DNS Authority** to **Netlify** to support free SSL (HTTPS).

**Configuration:**

- **Registrar:** Network Solutions
- **Nameservers:** Pointed to Netlify (`dns1.p08.nsone.net`, etc.)
- **SSL:** Handled via Let's Encrypt on Netlify.

**⚠️ Important:**
Do not change the Nameservers on Network Solutions back to default. Doing so will break the SSL certificate and cause "Not Secure" warnings for users visiting the old link.

### 🔒 SSL Certificates

SSL is automatically managed by Netlify via Let's Encrypt.

- It covers both `chad-foundation.org` and `chadfoundation.org`.
- **Troubleshooting:** If the legacy domain shows an SSL error, log in to Netlify > Domain Management > HTTPS and click **"Renew Certificate"** to force a DNS re-check.

### 🚀 Hosting

- **Provider:** Netlify
- **Type:** Static Site + Serverless Functions (Node.js)
- **Deploys:** Automatic via GitHub Triggers.
