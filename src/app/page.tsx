import { TopNav } from "@/components/dashboard/top-nav"
import { ServicesLaunchpad } from "@/components/dashboard/services-launchpad"
import { StorageCluster } from "@/components/dashboard/storage-cluster"
import { BeszelMetrics } from "@/components/dashboard/beszel-metrics"
import { LenovoMetrics } from "@/components/dashboard/lenovo-metrics"
import { DockerOrbit } from "@/components/dashboard/docker-orbit"
import { SecurityPrison } from "@/components/dashboard/security-prison"
import { NetworkMonitor } from "@/components/dashboard/network-monitor"
import { getSsoIdentity } from "@/lib/sso-user"

export default async function Dashboard() {
  const ssoIdentity = await getSsoIdentity()

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <TopNav userName={ssoIdentity?.user ?? "SSO"} />
      <main className="p-6 space-y-6">
        {/* Services Launchpad - Most prominent */}
        <ServicesLaunchpad />

        {/* Servers Section - Dell & Lenovo side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BeszelMetrics />
          <LenovoMetrics />
        </div>

        {/* Bottom Grid - Storage, Docker, Security, Network */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <StorageCluster />
          <DockerOrbit />
          <SecurityPrison />
          <NetworkMonitor />
        </div>
      </main>
    </div>
  )
}
