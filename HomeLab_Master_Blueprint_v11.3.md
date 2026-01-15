# **🛰️ HomeLab miasoftware.pl | Master Blueprint v11.3**

**Status: Laboratory Edition - Operational & Hardened**

Ten dokument stanowi nadrzędną specyfikację integrującą architekturę systemu, infrastrukturę sprzętową, sieć Docker oraz strategię bezpieczeństwa projektu Homelab.

## **🏗️ 1. Architektura Systemu (Model BFF)**

Projekt działa w modelu **Backend-for-Frontend (BFF)**, co zapewnia izolację źródeł danych od interfejsu użytkownika.

*   **Glances (Data Source):** Zbiera surowe dane systemowe i udostępnia je przez API v4.
*   **Next.js API (BFF):** Agreguje dane z wielu endpointów (CPU, MEM, FS, Docker) i serwuje je jako jeden czysty obiekt JSON pod /api/stats.
*   **React Frontend:** Wykorzystuje bibliotekę **Tremor** do wizualizacji oraz **SWR** do odświeżania danych w czasie rzeczywistym.
*   **Cosmos Cloud:** Zarządza dostępem zewnętrznym (Reverse Proxy), certyfikatami SSL i bezpiecznym tunelowaniem.

## **🛠️ 2. Stack Technologiczny (The Lab)**

*   **Framework:** Next.js 15 (App Router), TypeScript.
*   **Stylizacja:** Tailwind CSS v4 + PostCSS (@tailwindcss/postcss).
*   **UI Kit:** Tremor v3 (analityka), Lucide React (ikony).
*   **Pobieranie danych:** SWR (Stale-While-Revalidate) - polling co 2s.
*   **Konteneryzacja:** Docker & Docker Compose w sieci cosmos-network.

## **🏗️ 3. Infrastruktura & Sieć (Docker)**

| Warstwa | Komponent | Szczegóły |
| --- | --- | --- |
| **Host** | Debian 12 | IP: 192.168.50.234 |
| **Gateway** | Cosmos Server | SSL via Let's Encrypt |
| **Network** | cosmos-network | Izolacja backendu (Bazy danych) |
| **Storage** | 1TB HDD | Montowanie: /mnt/dane |

### **📡 Źródła Danych (Data Providers)**

| Usługa | Rola | Protokół | Funkcja w UI |
| --- | --- | --- | --- |
| **Glances** | Metryki systemowe | REST JSON | CPU, RAM, Temp HDD |
| **Docker Proxy** | Zarządzanie Dockerem | Docker Engine API | Lista kontenerów, Restart/Stop |
| **CrowdSec LAPI** | Bezpieczeństwo | REST JSON | Lista banów (Więzienie), Ataki |
| **Cosmos API** | Zarządzanie Gateway | REST JSON | Stan SSL, DNS, Panic Button |

## **💾 4. Zarządzanie Magazynem Danych (1TB HDD)**

Dysk mechaniczny zamontowany w /mnt/dane służy jako główny magazyn plików i kopii zapasowych.

**Mapa Dysku (/mnt/dane):**

*   ./nextcloud/data (~296MB) : Prywatne pliki chmury Nextcloud.
*   ./nextcloud/db : Baza MariaDB (Nextcloud).
*   ./sftpgo/data/wojciech : Dane użytkownika SFTP.
*   ./backups (~484MB) : Snapshoty .tar.gz i archiwa projektów.
*   ./timeshift (~4.0GB) : Migawki systemu operacyjnego Debian.

## **🐳 5. Rejestr Usług (Container Registry)**

Wszystkie usługi działają w sieci bridge cosmos-network, co pozwala na komunikację po nazwach kontenerów.

| Usługa | Port (UI) | URL Lokalne / Funkcja | Status |
| --- | --- | --- | --- |
| **Cosmos UI** | 80/443 | `https://192.168.50.234` (Gateway) | ✅ ONLINE |
| **Nextcloud** | 8443 | `https://192.168.50.234:8443` (Chmura) | ✅ ONLINE |
| **Immich** | 2283 | `http://192.168.50.234:2283` (Zdjęcia AI) | ✅ ONLINE |
| **SFTPGo** | 8080 | `http://192.168.50.234:8080` (Pliki) | ✅ ONLINE |
| **Beszel** | 8090 | `http://192.168.50.234:8090` (Monitoring) | ✅ ONLINE |
| **Mealie** | 9925 | `http://192.168.50.234:9925` (Przepisy) | ✅ ONLINE |
| **Audiobookshelf** | 9930 | `http://192.168.50.234:9930` (Audiobooki) | ✅ ONLINE |
| **BookWyrm** | 8085 | `http://192.168.50.234:8085` (Książki) | ✅ ONLINE |
| **qBittorrent** | 8181 | `http://192.168.50.234:8181` (Pobieranie) | ✅ ONLINE |
| **Changedetection** | 5000 | `http://192.168.50.234:5000` (Śledzenie) | ✅ ONLINE |
| **n8n** | 5679 | `http://192.168.50.234:5679` (Automatyzacja) | ✅ ONLINE |
| **SSO Portal** | 3000 | `http://192.168.50.234:3000` (Dashboard + Auth) | ✅ ONLINE |
| **Glances** | 61208 | `http://192.168.50.234:61208` (API) | ✅ ONLINE |
| **Camera-FTP** | 21 | FTP (Bez UI) | ✅ ONLINE |

## **🛡️ 6. Koncepcja Bezpieczeństwa (Hardened Approach)**

### **Warstwy Ochrony**

*   **Shield Mode:** Autorska blokada Next.js (wymuszona sesja dla / oraz /api/stats).
*   **Security Center:** Monitorowanie prób brute-force i raportowanie ich do interfejsu.
*   **Panic Button:** (Planowane) Globalny przełącznik aktywujący tryb "Under Attack" w Cosmosie.
*   **CrowdSec:** Dashboard wyświetla listę zablokowanych IP z opcją "Ułaskawienia" (Unban).

## **🚀 7. Roadmapa Implementacji**

*   **Faza 1 (ZAKOŃCZONA):** Infrastruktura, Docker Log Rotation, Glances (Root).
*   **Faza 2 (ZAKOŃCZONA):** Szkielet Next.js, Shield Mode, Monitoring CPU/RAM/HDD.
*   **Faza 3 (W TOKU):** Integracja listy kontenerów, sterowanie Restart/Stop, Alerty Telegram.
*   **Faza 4 (PLAN):** Logi Live via SSE, widok "Więzienia" CrowdSec, Panic Button.

## **📋 8. Procedury Utrzymania (Maintenance)**

*   **Backup Projektów (1.4GB):** tar -czvf /mnt/dane/backups/projects\_$(date +%F).tar.gz /home/wojciech/projects
*   **Monitoring HDD:** df -h /mnt/dane oraz sudo smartctl -H /dev/sda

**Punkty przywracania systemu:**

_Num Name Tags Description_

_\------------------------------------------------------------------------------_

_0 > 2026-01-07\_12-54-48 O Czysty Cosmos przed domena_

_1 > 2026-01-07\_13-05-53 O Po Hardeningu: Sudo, Fail2Ban, SSH_

_2 > 2026-01-09\_13-40-53 O Baseline: Iza+Nextcloud+Cosmos OK_

_3 > 2026-01-09\_13-47-51 O Baseline: Full Config_

_4 > 2026-01-09\_22-08-54 O Immich dziala - system stabilny_

wojciech@linuxserver:~/projects/immich$ ls -lh /mnt/dane/backups/

total 672M

drwxr-xr-x 2 wojciech wojciech 4.0K Jan 9 13:45 manual

\-rw-r--r-- 1 root root 672M Jan 9 22:13 projects\_2026-01-09.tar.gz

drwxr-xr-x 2 wojciech wojciech 4.0K Jan 7 16:55 snapshot\_2026-01-07

# **🛰️9. Raport Wdrożeniowy: Moduł Camera-FTP**

Uruchomienie lekkiego serwera FTP do obsługi urządzeń nieobsługujących bezpiecznych protokołów (starsze kamery CCTV, aparaty fotograficzne z Wi-Fi) oraz integracja z istniejącym systemem plików zarządzanym przez SFTPGo.

### **A. Security & Hardening (Zgodność z Blueprint v11.3)**

*   **Ukrywanie sekretów:** Hasła do FTP nie są wpisane na sztywno w kodzie, lecz pobierane z pliku `.env`.
*   **Segmentacja użytkowników:** Utworzyliśmy osobne konto dla Ciebie (`wojciech`) i osobne dla sprzętu (`sony`). Dzięki temu, w razie kradzieży aparatu, główne hasło pozostaje bezpieczne.

### **B. Integracja z SFTPGo (Storage)**

*   Skonfigurowano mapowanie wolumenów bezpośrednio do struktury danych SFTPGo:
    *   `/mnt/dane/sftpgo/data/wojciech` -> ??
    *   `/mnt/dane/sftpgo/data/sony` -> dla aparatu Sony
*   **Wynik:** Pliki wrzucane przez "głupi" FTP są natychmiast widoczne w nowoczesnym panelu webowym SFTPGo i możliwe do zarządzania.

# **🗂️ 10. HomeLab NAS: Udostępnienie 3 Dysków przez Samba (v1.0)**

**Data wdrożenia:** 10.01.2026  
**Serwer:** Debian 12 (linuxserver: 192.168.50.234)  
**Całkowita pojemność:** 4.5TB+

## **📋 Architektura Dysków**

| Dysk Samba | Device | Path | Filesystem | Pojemność | Zawartość |
| --- | --- | --- | --- | --- | --- |
| **homelab-share** | sda1 | /mnt/dane | ext4 | 931GB | Nextcloud, SFTPGo, backups |
| **photos** | sdc1 | /mnt/photos | NTFS | 1.9TB | Zdjęcia (85GB w Odzyskane/$RECYCLE.BIN) |
| **backup** | sdb1 | /mnt/backup | NTFS | 1.9TB | Pusty (backupy przyszłe) |

## **🔧 Konfiguracja Fstab (/etc/fstab)**

```
# HomeLab NAS - 3 dyski
UUID=7CE2B83DE2B7FA0A  /mnt/backup     ntfs-3g  defaults,uid=1000,gid=1000,nofail  0  2
/dev/sdc1             /mnt/photos    ntfs-3g  defaults,uid=1000,gid=1000,nofail  0  2
```

## **📁 Samba Shares (/etc/samba/smb.conf)**

### **Udziały (Shares):**

```
[homelab-share]
path = /mnt/dane
browseable = yes
writable = yes
valid users = wojciech
create mask = 0777
directory mask = 0777

[photos]
path = /mnt/photos
browseable = yes
writable = yes
valid users = wojciech
create mask = 0777
directory mask = 0777

[backup]
path = /mnt/backup
browseable = yes
writable = yes
valid users = wojciech
create mask = 0777
directory mask = 0777
```

### **Global (ważne):**

```
[global]
workgroup = WORKGROUP
netbios name = linuxserver
hosts allow = 192.168.50.0/24 127.0.0.1
security = user
```

## **🖥️ Windows: Stałe mapowanie dysków**

```
Z: → \\192.168.50.234\homelab-share  (Nextcloud/backups)
X: → \\192.168.50.234\photos         (Zdjęcia 85GB+)
Y: → \\192.168.50.234\backup         (Pusty 1.8TB)
```

**Mapowanie:** PPM "Ten komputer" → "Mapuj dysk sieciowy" → ☑ "Połącz przy logowaniu"

## **✅ Status i testy**

```
# Dyski
df -hT | grep mnt
lsblk -f

# Samba
sudo systemctl status smbd
smbclient -L //192.168.50.234 -U wojciech

# Logi
tail -f /var/log/samba/log.*
```

## **🔒 Bezpieczeństwo**

*   ✅ **UFW:** `sudo ufw allow samba`
*   ✅ **Ograniczone IP:** `hosts allow = 192.168.50.0/24`
*   ✅ **Uwierzytelnianie:** `valid users = wojciech`

---

# **🏠 11. SSO Portal - Dashboard HomeLab**

**Data wdrożenia:** 11.01.2026  
**URL:** http://192.168.50.234:3000  
**Tech Stack:** Next.js 16 + NextAuth.js + Authentik OAuth2

## **📋 Architektura**

```
┌──────────────────────────────────────────┐
│       SSO Portal (Port 3000)             │
│  ┌────────────────────────────────────┐  │
│  │  NextAuth.js Middleware            │  │
│  │  (OAuth2 Client)                   │  │
│  └──────────────┬─────────────────────┘  │
│                 │                         │
│  ┌──────────────▼─────────────────────┐  │
│  │  Dashboard UI                      │  │
│  │  - User Info (name, email)         │  │
│  │  - App Grid (8 aplikacji)          │  │
│  │  - System Stats (CPU, RAM)         │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
                  │
                  │ OAuth2 Flow
                  ▼
        ┌─────────────────┐
        │   Authentik     │
        │    :9000        │
        └─────────────────┘
```

## **🔧 Komponenty**

### **A. NextAuth.js Integration**

**Plik:** `src/app/api/auth/[...nextauth]/route.ts`

```typescript
providers: [{
  id: "authentik",
  type: "oauth",
  wellKnown: "http://192.168.50.234:9000/application/o/dashboard/.well-known/openid-configuration",
  clientId: "dashboard-c8e625f59f00178d6843",
  clientSecret: "DashSecret+...",
  client: {
    token_endpoint_auth_method: "client_secret_post"
  }
}]
```

### **B. Middleware Protection**

**Plik:** `src/middleware.ts`

*   Blokada głównej strony bez sesji
*   Redirect do `/login` dla niezalogowanych
*   Przepuszcza `/api/auth/*`, `/_next/*`, `/login`

### **C. AppGrid Component**

**Plik:** `src/components/AppGrid.tsx`

8 kafelków z aplikacjami:

*   Immich, Mealie, qBittorrent, Nextcloud
*   Beszel, Changedetection, BookWyrm, Authentik

### **D. Docker Deployment**

**Plik:** `docker-compose.dev.yml`

```
services:
  dashboard:
    image: node:20-alpine
    container_name: homelab-dashboard-dev
    ports: ["3000:3000"]
    env_file: [".env.local"]
    command: npm run dev -- --hostname 0.0.0.0
```

## **🔐 OAuth2 Provider (Authentik)**

**Provider ID:** 6  
**Client ID:** `dashboard-c8e625f59f00178d6843`  
**Redirect URI:** `http://192.168.50.234:3000/api/auth/callback/authentik`  
**Issuer Mode:** `per_provider`  
**Signing Key:** `82c74049-8f71-4c44-8d6e-6c444815d6d5`

**Scope Mappings:**

*   openid (`60c92d8e-4368-446a-9f2f-4e22c7024a55`)
*   email (`8c0b16f7-3019-403e-9f9a-cab4cb686b9d`)
*   profile (`0d40f976-fff6-4804-ab9c-b14d1f024630`)

## **🚀 User Flow**

1.  Użytkownik → http://192.168.50.234:3000
2.  Middleware: brak sesji → redirect `/login`
3.  Klik: "Sign in with Authentik"
4.  OAuth2 flow → Authentik weryfikuje
5.  Callback → NextAuth tworzy sesję JWT
6.  Redirect → Dashboard (main page)
7.  **Klik kafelek aplikacji** → SSO automatycznie loguje (jeśli OAuth2 skonfigurowane)

## **📦 Backup**

**Lokalizacja:** `/home/wojciech/backups/dashboard-sso-*`

**Zawartość:**

*   `src/` - Cały kod Next.js
*   `.env.local` - OAuth2 credentials
*   `docker-compose.dev.yml` - Konfiguracja kontenera
*   `dashboard-provider.sql` - Provider z Authentik
*   `README.md` - Instrukcje przywracania

**Restore:**

```
bash /home/wojciech/backups/backup-dashboard-sso.sh
```

## **✅ Status Funkcjonalności**

| Funkcja | Status | Opis |
| --- | --- | --- |
| **Login SSO** | ✅ Działa | OAuth2 przez Authentik |
| **User Info** | ✅ Działa | Name, email w headerze |
| **App Grid** | ✅ Działa | 8 kafelków aplikacji |
| **Middleware** | ✅ Działa | Ochrona głównej strony |
| **System Stats** | ⚠️ Brak danych | API /api/stats nie działa (TODO) |
| **Container List** | ⚠️ Brak danych | Docker API niedostępne (TODO) |
| **Auto Logout** | ✅ Działa | JWT expires + button |

---

# **🔐 12. Single Sign-On (SSO) z Authentik**

**Data wdrożenia:** 11.01.2026  
**Wersja Authentik:** 2024.12.3  
**Endpoint:** http://192.168.50.234:9000  
**Backend:** PostgreSQL 16

## **📋 Architektura SSO**

```
┌─────────────────┐
│   Authentik     │ ← OAuth2/OIDC Provider
│  192.168.50.234 │
│     :9000       │
└────────┬────────┘
         │
    ┌────┴────┬────────────────┬──────────────┐
    │         │                │              │
┌───▼────┐ ┌──▼──────────┐ ┌──▼────────┐  ┌─▼────────┐
│ Mealie │ │ oauth2-proxy│ │  Immich   │  │Nextcloud │
│ :9091  │ │    :8181    │ │   :2283   │  │  :8443   │
│        │ │      │      │ │           │  │          │
│ Native │ │  ┌───▼────┐ │ │  Native   │  │ (TODO)   │
│ OAuth2 │ │  │qBittor.│ │ │  OAuth2   │  │          │
└────────┘ │  │ :8080  │ │ └───────────┘  └──────────┘
           │  └────────┘ │
           │  Legacy App │
           └─────────────┘
```

### **Dwa podejścia do integracji:**

1.  **Native OAuth2** (Immich, Mealie): Aplikacja bezpośrednio rozmawia z Authentik
2.  **oauth2-proxy** (qBittorrent): Reverse proxy dla starszych aplikacji bez OAuth2

## **🔧 Konfiguracja Providerów**

### **PostgreSQL Database Structure**

```
-- Provider Base (authentik_core_provider)
provider_id | name        | authorization_flow_id
4           | qBittorrent | 4d51b223-c51a-475e-8112-8816a3b96588 (implicit-consent)
5           | Immich      | 4d51b223-c51a-475e-8112-8816a3b96588 (implicit-consent)

-- OAuth2 Specifics (authentik_providers_oauth2_oauth2provider)
provider_ptr_id | client_id                         | signing_key_id                       | issuer_mode
4               | PndttovAzq4k2YCriZgF6qmaVU         | 82c74049-8f71-4c44-8d6e-6c444815d6d5 | per_provider
5               | 4c8e625f59f00178d6843e654a823825  | 82c74049-8f71-4c44-8d6e-6c444815d6d5 | per_provider
```

**Krytyczne pola:**

*   `signing_key_id`: Musi być ustawiony, inaczej `/jwks/` endpoint zwraca pusty JSON
*   `issuer_mode`: `per_provider` → każda app ma własny issuer URL
*   `authorization_flow`: `implicit-consent` → bez dodatkowego ekranu potwierdzenia

### **Scope Mappings (wymagane!)**

Każdy provider musi mieć przypisane 3 zakresy:

```
INSERT INTO authentik_core_provider_property_mappings (provider_id, propertymapping_id)
VALUES
  (4, '60c92d8e-4368-446a-9f2f-4e22c7024a55'),  -- openid
  (4, '8c0b16f7-3019-403e-9f9a-cab4cb686b9d'),  -- email
  (4, '0d40f976-fff6-4804-ab9c-b14d1f024630');  -- profile
```

**Błąd:** Brak scope mappings → HTTP 403 na `/application/o/xyz/userinfo/`

## **🛠️ Implementacja: qBittorrent (oauth2-proxy)**

### **A. Konfiguracja oauth2-proxy** (`/home/wojciech/projects/qbittorrent/oauth2-proxy.conf`)

```
http_address = "0.0.0.0:4180"
upstreams = ["http://qbittorrent:8080"]

provider = "oidc"
client_id = "PndttovAzq4k2YCriZgF6qmaVU"
client_secret = "pnaY8l/oQ9slPuylYDNeeKoRcDWXrvYDevxDVTID1KU"

oidc_issuer_url = "http://192.168.50.234:9000/application/o/qbittorrent/"
oidc_jwks_url = "http://192.168.50.234:9000/application/o/qbittorrent/jwks/"

redirect_url = "http://192.168.50.234:8181/oauth2/callback"
cookie_secret = "aEJucXhiZTNqZ2hhZTNqZ2hhZTNqZ2hhZQ=="

email_domains = ["*"]
scope = "openid email profile"
code_challenge_method = "S256"

skip_jwt_bearer_tokens = true
pass_authorization_header = true
pass_access_token = true
set_xauthrequest = true
```

**Ważne:**

*   `oidc_jwks_url`: Jawnie ustawione, bo oauth2-proxy 7.5.1 źle konstruuje URL z issuer
*   `code_challenge_method = "S256"`: PKCE zabezpieczenie
*   `pass_authorization_header = true`: Przekazuje token do qBittorrent

### **B. Konfiguracja qBittorrent** (`qBittorrent.conf`)

```
[Preferences]
WebUI\LocalHostAuth=false
WebUI\AuthSubnetWhitelistEnabled=true
WebUI\AuthSubnetWhitelist=172.16.0.0/12, 192.168.0.0/16, 127.0.0.1/32
WebUI\ReverseProxySupportEnabled=true
WebUI\TrustedReverseProxiesList=172.16.0.0/12, 192.168.0.0/16
WebUI\CSRFProtection=false
```

**Dlaczego to działa:**

*   qBittorrent widzi requesty z IP `172.x.x.x` (oauth2-proxy w Docker)
*   IP jest na whiteliście → bypass hasła
*   oauth2-proxy już wcześniej zweryfikował użytkownika przez Authentik

### **C. Docker Compose**

```
services:
  oauth2-proxy:
    image: quay.io/oauth2-proxy/oauth2-proxy:v7.5.1
    container_name: oauth2-proxy
    ports:
      - "8181:4180"
    volumes:
      - ./oauth2-proxy.conf:/etc/oauth2-proxy.cfg:ro
    command:
      - --config=/etc/oauth2-proxy.cfg
    networks:
      - cosmos-network

  qbittorrent:
    image: lscr.io/linuxserver/qbittorrent:latest
    container_name: qbittorrent
    ports:
      - "8080:8080"
    networks:
      - cosmos-network
```

## **🛠️ Implementacja: Immich (Native OAuth2)**

### **A. Utworzenie Providera (przez CLI)**

```
# Wejście do kontenera PostgreSQL
docker exec -it authentik-postgres psql -U authentik

# 1. Dodanie providera do authentik_core_provider
INSERT INTO authentik_core_provider (id, name, authorization_flow_id, property_mappings, property_mappings_group, backchannel_application_id)
VALUES (5, 'Immich', '4d51b223-c51a-475e-8112-8816a3b96588', '{}', '{}', NULL);

# 2. Konfiguracja OAuth2
INSERT INTO authentik_providers_oauth2_oauth2provider (
  provider_ptr_id, client_id, client_secret, _redirect_uris,
  signing_key_id, issuer_mode, 
  access_code_validity, access_token_validity, refresh_token_validity
) VALUES (
  5,
  '4c8e625f59f00178d6843e654a823825',
  'KjaDK86lmCHpB+NjmvXYFFa4i0W1yTVsjYIYogQwGVQ=',
  '[
    {"matching_mode": "strict", "url": "http://192.168.50.234:2283/auth/login"},
    {"matching_mode": "strict", "url": "https://immich.miasoftware.pl/auth/login"},
    {"matching_mode": "strict", "url": "app.immich:/"}
  ]',
  '82c74049-8f71-4c44-8d6e-6c444815d6d5',
  'per_provider',
  'minutes=1', 'minutes=10', 'days=30'
);

# 3. Utworzenie aplikacji
INSERT INTO authentik_core_application (slug, name, provider_id, policy_engine_mode, open_in_new_tab)
VALUES ('immich', 'Immich', 5, 'all', false);
```

### **B. Konfiguracja w Immich WebUI**

```
Settings → OAuth Authentication
☑ Enable
☑ Auto Register
☑ Auto Launch

Issuer URL:   http://192.168.50.234:9000/application/o/immich/
Client ID:    4c8e625f59f00178d6843e654a823825
Client Secret: KjaDK86lmCHpB+NjmvXYFFa4i0W1yTVsjYIYogQwGVQ=
Scope:        openid email profile
Button Text:  Login with Authentik
```

**Endpoint Discovery:**

*   `http://192.168.50.234:9000/application/o/immich/.well-known/openid-configuration`

## **⚠️ Najczęstsze Problemy**

| Problem | Przyczyna | Rozwiązanie |
| --- | --- | --- |
| **JWKS endpoint pusty** | `signing_key_id IS NULL` | `UPDATE authentik_providers_oauth2_oauth2provider SET signing_key_id='82c74049...'` |
| **HTTP 403 na /userinfo/** | Brak scope mappings | Dodaj openid, email, profile do `authentik_core_provider_property_mappings` |
| **Issuer mismatch w Immich** | `issuer_mode = 'global'` | Zmień na `'per_provider'` w bazie |
| **qBittorrent prosi o hasło** | Brak subnet whitelist | Dodaj `WebUI\AuthSubnetWhitelist` w `qBittorrent.conf` |
| **CSRF Failed w oauth2-proxy** | Flow: explicit-consent | Zmień na `implicit-consent` (4d51b223...) |
| **Redirect URI error** | Brak `matching_mode` w JSON | `{"matching_mode": "strict", "url": "..."}` |

## **📦 Backup i Przywracanie**

### **Lokalizacja:** `/home/wojciech/backups/authentik-sso-20260111-163321/`

**Zawartość:**

```
authentik_database.sql          2.7MB  # Pełny dump PostgreSQL
oauth2_providers.txt            4.0KB  # Tabela z credentials
qbittorrent-oauth2-proxy.conf   1.2KB
qbittorrent.conf                8.5KB
qbittorrent-docker-compose.yml  900B
README.md                       3.1KB  # Instrukcje przywracania
```

### **Przywracanie:**

```
# 1. Restore bazy danych
docker exec -i authentik-postgres psql -U authentik < authentik_database.sql

# 2. Restart Authentik
docker restart authentik-server authentik-worker

# 3. Przywróć pliki konfiguracyjne
cp qbittorrent-oauth2-proxy.conf /home/wojciech/projects/qbittorrent/
cp qbittorrent.conf /home/wojciech/projects/qbittorrent/config/qBittorrent/

# 4. Restart serwisów
docker-compose -f qbittorrent-docker-compose.yml restart
```

## **✅ Status Wdrożenia**

| Aplikacja | Metoda | Status | URL |
| --- | --- | --- | --- |
| **Mealie** | Native OAuth2 | ✅ Działa | http://192.168.50.234:9091 |
| **qBittorrent** | oauth2-proxy | ✅ Działa | http://192.168.50.234:8181 |
| **Immich** | Native OAuth2 | ✅ Działa | https://immich.miasoftware.pl |
| **Nextcloud** | OIDC | ⏳ TODO | https://nextcloud.miasoftware.pl:8443 |

---

_Ostatnia aktualizacja: 11.01.2026 r._