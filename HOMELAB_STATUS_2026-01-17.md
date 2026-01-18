# 🏠 HomeLab Status Report - 17 stycznia 2026

**Serwer:** Debian 12 (192.168.50.234)  
**Ostatni backup:** 15.01.2026 13:47 (45MB)  
**Status:** ✅ Operational & User Management Centralized  
**Dashboard:** https://dash.miasoftware.pl (cyberpunk design v11.3)

---

## 👥 ZARZĄDZANIE UŻYTKOWNIKAMI (REORGANIZACJA 17.01.2026)

Przeprowadzono pełną migrację i czyszczenie kont użytkowników we wszystkich usługach. Usunięto stare konta (`akadmin`, `admin`, `wojciech`), wprowadzając ustandaryzowany model oparty na Authentik SSO.

### 👤 Aktywne Konta
| Użytkownik | Rola | Password | Dostęp | Status |
|:-----------|:-----|:---------|:-------|:-------|
| **Wojtek** | SuperUser / Admin | `SdTwiYb53Kup...` | Full Access (All Apps) | ✅ Aktywny |
| **Iza** | Standard User | `SZlfr6SIDKF...` | App Access (No Admin) | ✅ Aktywny |

### 🛠️ Status Administracji w Aplikacjach
| Aplikacja | Wojtek Admin? | Iza Dostęp? | Metoda Autoryzacji |
|:----------|:-------------:|:-----------:|:-------------------|
| **Authentik** | ✅ TAK (Superuser) | ✅ TAK | Login Bezpośredni |
| **Immich** | ✅ TAK (Owner) | ✅ TAK | OIDC (Authentik) |
| **Mealie** | ✅ TAK (Admin) | ✅ TAK | OIDC (Group Sync: `authentik Admins`) |
| **SFTPGo** | ✅ TAK (Admin) | ✅ TAK | Local DB (Cleaned & Linked) |
| **n8n** | ✅ TAK (Full) | ❌ NIE | oauth2-proxy |
| **qBittorrent** | ✅ TAK (Full) | ❌ NIE | oauth2-proxy |
| **Dashboard** | ✅ TAK (Admin) | ✅ TAK | OAuth2 (Authentik) |
| **Cosmos Server** | ✅ TAK (Master) | ✅ TAK | Internal |

---

## 📊 AKTUALNY STAN SYSTEMU

### ✅ DZIAŁAJĄCE USŁUGI (10 aplikacji)

| Usługa | Port | URL | SSO | Status | Notatki |
|:-------|:-----|:----|:----|:-------|:--------|
| **Dashboard** | 3000 | https://dash.miasoftware.pl | ✅ Authentik | 🟢 ONLINE | Nowy Wojtek jest Adminem |
| **Authentik** | 9000 | http://192.168.50.234:9000 | ⚙️ Admin | 🟢 ONLINE | Skonfigurowane mapowanie grup OIDC |
| **n8n** | 5679 | http://192.168.50.234:5679 | ✅ oauth2-proxy | 🟢 ONLINE | Tylko Wojtek ma dostęp admina |
| **Immich** | 2283 | https://immich.miasoftware.pl | ✅ OAuth2 | 🟢 ONLINE | Konta zmigrowane do nowych UUID |
| **Mealie** | 9925 | http://192.168.50.234:9925 | ✅ OAuth2 | 🟢 ONLINE | Autoadmin; **Przepisy publiczne (Home)** |
| **qBittorrent** | 8181 | http://192.168.50.234:8181 | ✅ oauth2-proxy | 🟢 ONLINE | System wyczyszczony ze starych kont |
| **SFTPGo** | 8080 | http://192.168.50.234:8080 | ✅ Local/SSO | 🟢 ONLINE | Baza SQLite wyczyszczona |
| **Glances** | 61208 | http://192.168.50.234:61208 | ❌ | 🟢 ONLINE | Statystyki systemowe |
| **Cosmos Server** | 80/443 | http://192.168.50.234 | ⚙️ | 🟡 UNSTABLE | Wymaga weryfikacji manualnej Master Usera |

---

## 🔐 ZMIANY W AUTHENTIK (17.01.2026)

1.  **Scope Mapping:** Dodano mapowanie `Groups` do claimu OIDC.
    - Grupy przekazywane w tokenie: `authentik Admins`, `authentik Clients`.
2.  **Cleanup:** Usunięto konto `akadmin` oraz starego użytkownika `Wojtek` (stary e-mail).
3.  **Security:** Wszystkie aplikacje OIDC wymagają teraz przynależności do odpowiedniej grupy w Authentik.
4.  **Dostęp Publiczny (Wyjątek):** Mealie jest skonfigurowane w trybie publicznym dla grupy `Home` – przepisy są widoczne bez logowania.

---

## 🏗️ PRACE TECHNICZNE (LOG)

- **Immich:** Ręczna aktualizacja tabeli `"user"` w Postgres. Połączono nowe konta Authentik z profilami Immich via `oauthId`.
- **Mealie:** Weryfikacja DB i konfiguracja `OIDC_ADMIN_GROUP`. Wojtek automatycznie otrzymuje uprawnienia admina przy logowaniu.
- **SFTPGo:** Usunięcie starych kont adminów z `sftpgo.db` (SQLite). Zmiana `Wojciech` -> `Wojtek`.
- **Authentik:** Tworzenie użytkowników via `django-admin shell` w celu zapewnienia poprawnych flag superusera.

---

**Raport wygenerowany przez GitHub Copilot (Gemini 1.5 Flash)**
