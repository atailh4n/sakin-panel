/*
 * MIT License
 * Copyright (c) 2025 Ata İlhan Köktürk
 */

import Link from 'next/link'
import Footer from './components/Footer'
import NetworkDashboard from './components/NetworkDashboard'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto py-6">
        <div className="px-4 md:px-8"> {/* Global padding */}
          <h1 className="text-4xl font-bold mb-8">S.A.K.I.N WebPanel</h1>
          <p className="text-l mb-2">Prisma ORM and PostgreSQL Visualiser for <Link href={"https://github.com/atailh4n/sakin"}>S.A.K.I.N</Link></p>
          <p>All dates are set for your local machine datetime.</p>
          <NetworkDashboard />
        </div>
      </div>
      <Footer />
    </main>
  )
}