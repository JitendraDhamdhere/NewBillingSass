# Production Deployment Guide (Phase 9)

## 1. Supabase Production Setup
1. **Create Project**: Create a new production project in the Supabase Dashboard.
2. **Apply Migrations**: 
   Link your Supabase CLI to the production project and push the schema:
   ```bash
   supabase login
   supabase link --project-ref <your-production-project-ref>
   supabase db push
   ```
3. **Authentication Settings**:
   - Go to Authentication -> URL Configuration.
   - Set **Site URL** to your production domain (e.g., `https://app.billingsaas.com`).
   - Add **Redirect URLs**: `https://app.billingsaas.com/auth/callback`.
4. **Email Configuration**:
   - Configure a custom SMTP server (AWS SES, SendGrid, Resend) in Supabase Auth -> Email templates.
   - Disable the default Supabase SMTP to remove rate limits.

## 2. Vercel Deployment
1. **GitHub Integration**: Connect your repository to Vercel.
2. **Environment Variables**:
   Add the following variables to the Vercel Production Environment:
   - `NEXT_PUBLIC_SITE_URL`: `https://app.billingsaas.com`
   - `NEXT_PUBLIC_SUPABASE_URL`: `<Production Supabase URL>`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `<Production Supabase Anon Key>`
3. **Build Command**: Vercel automatically uses `npm run build`.
4. **Custom Domain**: Assign your custom domain in Vercel Project Settings -> Domains.

## 3. Post-Deployment Smoke Tests
Once deployed, perform the following checks on the live URL:
- Register a new test user and verify onboarding flow.
- Create a test business.
- Add a customer and a service.
- Generate an invoice and verify PDF layout & UPI QR code.
- Record a payment receipt.
- Add an overhead expense and verify the Profit & Loss statement updates correctly.
- Test team invitation (if email SMTP is configured).
