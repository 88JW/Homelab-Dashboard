export interface ServiceRegistryEntry {
  name: string;
  url: string;
}

export const serviceRegistry: ServiceRegistryEntry[] = [
  {
    name: "Home",
    url: "https://home.miasoftware.pl",
  },
  {
    name: "Immich",
    url: "https://immich.miasoftware.pl",
  },
  {
    name: "BeerTaste",
    url: "https://beertaste.miasoftware.pl",
  },
  {
    name: "Mealie",
    url: "https://mealie.miasoftware.pl",
  },
  {
    name: "qBittorrent",
    url: "http://192.168.50.234:8080",
  },
  {
    name: "SFTPGo",
    url: "https://files.miasoftware.pl",
  },
  {
    name: "Glances Dell",
    url: "http://192.168.50.234:61208",
  },
  {
    name: "Glances Lenovo",
    url: "http://192.168.50.66:61209",
  },
  {
    name: "Portainer",
    url: "https://portainer.miasoftware.pl",
  },
  {
    name: "Dashboard",
    url: "https://panel.miasoftware.pl",
  },
  {
    name: "Supabase",
    url: "http://192.168.50.234:3100",
  },
  {
    name: "Docmost",
    url: "https://dokumentacja.miasoftware.pl",
  },
  {
    name: "Paperless",
    url: "https://paperless.miasoftware.pl",
  },
  {
    name: "Firefly III",
    url: "https://firefly.miasoftware.pl",
  },
  {
    name: "Finanse PWA",
    url: "https://finanse.miasoftware.pl",
  },
  {
    name: "Mail",
    url: "https://mail.miasoftware.pl/admin",
  },
];
