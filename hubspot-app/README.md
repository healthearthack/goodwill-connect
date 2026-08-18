# Goodwill Connect - HubSpot Technology Partner Developer App

This directory contains the official **HubSpot Developer Projects (Platform Version 2025.2 / 2026.03)** package for **Goodwill Connect (CSR & Tech Onramp)**.

---

## Project Structure

```
hubspot-app/
├── hsproject.json                                      # Project metadata & platform version
└── src/
    └── app/
        ├── app-hsmeta.json                             # App UID, OAuth Scopes, Permitted URLs
        └── extensions/
            └── cards/
                └── volunteer-record-card-hsmeta.json   # CRM UI Extension Card definition
```

---

## How to Deploy to Your HubSpot Developer Account

### 1. Install & Authenticate the HubSpot CLI
```bash
npm install -g @hubspot/cli@latest
hs account auth
```
*(Follow the browser prompt to log into your HubSpot Developer Account).*

### 2. Upload / Deploy the Project
Navigate into this folder and upload the project:
```bash
cd hubspot-app
hs project upload
```

### 3. Test & Preview
```bash
hs project dev
```
Your app is now officially created inside your HubSpot Developer Account under **Manage Apps**, with OAuth credentials and the CRM UI Extension card ready for Marketplace certification!
