import type { Metadata } from 'next'
import './globals.css'
import ConditionalNavbar from './components/ConditionalNavbar'
import AiAssistant from './components/AiAssistant'
import Providers from './components/Providers'

export const metadata: Metadata = {
  title: 'GasUllaVidu - Premium Hyperlocal Auto-Gas Sharing',
  description: 'Connect, share, and find LPG cylinders temporarily in your neighborhood safely with AI assistance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <ConditionalNavbar />
          <main>{children}</main>
          <AiAssistant />
        </Providers>
      </body>
    </html>
  )
}
