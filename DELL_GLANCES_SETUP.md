# Instrukcja konfiguracji Glances na serwerze Dell

## Krok 1: Skopiuj docker-compose.dell.yml na Dell
Skopiuj plik `docker-compose.dell.yml` na serwer Dell (192.168.50.234)

## Krok 2: Zatrzymaj stary Glances
```bash
docker stop glances 2>/dev/null || true
docker rm glances 2>/dev/null || true
docker stop glances_dell 2>/dev/null || true
docker rm glances_dell 2>/dev/null || true
```

## Krok 3: Uruchom nowy Glances z docker-compose
```bash
docker compose -f docker-compose.dell.yml up -d
```

**LUB** użyj bezpośredniej komendy docker run:

```bash
docker run -d \
  --name glances_dell \
  --restart always \
  -p 61208:61208 \
  -e GLANCES_OPT=-w \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /:/hostfs:ro \
  -v /mnt:/mnt:ro \
  --pid host \
  --privileged \
  nicolargo/glances:latest
```

## Krok 4: Sprawdź czy działa
```bash
curl -s http://localhost:61208/api/4/fs | python3 -m json.tool | head -50
```

Powinieneś zobaczyć:
- /dev/nvme0n1p1 (system ~233GB)
- /dev/sdb* (1TB)
- /dev/sdc* (2TB)
- /dev/sdd* (2TB)
