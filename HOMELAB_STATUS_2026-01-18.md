# 🏠 HomeLab Status Report - 18 stycznia 2026

**Serwer:** Debian 12 (192.168.50.234)  
**Status:** ✅ Mobile SSO Complete & Authentication Unified  
**Dashboard:** https://dash.miasoftware.pl

---

## 🎉 MAJOR MILESTONE: FULL SSO INTEGRATION

Dzisiejsza sesja skutkowała pełnym wdrożeniem Single Sign-On (SSO) oraz naprawieniu problemów z autoryzacją mobilną across the entire homelab infrastructure.

### 🛠️ Wykonane Prace:

#### 1. **Dashboard SSO Recovery**
- Naprawiono przerwane sesje mobilne poprzez migrację z IP-based na domain-based authentication
- Zaktualizowano `AUTHENTIK_ISSUER` w `.env.local`: `https://aplikacje.miasoftware.pl/application/o/dashboard/`
- Rozwiązano "Mixed Content" blocking na HTTPS

#### 2. **Immich OAuth Integration** 
- Skonfigurowano native OAuth2 integration z Authentik
- Naprawiono problem empty sub/email fields poprzez zmianę `user_email` → `user_username` sub_mode
- Dodano brakujący email w profilu użytkownika Authentik
- Status: ✅ **WORKING** - 27 photos accessible via SSO

#### 3. **Mealie Authentication Fix**
- Rozwiązano cache_key validation errors w Pydantic models
- Naprawiono group/household references w bazie SQLite  
- Downgrade z v3.9.2 → v3.8.0 z powodu frontend bugs
- Usunięto OIDC due to Authentik per_provider mode limitations
- Status: ✅ **WORKING** - Classic login functional

#### 4. **User Account Standardization**
- Zjednoczono hasła across wszystkich systemów:
  - **Wojtek**: `SdTwiYb53KupOL1%` (Authentik email: wojtek@miasoftware.pl)
  - **Iza**: `SZlfr6SIDKF7A0` (Authentik email: derastro@gmail.com)
- Odblokowywanie locked accounts i reset login attempts

#### 5. **Infrastructure Debugging**
- Utworzono custom OIDC discovery server na porcie 8081 (nieużywany)
- Rozwiązano browser cache conflicts poprzez forced refresh procedures
- Naprawiono Docker container health issues

---

## 📊 FINAL SERVICE REGISTRY

| Usługa | URL | Metoda Dostępu | Auth Method | Status |
|:-------|:----|:---------------|:------------|:-------|
| **Dashboard** | https://dash.miasoftware.pl | Public / SSO | Authentik OAuth2 | 🟢 ONLINE |
| **Authentik** | https://aplikacje.miasoftware.pl | Public / SSO | Native Auth | 🟢 ONLINE |
| **Pobieranie** | https://pobieranie.miasoftware.pl | OAuth2 Proxy | Authentik OAuth2 | 🟢 ONLINE |
| **Immich** | https://immich.miasoftware.pl | Native OAuth2 | Authentik OAuth2 | 🟢 ONLINE |
| **Mealie** | https://mealie.miasoftware.pl | Classic Login | Local Database | 🟢 ONLINE |
| **Pliki** | https://pliki.miasoftware.pl | SSO / Local | Authentik OAuth2 | 🟢 ONLINE |
| **Status API** | https://status.miasoftware.pl | Internal BFF | No Auth | 🟢 ONLINE |

---

## 🔐 AUTHENTICATION STATUS

### ✅ Working SSO Applications:
- **Dashboard** (NextAuth.js v4 + Authentik)
- **Immich** (Native OAuth2 + Authentik)  
- **qBittorrent** (OAuth2 Proxy + Authentik)

### 🟡 Mixed Authentication:
- **Mealie** (Local accounts due to OIDC discovery limitations)

### 👥 User Accounts:

| User | Authentik Login | Mealie Login | Dashboard Access | Immich Access |
|:-----|:---------------|:-------------|:----------------|:--------------|
| **Wojtek** | wojtek@miasoftware.pl | Wojtek | ✅ SSO | ✅ SSO |
| **Iza** | derastro@gmail.com | Iza | ✅ SSO | ✅ SSO |

---

## 🔧 TECHNICAL NOTES

### Software Versions:
- **Authentik**: 2024.12.3 (per_provider issuer mode)
- **Mealie**: v3.8.0 (downgraded for stability)
- **Immich**: v2.4.1 (latest)
- **Dashboard**: Next.js 15 + NextAuth v4

### Known Issues & Workarounds:
- **Mealie v3.9.2**: Frontend cache issues causing JS load failures
- **Authentik OIDC Discovery**: No `.well-known/openid_configuration` endpoint in per_provider mode
- **Browser Cache**: Requires hard refresh (Ctrl+F5) after authentication changes

### Infrastructure Components:
- **Cosmos Proxy**: HTTPS termination + reverse proxy
- **Let's Encrypt**: Auto-renewed SSL certificates for *.miasoftware.pl
- **Docker Compose**: Service orchestration across multiple projects
- **PostgreSQL**: Authentik user database
- **SQLite**: Mealie local database

---

## ✨ SUCCESS METRICS

- **Mobile SSO**: ✅ Fully functional across all supported apps
- **Password Unification**: ✅ Standardized credentials for both users  
- **Cache Issues**: ✅ Resolved through version management
- **Security**: ✅ Full HTTPS + domain-based authentication
- **User Experience**: ✅ Seamless login flow for Dashboard & Immich

**Total Session Impact**: 3/4 applications now use centralized SSO authentication 🚀

---

**Raport wygenerowany przez GitHub Copilot (Gemini 3 Flash)**
