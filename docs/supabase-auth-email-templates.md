# Auth email templates (Supabase Dashboard)

Paste these in **Authentication → Emails → Templates**.
Custom SMTP must stay enabled.

Keep **Email OTP expiration** at **3600 seconds (1 hour)** for all auth emails.

---

## 1. Confirm sign up

**Subject:** `Your ImportMark verification code`

**Body:**

```html
<h2>Verify your ImportMark account</h2>

<p>Hello,</p>

<p>Use the 6-digit code below to verify your email address and complete your registration.</p>

<div style="margin: 32px 0; text-align: center;">
  <div style="display: inline-block; background: #f5f5f0; border-radius: 12px; padding: 24px 40px;">
    <p style="margin: 0; font-size: 13px; color: #828282; letter-spacing: 1px; text-transform: uppercase; font-family: sans-serif;">Your verification code</p>
    <p style="margin: 12px 0 0; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #141414; font-family: monospace;">{{ .Token }}</p>
  </div>
</div>

<p style="color: #828282; font-size: 13px;">This code expires in <strong>1 hour</strong>. If you did not request this, you can safely ignore this email.</p>

<p style="color: #828282; font-size: 13px;">— ImportMark Team</p>
```

---

## 2. Reset password (forgot + change password)

**Subject:** `Your ImportMark password reset code`

**Body:**

```html
<h2>Reset your ImportMark password</h2>

<p>Hello,</p>

<p>Use the 6-digit code below to reset or change your password.</p>

<div style="margin: 32px 0; text-align: center;">
  <div style="display: inline-block; background: #f5f5f0; border-radius: 12px; padding: 24px 40px;">
    <p style="margin: 0; font-size: 13px; color: #828282; letter-spacing: 1px; text-transform: uppercase; font-family: sans-serif;">Password reset code</p>
    <p style="margin: 12px 0 0; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #141414; font-family: monospace;">{{ .Token }}</p>
  </div>
</div>

<p style="color: #828282; font-size: 13px;">This code expires in <strong>1 hour</strong>. If you did not request this, ignore this email — your password will not change.</p>

<p style="color: #828282; font-size: 13px;">— ImportMark Team</p>
```

---

## 3. Invite user (IMPORTANT — Google-style Accept button)

Used when admin/manager creates customer or manager accounts.

**Subject:** `You've been invited to ImportMark`

**Body:** Paste **only** the HTML below into the Invite template (do not paste this markdown heading or the \`\`\`html fence).

```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #141414;">
  <h1 style="font-size: 22px; line-height: 1.35; margin: 0 0 16px;">
    You've been invited to join ImportMark
  </h1>

  <p style="font-size: 15px; line-height: 1.6; margin: 0 0 12px;">Hi{{ if .Data.full_name }} {{ .Data.full_name }}{{ end }},</p>

  <p style="font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
    An ImportMark administrator has invited you to create an account on the wholesale platform.
  </p>

  <div style="text-align: center; margin: 0 0 16px;">
    <a
      href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/set-password"
      style="display: inline-block; background: #141414; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 8px;"
    >
      Accept invite
    </a>
  </div>

  <p style="font-size: 13px; line-height: 1.5; color: #666666; margin: 0 0 24px; text-align: center;">
    This invite expires in <strong>1 hour</strong>.
  </p>

  <p style="font-size: 13px; line-height: 1.5; color: #828282; margin: 0;">
    If you were not expecting this invitation, you can ignore this email.
  </p>

  <p style="font-size: 13px; color: #828282; margin: 24px 0 0;">— ImportMark Team</p>
</div>
```

---

## Dashboard settings checklist

- Custom SMTP enabled
- **Confirm email** = ON
- **Email OTP expiration** = `3600` (1 hour)
- Site URL = your app URL (e.g. `http://localhost:3000`)
- Redirect URLs include `http://localhost:3000/**` and `http://localhost:3000/auth/confirm**`
