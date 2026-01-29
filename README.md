# Dashboard Homelab

System monitoringu i zarządzania serwerami domowymi (Dell i Lenovo).

## 🚀 Funkcje

- **Monitorowanie zasobów**: CPU, RAM, dyski, sieć dla obu serwerów
- **Docker Orbit**: Status kontenerów Docker w czasie rzeczywistym
- **Security Prison**: Monitoring Fail2Ban i CrowdSec
- **Services Launchpad**: Szybki dostęp do wszystkich usług
- **Storage Health**: Stan dysków na Dell i Lenovo
- **Swap Monitor**: Wykorzystanie pamięci swap
- **Beszel Metrics**: Dodatkowe metryki systemowe

## 🏗️ Architektura

### Serwery
- **Dell** (192.168.50.234): 233GB NVMe + 1TB + 2x2TB
- **Lenovo** (192.168.50.66): 467GB NVMe

### Stack Technologiczny
- Next.js 16.1.1 (App Router)
- Glances API dla metryk systemowych
- Docker Compose dla orkiestracji
- TailwindCSS + shadcn/ui

## 🔐 Autoryzacja

Dashboard wykorzystuje tradycyjne logowanie hasłem:
- Cookie: `cosmos_session`
- Wygaśnięcie: 7 dni
- Hasło: w zmiennej `MASTER_PASSWORD` w [route.ts](src/app/api/auth/route.ts)

## 📦 Instalacja i uruchomienie

### Uruchomienie na Lenovo (192.168.50.66)

```bash
cd ~/projects/dashboard
docker compose up -d
```

Dashboard dostępny pod: http://192.168.50.66:3001

### Konfiguracja Glances na Dell

Na serwerze Dell (192.168.50.234) uruchom:

```bash
docker stop $(docker ps -a | grep glances | awk '{print $1}') 2>/dev/null
docker rm $(docker ps -a | grep glances | awk '{print $1}') 2>/dev/null

docker run -d \
  --name glances_dell \
  --restart always \
  -p 61208:61208 \
  -e GLANCES_OPT="-w" \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /:/hostfs:ro \
  -v /mnt:/mnt:ro \
  --pid host \
  --privileged \
  nicolargo/glances:latest
```

**Ważne**: Montowanie `/:/hostfs:ro` jest wymagane, aby Glances widział wszystkie dyski hosta.

## 🌐 Usługi

| Usługa | Port | URL |
|--------|------|-----|
| Dashboard | 3001 | http://192.168.50.66:3001 |
| Glances Dell | 61208 | http://192.168.50.234:61208 |
| Glances Lenovo | 61209 | http://192.168.50.66:61209 |
| Immich | 2283 | http://192.168.50.234:2283 |
| Mealie | 9925 | http://192.168.50.234:9925 |
| qBittorrent | 8080 | http://192.168.50.66:8080 |
| Portainer | 9443 | https://192.168.50.234:9443 |

## 🔧 Konfiguracja

### API Endpoints

- **Dell Stats**: `/api/stats` → http://192.168.50.234:61208
- **Lenovo Stats**: `/api/lenovo-stats` → http://glances:61208 (Docker network)

### Docker Network

Dashboard i Glances Lenovo działają w sieci `proxy-public`.

### Pliki konfiguracyjne

- [docker-compose.yml](docker-compose.yml) - Glances Lenovo + Dashboard
- [docker-compose.dell.yml](docker-compose.dell.yml) - Template dla Dell Glances
- [DELL_GLANCES_SETUP.md](DELL_GLANCES_SETUP.md) - Szczegółowe instrukcje dla Dell

## 🛠️ Development

```bash
# Lokalny development
npm install
npm run dev

# Rebuild po zmianach w API
rm -rf .next
docker compose build --no-cache dashboard
docker compose up -d
```

## 📊 Monitoring

Dashboard pobiera dane co 30 sekund:
- Metryki systemowe przez Glances API
- Status kontenerów Docker
- Bezpieczeństwo (Fail2Ban, CrowdSec)
- Sieć i swap

## 🐛 Troubleshooting

### Glances nie pokazuje dysków

Sprawdź czy Glances ma zmontowany główny system plików:

```bash
docker exec glances_dell ls /hostfs
```

Jeśli błąd, zrestartuj Glances z `-v /:/hostfs:ro`.

### API timeout na Lenovo

Dashboard używa nazwy Docker service (`glances`) zamiast IP - oba kontenery muszą być w tej samej sieci.

### Brak danych na Dell

Sprawdź czy Glances działa:

```bash
curl http://192.168.50.234:61208/api/4/all
```

## 📝 Changelog

- **2026-01**: Migracja z Authentik OAuth na tradycyjne logowanie hasłem
- **2026-01**: Dodanie monitoringu dla Lenovo
- **2026-01**: Naprawa widoczności dysków przez montowanie `/hostfs`
- **2026-01**: Optymalizacja API - użycie Docker network zamiast external IP