'use client';

import { TopNav } from "@/components/dashboard/top-nav"
import { ServicesLaunchpad } from "@/components/dashboard/services-launchpad"
import { StorageCluster } from "@/components/dashboard/storage-cluster"
import { BeszelMetrics } from "@/components/dashboard/beszel-metrics"
import { DockerOrbit } from "@/components/dashboard/docker-orbit"
import { SecurityPrison } from "@/components/dashboard/security-prison"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <TopNav />
      <main className="p-6 space-y-6">
        {/* Services Launchpad - Most prominent */}
        <ServicesLaunchpad />

        {/* Bottom Grid - Storage, Metrics, Docker, Security */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <StorageCluster />
          <BeszelMetrics />
          <DockerOrbit />
          <SecurityPrison />
        </div>
      </main>
    </div>
  )
}
