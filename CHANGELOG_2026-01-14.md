# Dashboard Update - 14 stycznia 2026

## 🎨 Redesign UI - Cyberpunk/Laboratory Theme

### ✅ Zmiany wizualne
- **Nowy design:** Cyberpunk/laboratory aesthetic z v0.dev
- **Logo:** Dodano `logoMIaSoftware.png` (128x128px) w headerze
- **Usunięto:** Tekst "Laboratory v11.3" i email z top-nav
- **Komponenty:**
  - `TopNav` - Header z logo, panic button, session display
  - `ServicesLaunchpad` - 7 kafelków usług z gradientami
  - `BeszelMetrics` - Live CPU/RAM/Disk z wykresami sparkline
  - `StorageCluster` - 4 dyski (SYSTEM, DATA, PHOTOS, BACKUP) z progress bars
  - `DockerOrbit` - Lista kontenerów z użyciem RAM
  - `SecurityPrison` - CrowdSec banned IPs + threat stats

### 🔧 Techniczne
- **shadcn/ui:** Dodano 6 komponentów Radix UI (switch, progress, slot, etc.)
- **recharts:** 2.15.4 dla sparkline charts
- **tailwindcss-animate:** Animacje CSS
- **CSS Variables:** HSL color system dla dark theme
- **Image Optimization:** Next.js Image dla logo

---

## 📡 API Endpoints - Real-time Data

### ✅ Integracje
- `/api/stats` - Glances system metrics (2s refresh)
  - CPU, RAM, Disk % z historią 20 punktów
  - Lista kontenerów z memory usage
  - **NOWE:** 4 dyski (dodano `/mnt` mount do glances)
- `/api/crowdsec` - Security data (10s refresh)
  - Banned IPs list
  - Threat statistics (total, by type)
  - Status indicator
- **useSWR:** Client-side data fetching z auto-refresh

### 🗄️ Glances Update
- Dodano mount `/mnt:/mnt:ro` w `docker-compose.glances.yml`
- Teraz widzi wszystkie dyski: nvme0n1p1 (SYSTEM), sda1 (DATA), sdb1 (BACKUP), sdc1 (PHOTOS)

---

## 🔐 Authentik SSO - HTTPS Fix

### ✅ Konfiguracja
- `NEXTAUTH_URL`: `https://dash.miasoftware.pl` (było: `http://192.168.50.234:3000`)
- `AUTHENTIK_ISSUER`: `http://192.168.50.234:9000/application/o/dashboard/` (dodano slash!)
- NextAuth options:
  - `trustHost: true` - dla HTTPS za reverse proxy
  - `useSecureCookies: process.env.NODE_ENV === "production"`

### 📝 Redirect URIs (w PostgreSQL)
```sql
UPDATE authentik_providers_oauth2_oauth2provider 
SET _redirect_uris = '[
  {"url": "https://dash.miasoftware.pl/api/auth/callback/authentik", "matching_mode": "strict"},
  {"url": "http://192.168.50.234:3000/api/auth/callback/authentik", "matching_mode": "strict"},
  {"url": "http://localhost:3000/api/auth/callback/authentik", "matching_mode": "strict"}
]'::jsonb 
WHERE client_id = 'dashboard-c8e625f59f00178d6843';
```

### 🐛 Naprawione błędy
- **CSRF Failed:** Fixed by `trustHost: true` + pełny restart docker-compose
- **OAuthSignin 404:** Fixed by dodanie slash `/` na końcu `AUTHENTIK_ISSUER`
- **Redirect URI mismatch:** Fixed przez update PostgreSQL (UI Authentik nie działało)

---

## 🧹 Cleanup Projects

### ✅ Usunięte foldery
```bash
cd /home/wojciech/projects
sudo rm -rf audiobookshelf beszel beszel-sso bookwyrm changedetection nextcloud monitoring
rm -rf "dashboard copy" dashboard_backup_2026-01-08.tar.gz projektwygladu
```

### 📦 Pozostałe projekty (8)
- `authentik/` - SSO Provider
- `dashboard/` - Main dashboard (aktywny)
- `immich/` - Photo management configs
- `mealie/` - Recipe manager configs
- `qbittorrent/` - Torrent client configs
- `sftpgo/` - File server configs

---

## 🔗 Service URLs Update

### ✅ Zaktualizowane linki
- **Dashboard:** https://dash.miasoftware.pl (było: http://192.168.50.234:3000)
- **Immich:** https://immich.miasoftware.pl/photos (było: http://192.168.50.234:2283)

---

## 📊 Dashboard Features

### ✅ Real-time Components
1. **Beszel Metrics**
   - CPU % z 20-point history sparkline (zielony)
   - RAM % z 20-point history sparkline (niebieski)
   - Disk % z 20-point history sparkline (pomarańczowy)
   - Refresh: 2s

2. **Storage Cluster**
   - SYSTEM: 233GB (22% używane)
   - DATA: 914GB (1% używane)
   - BACKUP: 1.9TB (0% używane)
   - PHOTOS: 1.9TB (6% używane)
   - Progress bars z color-coding

3. **Docker Orbit**
   - Top 8 kontenerów
   - Status: running/stopped z ikonami
   - Memory usage w MB
   - Refresh: 5s

4. **Security Prison**
   - Total Threats counter
   - Banned IPs counter
   - Lista zbanowanych IP z:
     - IP address + country
     - Scenario/reason
     - Duration
     - Unban button (UI only)
   - Refresh: 10s

---

## 🛠️ Dependencies Added

### 📦 npm packages
```json
{
  "@radix-ui/react-switch": "1.1.2",
  "@radix-ui/react-progress": "1.1.1",
  "@radix-ui/react-slot": "1.1.1",
  "class-variance-authority": "^0.7.1",
  "tailwindcss-animate": "latest",
  "recharts": "2.15.4"
}
```

### 🎨 UI Components
- `components/ui/button.tsx`
- `components/ui/switch.tsx`
- `components/ui/progress.tsx`
- `lib/utils.ts` (tailwind cn helper)

---

## 🔒 Security Status

### ✅ Zachowane zabezpieczenia
- **NextAuth.js** - Session JWT strategy
- **Authentik SSO** - OAuth2/OIDC flow
- **Middleware** - Session check na wszystkich route'ach
- **Protected API** - Glances, CrowdSec wymagają dostępu z cosmos-network
- **CrowdSec** - IPS/IDS aktywny, 0 aktywnych banów

### 🔐 Environment Variables
```env
NEXTAUTH_URL=https://dash.miasoftware.pl
NEXTAUTH_SECRET=super-secret-key-change-in-production-32chars
AUTHENTIK_CLIENT_ID=dashboard-c8e625f59f00178d6843
AUTHENTIK_CLIENT_SECRET=DashSecret+123456789ABCDEFGHIJKLMNOPQRST==
AUTHENTIK_ISSUER=http://192.168.50.234:9000/application/o/dashboard/
```

---

## 📈 Statystyki

- **Backup size:** 47MB (14.01.2026 11:34)
- **Containers running:** 20
- **Total RAM usage:** ~4.7GB (homelab-dashboard-dev: 1257MB top consumer)
- **Disk usage:** 22% SYSTEM, 1% DATA, 0% BACKUP, 6% PHOTOS
- **Uptime:** 4 days, 8+ hours

---

## 🚀 Next Steps

### 🔜 TODO
- [ ] Implementacja Unban functionality (API endpoint `cscli decisions delete`)
- [ ] CPU metrics dla kontenerów (Glances nie zbiera, wymaga dodatkowych uprawnień)
- [ ] Stabilizacja Cosmos Server (obecnie unstable)
- [ ] Migracja Authentik na HTTPS (wymaga certyfikatu)
- [ ] Dodanie alertów/powiadomień dla CrowdSec
- [ ] Rozszerzenie Storage Cluster o I/O stats

---

**Autor:** GitHub Copilot + wojciech  
**Data:** 14 stycznia 2026  
**Wersja:** Dashboard v11.3 Cyberpunk Edition
