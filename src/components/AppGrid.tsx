import { ExternalLink } from 'lucide-react';

interface App {
  name: string;
  url: string;
  icon: string;
  description: string;
  status?: 'online' | 'offline';
}

const apps: App[] = [
  { name: 'Immich', url: 'https://immich.miasoftware.pl', icon: '📸', description: 'Photo & Video Management' },
  { name: 'Mealie', url: 'http://192.168.50.234:9091', icon: '🍳', description: 'Recipe Manager' },
  { name: 'qBittorrent', url: 'http://192.168.50.234:8181', icon: '📥', description: 'Torrent Client' },
  { name: 'Nextcloud', url: 'https://nextcloud.miasoftware.pl:8443', icon: '☁️', description: 'Cloud Storage' },
  { name: 'Beszel', url: 'http://192.168.50.234:8090', icon: '📊', description: 'System Monitor' },
  { name: 'Changedetection', url: 'http://192.168.50.234:5000', icon: '🔍', description: 'Website Monitoring' },
  { name: 'BookWyrm', url: 'http://192.168.50.234:8085', icon: '📚', description: 'Book Tracker' },
  { name: 'Authentik', url: 'http://192.168.50.234:9000', icon: '🔐', description: 'SSO Provider' },
];

export default function AppGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {apps.map((app) => (
        <a
          key={app.name}
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-blue-500/50 hover:bg-zinc-900/60 transition-all duration-200 hover:scale-105"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="text-5xl mb-2">{app.icon}</div>
            <h3 className="text-lg font-bold text-white">{app.name}</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{app.description}</p>
            <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-zinc-600 group-hover:text-blue-500 transition-colors" />
          </div>
        </a>
      ))}
    </div>
  );
}
