# 🏠 HomeLab Status Report - 18 stycznia 2026

**Serwer:** Debian 12 (192.168.50.234)  
**Status:** 📱 Mobile Access Optimized & SSL Unified  
**Dashboard:** https://dash.miasoftware.pl

---

## 🚀 GŁÓWNA AKTUALIZACJA: MOBILNOŚĆ I SSL

Dzisiejsza sesja skupiła się na wyeliminowaniu zależności od wewnętrznych adresów IP w warstwie interfejsu użytkownika, co pozwoliło na pełną obsługę systemu z urządzeń mobilnych.

### 🛠️ Wykonane Prace:
1.  **Migracja Linków Dashboardu:**
    - Wszystkie kafelki w sekcji "Launchpad" zostały przepięte z `http://192.168.50.234:PORT` na subdomeny `https://*.miasoftware.pl`.
    - Rozwiązano problem "Mixed Content" (blokowanie niezabezpieczonych linków HTTP na stronie HTTPS).
2.  **Korekta Authentik SSO:**
    - Zaktualizowano `AUTHENTIK_ISSUER` w `.env.local` na adres domenowy.
    - Naprawiono proces logowania na telefonach, który wcześniej zrywał sesję przy próbie połączenia z lokalnym IP.
3.  **Aktualizacja Redirect URIs:**
    - Procedury automatycznego setupu (np. dla qBittorrent) używają teraz poprawnych adresów zwrotnych w domenie `miasoftware.pl`.

---

## 📊 REJESTR USŁUG (PO AKTUALIZACJI)

| Usługa | URL | Metoda Dostępu | Status |
|:-------|:----|:---------------|:-------|
| **Dashboard** | https://dash.miasoftware.pl | Public / SSO | 🟢 ONLINE |
| **Authentik** | https://aplikacje.miasoftware.pl | Public / SSO | 🟢 ONLINE |
| **Pobieranie** | https://pobieranie.miasoftware.pl | OAuth2 Proxy | 🟢 ONLINE |
| **Przepisy** | https://przepisy.miasoftware.pl | OAuth2 Proxy | 🟢 ONLINE |
| **Zdjęcia** | https://immich.miasoftware.pl | Native OAuth2 | 🟢 ONLINE |
| **Pliki** | https://pliki.miasoftware.pl | SSO / Local | 🟢 ONLINE |
| **Status API** | https://status.miasoftware.pl | Internal BFF | 🟢 ONLINE |
| **n8n** | https://n8n.miasoftware.pl | OAuth2 Proxy | 🟡 PENDING (Cosmos) |

---

## 🔐 BEZPIECZEŃSTWO

- **SSL Everywhere:** Cały ruch użytkownika odbywa się teraz wyłącznie przez port 443 z certyfikatami Let's Encrypt.
- **BFF Isolation:** Dashboard nadal komunikuje się z Glances i Dockerem po sieci wewnętrznej `cosmos-network`, nie wystawiając portów API na świat.

---

**Raport wygenerowany przez GitHub Copilot (Gemini 3 Flash)**
