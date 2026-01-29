# Security Setup - CrowdSec & Fail2Ban

## Instalacja na Lenovo

### 1. Utwórz katalogi konfiguracyjne

```bash
cd ~/projects/dashboard
mkdir -p crowdsec/{config,data}
mkdir -p fail2ban/data/{jail.d,filter.d,action.d}
```

### 2. Uruchom kontenery zabezpieczeń

```bash
docker compose -f docker-compose.security.yml up -d
```

### 3. Konfiguracja CrowdSec

Zarejestruj CrowdSec w konsoli (opcjonalnie):

```bash
docker exec crowdsec cscli console enroll <YOUR_ENROLL_KEY>
```

Dodaj parsery i scenariusze:

```bash
# Sprawdź dostępne kolekcje
docker exec crowdsec cscli collections list

# Zainstaluj dodatkowe kolekcje
docker exec crowdsec cscli collections install crowdsecurity/nginx
docker exec crowdsec cscli collections install crowdsecurity/sshd
```

### 4. Weryfikacja

Sprawdź status CrowdSec:

```bash
docker exec crowdsec cscli metrics
docker exec crowdsec cscli alerts list
docker exec crowdsec cscli decisions list
```

Sprawdź status Fail2Ban:

```bash
docker exec fail2ban fail2ban-client status
docker exec fail2ban fail2ban-client status sshd
```

### 5. Testowanie

Test Fail2Ban (z innego hosta):

```bash
# Spróbuj 6 razy niepoprawnie zalogować się przez SSH
ssh wrong_user@192.168.50.66
```

Sprawdź bany:

```bash
docker exec fail2ban fail2ban-client status sshd
```

Test CrowdSec:

```bash
# Symuluj skan portów
nmap -p- 192.168.50.66
```

Sprawdź alerty:

```bash
docker exec crowdsec cscli alerts list
```

## Konfiguracja API Dashboard

API jest już skonfigurowane w:
- `/api/crowdsec` - metryki CrowdSec
- `/api/fail2ban` - metryki Fail2Ban

Dashboard automatycznie pobierze dane po uruchomieniu kontenerów.

## Dostęp do logów

CrowdSec logs:
```bash
docker logs crowdsec -f
```

Fail2Ban logs:
```bash
docker logs fail2ban -f
```

## Unban IP

CrowdSec:
```bash
docker exec crowdsec cscli decisions delete --ip 1.2.3.4
```

Fail2Ban:
```bash
docker exec fail2ban fail2ban-client set sshd unbanip 1.2.3.4
```

## Ważne uwagi

- CrowdSec monitoruje logi w `/var/log` - upewnij się że masz logi SSH i webserver
- Fail2Ban działa w trybie `network_mode: host` aby mógł modyfikować iptables
- Oba systemy współpracują - CrowdSec wykrywa zagrożenia, Fail2Ban banuje IP
- Dashboard będzie pokazywał rzeczywiste dane gdy systemy wykryją zagrożenia

## Ports

- CrowdSec API: 8080 (dla lokalnego API)
- Fail2Ban: brak portów (tylko iptables)
