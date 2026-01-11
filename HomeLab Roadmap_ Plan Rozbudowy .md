# **🗺️ HomeLab Roadmap: Plan Rozbudowy (Future Stack)**

Wersja: FINAL v2.6 (Anycubic Kobra 3 Integration)  
Cel: Kompletny, niezależny ekosystem cyfrowy (Ultimate Self-Hosted Environment).

## **📸 1\. Centrum Multimedialne (Priorytet Wysoki)**

Zastępstwo dla Google Photos i Netflixa.

- [x] ### ~~**🔹 Immich (ZROBIONE)**

* **~~Rola:~~** ~~Zarządzanie zdjęciami i wideo z AI.~~  
* **~~Dlaczego:~~** ~~Backup z telefonu w tle \+ podgląd z kamer CCTV/Sony przez "External Libraries".~~  
* **~~Status:~~** ~~Pliki konfiguracyjne gotowe, czeka na wdrożenie.~~


## **🛡️ 2\. Higiena Sieci i Bezpieczeństwo**

Ochrona urządzeń domowych.

- [x] ### **🔹 Authentik SSO (ZROBIONE)**

* **Rola:** Single Sign-On (OAuth2/OIDC Provider).
* **Wersja:** 2024.12.3 na PostgreSQL 16.
* **Status:** ✅ Działające integracje:
  * **Mealie** - Native OAuth2
  * **qBittorrent** - oauth2-proxy (reverse proxy dla legacy apps)
  * **Immich** - Native OAuth2
* **Dlaczego:** Jedno hasło do wszystkich aplikacji HomeLab. Bezpieczeństwo + wygoda.
* **Backup:** Pełny system backupu w `/home/wojciech/backups/authentik-sso-20260111-163321/`
* **Dokumentacja:** Zobacz Blueprint v11.3 → Sekcja 11 (szczegóły techniczne).

### **🔹 AdGuard Home**

* **Rola:** DNS Sinkhole (Bloker reklam).  
* **Dlaczego:** Czysty internet na TV, telefonach i tabletach.

## **👨‍💻 3\. DevOps & Monitoring**

Narzędzia dla Fullstack Developera.

### **🔹 Uptime Kuma**

* **Rola:** Monitoring usług (Czy działa?).  
* **Dlaczego:** Powiadomienia na telefon, gdy coś przestanie działać (np. "Immich is DOWN").

- [x] ### **🔹 Beszel (ZROBIONE)**

* **Rola:** Monitoring zasobów (Jak działa?).  
* **Dlaczego:** Bardzo lekki system agentowy. W przeciwieństwie do Glances, Beszel ma piękny centralny dashboard z **historią wykresów**. Widzisz, że o 3:00 w nocy CPU skoczyło do 100%.  
* **Status:** ✅ Skonfigurowany i połączony (Agent + Hub) 

### **🔹 Gitea / Forgejo**

* **Rola:** Prywatny GitHub.  
* **Dlaczego:** Bezpieczne przechowywanie kodu i konfiguracji serwera.

### **🔹 Dockge**

* **Rola:** Zarządzanie Dockerem (GUI).  
* **Dlaczego:** Zarządza plikami compose.yaml (Infrastructure as Code).

## **🏠 4\. Smart Home**

Mózg domu.

### **🔹 Home Assistant**

* **Rola:** Automatyka domowa.  
* **Dlaczego:** Integracja kamer, świateł i powiadomień.  
* **Hub dla Drukarki:** Home Assistant będzie pełnił rolę "tłumacza" między zamkniętą chmurą Anycubic a Twoim dashboardem.

## **🍳 5\. Kuchnia i Styl Życia**

Ułatwienia codziennego życia.

- [x] ### **🔹 Mealie (ZROBIONE)**

* **Rola:** Przepisy i planowanie posiłków.  
* **Status:** ✅ Działa z SSO (Authentik OAuth2).
* **Dlaczego:** Import przepisów z blogów bez reklam \+ lista zakupów.

## **🌍 6\. Podróże i Hobby**

Narzędzia podróżnika.

### **🔹 Wanderer (NOWOŚĆ)**

* **Rola:** Baza szlaków i tras (Trail Database).  
* **Dlaczego:** Jeśli TravelMap to "Blog z podróży", to Wanderer jest Twoim "Atlasem Szlaków". Idealny do trzymania plików GPX z wycieczek rowerowych/pieszych, ze zdjęciami przypisanymi do konkretnych punktów na mapie.

### **🔹 TravelMap**

* **Rola:** Blog i mapa świata.  
* **Dlaczego:** Wizualizacja ogólna ("Tu byliśmy"). Możesz używać obu (Wanderer do szczegółów tras, TravelMap do ogólnej prezentacji).

- [x] ### **🔹 Changedetection.io (ZROBIONE)**

* **Rola:** Śledzenie cen (hotele/loty).
* **Status:** ✅ Działa na porcie 5000 (z obsługą Playwright).
* **Dlaczego:** Powiadomienia o spadku cen.

## **📚 7\. Wiedza i Edukacja**

Biblioteka cyfrowa.

- [x] ### **🔹 BookWyrm (ZROBIONE - W TRAKCIE KONFIGURACJI)**

* **Rola:** Śledzenie przeczytanych książek (bez reklam Amazona).
* **Status:** ✅ Postawiony (Port 8085). Czeka na konfigurację w Cosmos.

### **🔹 Audiobookshelf**

* **Rola:** Serwer audiobooków i ebooków.

## **⚡ 8\. Automatyzacja**

Klej systemowy.

### **🔹 n8n**

* **Rola:** Workflow automation.  
* **Dlaczego:** Łączy wszystkie powyższe aplikacje w działający organizm.

## **🏴‍☠️ 9\. Pobieranie (The \*Arr Stack)**

Automatyzacja multimediów.

- [x] ### **🔹 qBittorrent (ZROBIONE)**

* **Rola:** Bezpieczne pobieranie.
* **Status:** ✅ Działa na porcie 8181 z SSO (oauth2-proxy + Authentik).
* **Folder:** /mnt/photos/Torrenty
* **TODO:** VPN (Gluetun) do dodania później.

### **🔹 Sonarr / Radarr / Prowlarr**

* **Rola:** Automatyczne wyszukiwanie i katalogowanie filmów/seriali.

## **📄 10\. Cyfrowe Biuro**

Koniec z papierologią.

### **🔹 Paperless-ngx**

* **Rola:** Archiwum dokumentów z OCR.  
* **Dlaczego:** Znajdowanie dowolnego dokumentu w 3 sekundy (wyszukiwanie po treści).

## **💰 11\. Finanse**

Budżet domowy.

### **🔹 Actual Budget**

* **Rola:** Budżetowanie kopertowe (lokalnie).  
* **Dlaczego:** Szybka, prywatna alternatywa dla YNAB.

## **🤖 12\. Lokalne AI**

Prywatny asystent.

### **🔹 Ollama \+ Open WebUI**

* **Rola:** Lokalne LLM (ChatGPT na własnym sprzęcie).  
* **Dlaczego:** Prywatność danych i pomoc w kodowaniu.

### **🔹 Stirling-PDF**

* **Rola:** Edycja PDFów (łączenie, dzielenie, hasła).

## **🔐 13\. Bezpieczeństwo Osobiste**

Zarządzanie tożsamością.

### **🔹 Vaultwarden (Opcjonalnie)**

* **Rola:** Menadżer haseł (kompatybilny z Bitwarden).  
* **Decyzja:** Jeśli chcesz mieć funkcje Premium (TOTP, Klucze sprzętowe) za darmo i pełną kontrolę danych. Jeśli wolisz wygodę chmury \- zostań przy oficjalnym Bitwarden.

## **🖨️ 15\. Druk 3D (Anycubic Kobra 3 Combo)**

Twoja wymarzona drukarka (Multicolor).

### **🔹 Home Assistant (Integracja HACS)**

* **Rola:** Most między Anycubic Cloud a HomeLabem.  
* **Jak to działa:** Społeczność stworzyła wtyczkę do Home Assistant, która pobiera dane z drukarki.  
  * *Widzisz:* Temperaturę, % postępu, szacowany czas, status (drukuje/stop).  
  * *Sterujesz:* Pauza/Stop w razie awarii.  
  * *Nie masz:* Dostępu do plików systemowych (Klippera), ale do drukowania figurek tego nie potrzebujesz.

### **🔹 OrcaSlicer**

* **Rola:** Slicer na Desktop.  
* **Dlaczego:** Najlepsze oprogramowanie do cięcia modeli. Obsługuje Kobrę 3 i systemy wielokolorowe lepiej niż soft producenta.

## **🖥️ 14\. Custom Dashboard (Next.js)**

Twoje autorskie centrum sterowania (zgodne z Blueprint v11.3).

- [x] ### **🔹 Miasoftware SSO Portal (ZROBIONE)**

* **Rola:** Strona startowa z SSO + agregator aplikacji.
* **Tech Stack:** Next.js 16, NextAuth.js 4, Tremor, Tailwind CSS.
* **Status:** ✅ Działa na porcie 3000
  * SSO Login przez Authentik (OAuth2)
  * App Grid: 8 kafelków aplikacji
  * User session management (JWT)
  * Middleware protection
* **Integracja:** 
  * Authentik OAuth2 Provider (ID: 6)
  * NextAuth.js z OIDC discovery
  * Docker Compose development
* **TODO:** 
  * Naprawić API `/api/stats` (Glances)
  * Naprawić API `/api/containers` (Docker)
  * Real-time metrics chart
* **Dlaczego:** Jedno miejsce do zarządzania całym HomeLab - po zalogowaniu SSO przechodzisz między aplikacjami bez powtórnego logowania.

## **📝 Podsumowanie Kolejności Wdrożeń**

1. ~~**Immich** (Backup zdjęć \- ZROBIONE ✅)~~.  
2. ~~**Authentik SSO** (Centralne logowanie - ZROBIONE ✅)~~.
3. ~~**Mealie** (Kuchnia - ZROBIONE ✅)~~.
4. ~~**Beszel** (Monitoring - ZROBIONE ✅)~~.
5. ~~**qBittorrent** (Pobieranie - ZROBIONE ✅)~~.
6. ~~**SSO Portal Dashboard** (Next.js - ZROBIONE ✅)~~.
7. **Paperless-ngx** (Biuro).
8. **AdGuard Home** (Sieć).  
9. **Home Assistant \+ Integracja Anycubic** (Jak tylko przyjdzie drukarka).  
10. **Wanderer** (Przed sezonem wycieczkowym).  
11. **Reszta** (wg potrzeb).

---

**Ostatnia aktualizacja:** 11.01.2026  
**Wersja Roadmapy:** v2.8 (SSO Portal Complete)