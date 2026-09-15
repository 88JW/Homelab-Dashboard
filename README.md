# Homelab Dashboard

Dashboard Next.js do obserwowania klastra K3s i usług homelabu.

## Funkcje

Mapa klastra pokazuje aplikacje, ich komponenty oraz zależności SSO.

## Architektura

Lenovo jest control plane K3s i obsługuje wejście ruchu oraz aplikacje brzegowe. LinuxServer jest workerem dla usług danych i mediów. Traefik kieruje ruch do usług, a SSO chroni wybrane aplikacje.

## Uruchomienie lokalne

Uruchom npm install, a następnie npm run dev. Dla lokalnego endpointu logowania utwórz nieśledzony plik .env.local z własną wartością MASTER_PASSWORD.

## Bezpieczeństwo

Panel produkcyjny jest chroniony przez Traefik i SSO. MASTER_PASSWORD jest dostarczane wyłącznie przez sekret środowiskowy. Artefakty obrazów .tar i pliki .env są ignorowane przez Git.
