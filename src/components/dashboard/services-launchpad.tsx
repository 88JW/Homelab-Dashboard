"use client"

import { useEffect, useState } from "react"
import { Camera, Utensils, Download, HardDrive, Activity, ExternalLink, Beer, Database, FileText, Container, LayoutDashboard, Mail, Home, ReceiptText, FolderArchive } from "lucide-react"
import useSWR from "swr"

const services = [
  {
    name: "Home",
    description: "Main Page",
    icon: Home,
    status: "online",
    color: "from-sky-500 to-blue-500",
    url: "https://home.miasoftware.pl",
  },
  {
    name: "Immich",
    description: "Photos",
    icon: Camera,
    status: "online",
    color: "from-purple-500 to-pink-500",
    url: "https://immich.miasoftware.pl",
    androidPackage: "app.alextran.immich",
  },
  {
    name: "BeerTaste",
    description: "Beer Rating",
    icon: Beer,
    status: "online",
    color: "from-yellow-500 to-amber-600",
    url: "https://beertaste.miasoftware.pl",
  },
  {
    name: "Mealie",
    description: "Recipes",
    icon: Utensils,
    status: "online",
    color: "from-emerald-500 to-teal-500",
    url: "https://mealie.miasoftware.pl",
    androidPackage: "com.pabloromeo.mealie",
  },
  {
    name: "qBittorrent",
    description: "Torrents",
    icon: Download,
    status: "online",
    color: "from-blue-500 to-cyan-500",
    url: "http://192.168.50.234:8080",
    androidPackage: "me.fengmilo.qbitorrent",
  },
  {
    name: "SFTPGo",
    description: "Files",
    icon: HardDrive,
    status: "online",
    color: "from-amber-500 to-orange-500",
    url: "https://files.miasoftware.pl",
  },
  {
    name: "Glances Dell",
    description: "Dell Metrics",
    icon: Activity,
    status: "online",
    color: "from-indigo-500 to-purple-500",
    url: "http://192.168.50.234:61208",
  },
  {
    name: "Glances Lenovo",
    description: "Lenovo Metrics",
    icon: Activity,
    status: "online",
    color: "from-violet-500 to-indigo-500",
    url: "http://192.168.50.66:61209",
  },
  {
    name: "Portainer",
    description: "Container Management",
    icon: Container,
    status: "online",
    color: "from-cyan-500 to-blue-600",
    url: "https://portainer.miasoftware.pl",
  },
  {
    name: "Dashboard",
    description: "Control Center",
    icon: LayoutDashboard,
    status: "online",
    color: "from-slate-500 to-gray-600",
    url: "https://panel.miasoftware.pl",
  },
  {
    name: "Supabase",
    description: "Database",
    icon: Database,
    status: "online", 
    color: "from-emerald-600 to-green-500",
    url: "http://192.168.50.234:3100",
  },
  {
    name: "Docmost",
    description: "Collaborative Docs",
    icon: FileText,
    status: "online",
    color: "from-blue-600 to-indigo-600",
    url: "https://dokumentacja.miasoftware.pl",
  },
  {
    name: "Paperless",
    description: "Document Archive",
    icon: FolderArchive,
    status: "online",
    color: "from-emerald-500 to-lime-600",
    url: "https://paperless.miasoftware.pl",
  },
  {
    name: "Firefly III",
    description: "Home Finance",
    icon: ReceiptText,
    status: "online",
    color: "from-orange-500 to-amber-600",
    url: "https://firefly.miasoftware.pl",
  },
  {
    name: "Finanse PWA",
    description: "Mobile Expense App",
    icon: ReceiptText,
    status: "online",
    color: "from-emerald-600 to-green-500",
    url: "https://finanse.miasoftware.pl",
  },
  {
    name: "Mail",
    description: "Email Admin",
    icon: Mail,
    status: "online",
    color: "from-red-500 to-pink-600",
    url: "https://mail.miasoftware.pl/admin",
  },
]

export function ServicesLaunchpad() {
  const [isAndroid, setIsAndroid] = useState(false)
  const { data } = useSWR('/api/mail/unread', (url: string) => fetch(url).then((res) => res.json()), {
    refreshInterval: 15000
  })
  const { data: statusData } = useSWR(
    '/api/services/status',
    (url: string) => fetch(url).then((res) => res.json()),
    { refreshInterval: 30000, revalidateOnFocus: false }
  )
  const unreadCount = typeof data?.total === 'number' ? data.total : 0
  const statusMap = new Map(
    (statusData?.services || []).map((entry: { name: string; online: boolean }) => [entry.name, entry.online])
  )

  useEffect(() => {
    setIsAndroid(/android/i.test(navigator.userAgent))
  }, [])

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <h2 className="text-sm font-mono font-semibold text-cyan-400 tracking-[0.3em] uppercase">Services Launchpad</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
        {services.map((service) => (
          <ServiceTile
            key={service.name}
            service={service}
            isAndroid={isAndroid}
            unreadCount={service.name === "Mail" ? unreadCount : null}
            status={statusMap.has(service.name)
              ? (statusMap.get(service.name) ? "online" : "offline")
              : "checking"}
          />
        ))}
      </div>
    </section>
  )
}

function ServiceTile({
  service,
  isAndroid,
  unreadCount,
  status,
}: {
  service: (typeof services)[0]
  isAndroid: boolean
  unreadCount: number | null
  status: "online" | "offline" | "checking"
}) {
  const Icon = service.icon

  // Construct Android Intent URL if applicable
  const getHref = () => {
    if (isAndroid && service.androidPackage) {
      // Intent format: intent://<host>#Intent;scheme=<scheme>;package=<package>;S.browser_fallback_url=<fallback>;end
      // We use the URL as fallback
      const url = new URL(service.url)
      return `intent://${url.host}${url.pathname}#Intent;scheme=${url.protocol.replace(':', '')};package=${service.androidPackage};S.browser_fallback_url=${encodeURIComponent(service.url)};end`
    }
    return service.url
  }

  return (
    <a
      href={getHref()}
      target={isAndroid && service.androidPackage ? "_self" : "_blank"}
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-6 transition-all duration-300 hover:scale-105 hover:border-cyan-500/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]"
    >
      {typeof unreadCount === "number" && unreadCount > 0 && (
        <div className="absolute top-3 right-3 rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-100">
          {unreadCount}
        </div>
      )}
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Glow effect */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${service.color} blur-3xl -z-10`}
        style={{ transform: "scale(0.8)" }}
      />

      <div className="relative flex flex-col items-center text-center space-y-4">
        {/* Icon */}
        <div className={`p-4 rounded-xl bg-gradient-to-br ${service.color} shadow-lg`}>
          <Icon className="h-10 w-10 text-white" />
        </div>

        {/* Name & Description */}
        <div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">{service.name}</h3>
          <p className="text-sm text-slate-400">{service.description}</p>
        </div>

        {/* Status & Open */}
        <div className="flex items-center justify-between w-full pt-2 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                status === "online"
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : status === "offline"
                    ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"
                    : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              }`}
            />
            <span
              className={`text-xs font-mono uppercase tracking-wider ${
                status === "online"
                  ? "text-emerald-400"
                  : status === "offline"
                    ? "text-red-400"
                    : "text-amber-400"
              }`}
            >
              {status}
            </span>
          </div>
          <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </div>
      </div>
    </a>
  )
}
