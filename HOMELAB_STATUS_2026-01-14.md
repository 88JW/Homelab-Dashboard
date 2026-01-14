# 🏠 HomeLab Status Report - 14 stycznia 2026

**Serwer:** Debian 12 (192.168.50.234)  
**Ostatni backup:** 14.01.2026 11:34 (47MB)  
**Status:** ✅ Operational & Secured  
**Dashboard:** https://dash.miasoftware.pl (cyberpunk design v11.3)

---

## 📊 AKTUALNY STAN SYSTEMU

### ✅ DZIAŁAJĄCE USŁUGI (9 aplikacji)

| Usługa | Port | URL | SSO | Status | Notatki |
|:-------|:-----|:----|:----|:-------|:--------|
| **Dashboard** | 3000 | https://dash.miasoftware.pl | ✅ Authentik | 🟢 ONLINE | Next.js 16 + NextAuth + Cyberpunk UI |
| **Authentik** | 9000 | http://192.168.50.234:9000 | ⚙️ Admin | 🟢 ONLINE | SSO Provider (v2024.12.3) |
| **Immich** | 2283 | https://immich.miasoftware.pl | ✅ OAuth2 | 🟢 ONLINE | Photo Management + AI |
| **Mealie** | 9925 | http://192.168.50.234:9925 | ✅ OAuth2 | 🟢 ONLINE | Recipe Manager |
| **qBittorrent** | 8181 | http://192.168.50.234:8181 | ✅ oauth2-proxy | 🟢 ONLINE | Torrent Client |
| **SFTPGo** | 8080 | http://192.168.50.234:8080 | ❌ | 🟢 ONLINE | File Management |
| **Glances** | 61208 | http://192.168.50.234:61208 | ❌ | 🟢 ONLINE | System Metrics API |
| **Dozzle** | - | (internal) | ❌ | 🟢 ONLINE | Docker Logs Viewer |
| **CrowdSec** | - | (internal) | ❌ | 🟢 ONLINE | Security IPS |
| **Camera-FTP** | 21 | FTP only | ❌ | 🟢 ONLINE | FTP dla kamer/sprzętu |
| **Cosmos Server** | 80/443 | http://192.168.50.234 | ⚙️ | 🟡 UNSTABLE | Reverse Proxy + Gateway |

### ❌ USUNIĘTE/NIEAKTYWNE USŁUGI (WYCZYSZCZONE 14.01.2026)

| Usługa | Powód usunięcia | Foldery usunięte |
|:-------|:----------------|:-----------------|
| **Nextcloud** | Zastąpione przez Immich + SFTPGo | ✅ USUNIĘTE |
| **Beszel** | Problemy z SSO, zastąpione Glances | ✅ USUNIĘTE |
| **BookWyrm** | Nieużywane | ✅ USUNIĘTE |
| **Audiobookshelf** | Nieużywane | ✅ USUNIĘTE |
| **Changedetection** | Nieużywane | ✅ USUNIĘTE |
| **Dashboard-v2** | Duplikat | ✅ USUNIĘTE |
| **monitoring/** | Stare skrypty | ✅ USUNIĘTE |
| **projektwygladu/** | Tymczasowy folder v0.dev | ✅ USUNIĘTE |

---

## 🔐 AUTHENTIK SSO - AKTYWNE INTEGRACJE

### ✅ Skonfigurowane Providery

| ID | Provider | Aplikacja | Typ integracji | Client ID | Status |
|:---|:---------|:----------|:---------------|:----------|:-------|
| 6 | Dashboard | Dashboard Portal | Native OAuth2 | `dashboard-c8e625f59f00178d6843` | ✅ Działa |
| - | Immich | Photo Management | Native OAuth2 | *(sprawdź w Authentik)* | ✅ Działa |
| - | Mealie | Recipe Manager | Native OAuth2 | *(sprawdź w Authentik)* | ✅ Działa |
| - | qBittorrent | Torrent Client | oauth2-proxy | *(sprawdź w Authentik)* | ✅ Działa |

### ❌ Usunięte Providery

- **Provider ID 8** (Beszel) - usunięty 11.01.2026 (problemy z PocketBase OAuth2)

### 📋 Redirect URIs

```
Dashboard:    http://192.168.50.234:3000/api/auth/callback/authentik
Immich:       https://immich.miasoftware.pl/auth/login
              https://immich.miasoftware.pl/user-settings
Mealie:       http://192.168.50.234:9925/login
qBittorrent:  http://192.168.50.234:8181/oauth2/callback
```

---

## 🐳 DOCKER - INFRASTRUKTURA

### Sieci Docker

```
cosmos-network  (bridge) - Główna sieć aplikacji
dashboard_default (bridge) - Sieć Dashboard
```

### Kontenery wg grup

**Authentication & SSO (4 kontenery):**
- `authentik_server_1` - Server
- `authentik_worker_1` - Worker
- `authentik_postgresql_1` - Database
- `authentik_redis_1` - Cache

**Media & Files (5 kontenerów):**
- `immich_server` - Immich Server
- `immich_postgres` - Immich DB (pgvecto-rs)
- `immich_redis` - Immich Cache
- `immich_machine_learning` - AI/ML
- `camera-ftp` - FTP Server

**Applications (5 kontenerów):**
- `homelab-dashboard-dev` - Dashboard Next.js
- `mealie` - Recipe Manager
- `qbittorrent` - Torrent Client
- `qbittorrent-oauth2-proxy` - OAuth2 Proxy
- `sftpgo` - File Manager

**Infrastructure (5 kontenerów):**
- `cosmos-server` - Reverse Proxy
- `cosmos-mongo-GSm` - Cosmos DB
- `glances` - Monitoring API
- `dozzle` - Logs
- `crowdsec` - Security
- `docker-proxy` - Docker Socket Proxy

**Łącznie:** 20 kontenerów

---

## 💾 STORAGE & BACKUPY

### Dyski NAS (Samba)

| Share | Device | Path | Filesystem | Rozmiar | Zawartość |
|:------|:-------|:-----|:-----------|:--------|:----------|
| `homelab-share` | /dev/sda1 | /mnt/dane | ext4 | 931GB | Nextcloud (legacy), SFTPGo, backups |
| `photos` | /dev/sdc1 | /mnt/photos | NTFS | 1.9TB | Zdjęcia (85GB w Recycle Bin) |
| `backup` | /dev/sdb1 | /mnt/backup | NTFS | 1.9TB | Pusty (rezerwowy) |

**Mapowanie Windows:**
```
Z: → \\192.168.50.234\homelab-share
Y: → \\192.168.50.234\photos
X: → \\192.168.50.234\backup
```

### Backupy

**Ostatni backup:** 14.01.2026 11:34  
**Lokalizacja:** `/home/wojciech/backups/full-backup-20260114-113416/`  
**Rozmiar:** 47MB  

**Zawartość:**
- ✅ Authentik database (2.8MB)
- ✅ Dashboard kod źródłowy + .env
- ✅ Immich database (44MB)
- ✅ Mealie, qBittorrent, SFTPGo configs
- ✅ OAuth2 providers dump
- ✅ Skrypty monitoringu

**Skrypt backupowy:** `/home/wojciech/backup-full.sh`

**Starsze backupy:**
```
/home/wojciech/backups/
├── authentik-sso-20260111-163316/
├── authentik-sso-20260111-163321/
├── dashboard-sso-20260111-173920/
└── full-backup-20260114-113416/  ← NAJNOWSZY
```

---

## 📁 STRUKTURA PROJEKTU

### Aktywne projekty

```
/home/wojciech/projects/
├── authentik/           ✅ SSO Provider
├── dashboard/           ✅ Next.js Dashboard (GŁÓWNY PROJEKT)
├── immich/             ✅ Photo Management
├── mealie/             ✅ Recipe Manager
├── qbittorrent/        ✅ Torrent + oauth2-proxy
└── sftpgo/             ✅ File Management
```

### Do usunięcia (nieaktywne)

```
/home/wojciech/projects/
├── audiobookshelf/      ❌ Usunąć
├── beszel/              ❌ Usunąć
├── beszel-sso/          ❌ Usunąć
├── bookwyrm/            ❌ Usunąć
├── changedetection/     ❌ Usunąć
├── dashboard-v2/        ❌ Usunąć (duplikat)
├── monitoring/          ❌ Usunąć (przestarzałe)
└── nextcloud/           ❌ Usunąć (nieużywane)
```

---

## 🔧 KONFIGURACJA DASHBOARD

### Pliki źródłowe

```
dashboard/src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  ✅ NextAuth OAuth2
│   │   ├── stats/route.ts               ✅ System metrics (Glances API)
│   │   ├── containers/route.ts          ⚠️  TODO: Docker API
│   │   ├── crowdsec/route.ts            ✅ CrowdSec bans
│   │   └── fail2ban/route.ts            ⚠️  Legacy (CrowdSec używany)
│   ├── page.tsx                         ✅ Main dashboard page
│   ├── login/page.tsx                   ✅ SSO login page
│   └── layout.tsx                       ✅ Root layout
├── components/
│   ├── AppGrid.tsx                      ✅ Application tiles
│   └── Providers.tsx                    ✅ SessionProvider
└── middleware.ts                        ✅ Auth middleware
```

### Environment Variables (.env.local)

```bash
NEXTAUTH_URL=http://192.168.50.234:3000
NEXTAUTH_SECRET=super-secret-key-change-in-production-32chars
AUTHENTIK_CLIENT_ID=dashboard-c8e625f59f00178d6843
AUTHENTIK_CLIENT_SECRET=DashSecret+123456789ABCDEFGHIJKLMNOPQRST==
AUTHENTIK_ISSUER=http://192.168.50.234:9000/application/o/dashboard
```

### Docker Compose (docker-compose.dev.yml)

```yaml
version: '3.8'
services:
  homelab-dashboard:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: homelab-dashboard-dev
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json
      - ./next.config.ts:/app/next.config.ts
    networks:
      - default
      - cosmos-network  # ← Kluczowe dla połączenia z Glances!
    environment:
      - NODE_ENV=development

networks:
  cosmos-network:
    external: true
```

---

## 🐛 ZNANE PROBLEMY & TODO

### 🔴 Krytyczne

1. **Cosmos Server - niestabilny**
   - Status: Restartuje się często
   - Impact: Brak dostępu przez domeny (immich.miasoftware.pl)
   - Workaround: Dostęp bezpośredni przez IP:PORT
   - TODO: Diagnoza logów Cosmos

2. **Dashboard - brak integracji Docker API**
   - `/api/containers` nie działa
   - TODO: Podłączyć docker-socket-proxy

### 🟡 Średnie

3. **Aplikacje bez Grid w Dashboard**
   - Brak kafelków dla: SFTPGo, Glances, Cosmos
   - TODO: Dodać do AppGrid.tsx

4. **Brak real-time metrics**
   - Dashboard pokazuje stats ale bez wykresów historycznych
   - TODO: Dodać charty (Tremor/Recharts)

### 🟢 Nice to have

5. **Alerty Telegram**
   - TODO: Powiadomienia o problemach
   
6. **Status check aplikacji**
   - TODO: Czy aplikacja online/offline (health checks)

---

## 📚 DOKUMENTACJA

### Pliki dokumentacji

| Plik | Zawartość | Status |
|:-----|:----------|:-------|
| [README.md](README.md) | Quick Start Guide | ✅ Aktualny |
| [HomeLab_Master_Blueprint_v11.3.md](HomeLab_Master_Blueprint_v11.3.md) | Architektura systemu | ⚠️ Częściowo nieaktualny |
| [HomeLab Roadmap_ Plan Rozbudowy .md](HomeLab%20Roadmap_%20Plan%20Rozbudowy%20.md) | Plan rozwoju | ⚠️ Częściowo nieaktualny |
| [SESJA_2026-01-11.md](SESJA_2026-01-11.md) | Notatki sesji 11.01 | ✅ Historyczny |
| **HOMELAB_STATUS_2026-01-14.md** | **Ten dokument** | ✅ **GŁÓWNY DOKUMENT** |

### ⚠️ AKTUALIZACJE POTRZEBNE W STARYCH DOKUMENTACH

**HomeLab_Master_Blueprint_v11.3.md:**
- ❌ Wymienia Nextcloud jako ONLINE - usunięte
- ❌ Wymienia Beszel jako ONLINE - usunięte
- ❌ Wymienia Audiobookshelf jako ONLINE - usunięte
- ❌ Wymienia BookWyrm jako ONLINE - usunięte
- ❌ Wymienia Changedetection jako ONLINE - usunięte
- ✅ Poprawna architektura Docker i SSO

**HomeLab Roadmap_ Plan Rozbudowy .md:**
- ⚠️ Plan rozwoju zawiera aplikacje już wdrożone (Immich, Mealie, Authentik)
- ⚠️ Plan rozwoju zawiera aplikacje które zostały porzucone (Beszel z SSO)
- ✅ Sekcje "ZROBIONE" są poprawne

**Rekomendacja:** Używaj **HOMELAB_STATUS_2026-01-14.md** jako głównego źródła prawdy o aktualnym stanie systemu.

---

## 🚀 ROADMAP (Następne kroki)

### Faza 1: Porządki ✅ W TRAKCIE
- [x] Utworzenie kompleksowego backupu (14.01.2026)
- [x] Analiza aktualnego stanu
- [ ] Usunięcie nieaktywnych folderów projektów
- [ ] Cleanup starych backupów

### Faza 2: Stabilizacja systemu
- [ ] Naprawa Cosmos Server
- [ ] Dodanie Docker API do Dashboard
- [ ] Testy przywracania z backupu

### Faza 3: Dashboard Enhancement
- [ ] Real-time metrics charts
- [ ] Docker container management
- [ ] Application health checks
- [ ] Telegram notifications

### Faza 4: New Services (Roadmap)
- [ ] AdGuard Home (DNS blocker)
- [ ] Uptime Kuma (uptime monitoring)
- [ ] Home Assistant (IoT)
- [ ] Gitea/Forgejo (Git hosting)

---

## 📞 QUICK REFERENCE

### URLs Dostępu

```
Dashboard:     http://192.168.50.234:3000
Authentik:     http://192.168.50.234:9000
Immich:        http://192.168.50.234:2283 (bezpośredni)
Mealie:        http://192.168.50.234:9925
qBittorrent:   http://192.168.50.234:8181
SFTPGo:        http://192.168.50.234:8080
Glances:       http://192.168.50.234:61208/api/4
Cosmos:        http://192.168.50.234 (niestabilny)
```

### Komendy zarządzania

```bash
# Backup
/home/wojciech/backup-full.sh

# Restart Dashboard
cd /home/wojciech/projects/dashboard
docker-compose -f docker-compose.dev.yml restart

# Restart Authentik
cd /home/wojciech/projects/authentik
docker-compose restart

# Logi
docker logs -f homelab-dashboard-dev
docker logs -f authentik_server_1

# Status
docker ps
docker stats --no-stream
```

### Ścieżki konfiguracji

```
Dashboard:     /home/wojciech/projects/dashboard/
Authentik:     /home/wojciech/projects/authentik/
Immich:        /home/wojciech/projects/immich/
Backupy:       /home/wojciech/backups/
Dane NAS:      /mnt/dane, /mnt/photos, /mnt/backup
```

---

**Dokument wygenerowany:** 14.01.2026  
**Następna aktualizacja:** Po zmianach w systemie  
**Autor:** wojciech@miasoftware.pl

**Status systemu:** 🟢 Operational (9 usług aktywnych, 1 niestabilna)
