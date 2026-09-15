export interface ServiceRegistryEntry {
  name: string;
  url: string;
}

export const serviceRegistry: ServiceRegistryEntry[] = [
  {
    name: "HomeApp",
    url: "https://homeapp.miasoftware.pl",
  },
  {
    name: "Immich",
    url: "https://immich.miasoftware.pl",
  },
  {
    name: "Nextcloud",
    url: "https://drive.miasoftware.pl/status.php",
  },
  {
    name: "BeerTaste",
    url: "https://beertaste.miasoftware.pl",
  },
  {
    name: "Mail",
    url: "https://mail.miasoftware.pl/admin",
  },
];
