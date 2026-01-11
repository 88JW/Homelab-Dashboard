# 🏠 HomeLab SSO Portal

**Dashboard Next.js z integracją Authentik SSO**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![NextAuth](https://img.shields.io/badge/NextAuth.js-4-purple)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)

## 📋 Funkcje

✅ **Single Sign-On** - OAuth2 przez Authentik  
✅ **App Grid** - 8 kafelków aplikacji HomeLab  
✅ **System Stats** - CPU, RAM, kontenery (TODO: naprawa API)  
✅ **User Session** - JWT tokens, auto logout  
✅ **Middleware Protection** - Ochrona głównej strony

## 🚀 Quick Start

### 1. Uruchom z Docker Compose (Development)

```bash
cd /home/wojciech/projects/dashboard
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Dostęp

- **Dashboard:** http://192.168.50.234:3000
- **Login:** Kliknij "Sign in with Authentik"
- **Po zalogowaniu:** Zobacz kafelki aplikacji + system stats

## 🔧 Konfiguracja

### Environment Variables (`.env.local`)

```bash
NEXTAUTH_URL=http://192.168.50.234:3000
NEXTAUTH_SECRET=super-secret-key-change-in-production-32chars

AUTHENTIK_CLIENT_ID=dashboard-c8e625f59f00178d6843
AUTHENTIK_CLIENT_SECRET=DashSecret+123456789ABCDEFGHIJKLMNOPQRST==
AUTHENTIK_ISSUER=http://192.168.50.234:9000/application/o/dashboard
```

### Authentik OAuth2 Provider

**Provider ID:** 6 (Dashboard)  
**Redirect URI:** `http://192.168.50.234:3000/api/auth/callback/authentik`  
**Scopes:** openid, email, profile

## 📁 Struktura Projektu

```
dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts  # NextAuth handler
│   │   │   ├── stats/route.ts               # System stats API (TODO)
│   │   │   └── containers/route.ts          # Docker API (TODO)
│   │   ├── page.tsx                         # Main dashboard
│   │   ├── login/page.tsx                   # SSO login page
│   │   └── layout.tsx                       # Root layout + SessionProvider
│   ├── components/
│   │   ├── AppGrid.tsx                      # Kafelki aplikacji
│   │   └── Providers.tsx                    # NextAuth SessionProvider
│   └── middleware.ts                        # Auth protection
├── .env.local                               # OAuth2 credentials
├── docker-compose.dev.yml                   # Dev container
└── package.json
```

## 🔐 Bezpieczeństwo

- **JWT Sessions** - Tokeny przechowywane w cookie (httpOnly)
- **Middleware** - Blokada głównej strony bez sesji
- **OAuth2 PKCE** - S256 challenge dla bezpiecznego flow
- **Scope Mappings** - openid, email, profile w Authentik

## 📦 Backup & Restore

### Backup

```bash
bash /home/wojciech/backups/backup-dashboard-sso.sh
```

**Zawartość:**
- Kod źródłowy (`src/`)
- OAuth2 credentials (`.env.local`)
- Konfiguracja Dockera
- Provider z Authentik (SQL dump)

### Restore

```bash
BACKUP="/home/wojciech/backups/dashboard-sso-YYYYMMDD-HHMMSS"

# Przywróć pliki
cp -r $BACKUP/src/* /home/wojciech/projects/dashboard/src/
cp $BACKUP/.env.local /home/wojciech/projects/dashboard/

# Restart
cd /home/wojciech/projects/dashboard
docker-compose -f docker-compose.dev.yml restart
```

## 🛠️ Development

### Install Dependencies

```bash
npm install --legacy-peer-deps
```

### Run Dev Server

```bash
npm run dev -- --hostname 0.0.0.0
```

### Check Logs

```bash
docker logs -f homelab-dashboard-dev
```

## 🗺️ Aplikacje w Grid

| Aplikacja | URL | SSO |
|:----------|:----|:----|
| **Immich** | https://immich.miasoftware.pl | ✅ OAuth2 |
| **Mealie** | http://192.168.50.234:9091 | ✅ OAuth2 |
| **qBittorrent** | http://192.168.50.234:8181 | ✅ oauth2-proxy |
| **Nextcloud** | https://nextcloud.miasoftware.pl:8443 | ⏳ TODO |
| **Beszel** | http://192.168.50.234:8090 | ❌ Brak |
| **Changedetection** | http://192.168.50.234:5000 | ❌ Brak |
| **BookWyrm** | http://192.168.50.234:8085 | ❌ Brak |
| **Authentik** | http://192.168.50.234:9000 | ⚙️ Admin |

## 📚 Dokumentacja

- **Blueprint v11.3:** [HomeLab_Master_Blueprint_v11.3.md](./HomeLab_Master_Blueprint_v11.3.md)
- **Roadmap:** [HomeLab Roadmap_ Plan Rozbudowy .md](./HomeLab%20Roadmap_%20Plan%20Rozbudowy%20.md)
- **NextAuth Docs:** https://next-auth.js.org
- **Authentik Docs:** https://docs.goauthentik.io

## ⚠️ TODO

- [ ] Naprawić `/api/stats` - połączenie z Glances
- [ ] Naprawić `/api/containers` - Docker API
- [ ] Dodać Nextcloud SSO (OIDC plugin)
- [ ] Status check aplikacji (online/offline)
- [ ] Real-time metrics chart

---

**Wersja:** v1.0 (11.01.2026)  
**Autor:** wojciech@miasoftware.pl  
**Stack:** Next.js 16 + NextAuth.js 4 + Authentik 2024.12.3
