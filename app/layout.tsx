import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vietnamese TTS - AI-Powered Text-to-Speech',
  description: 'AI-powered Vietnamese Text-to-Speech with voice cloning capabilities. Convert text to natural-sounding speech in Vietnamese, English, and French.',
  keywords: ['TTS', 'Text-to-Speech', 'Vietnamese', 'Voice Cloning', 'AI', 'Speech Synthesis'],
  authors: [{ name: 'TTS Vietnam Team' }],
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ef4444',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
          {/* Background decoration */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-red-400/20 to-orange-400/20 animate-float" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-400/20 to-blue-400/20 animate-float" style={{ animationDelay: '-3s' }} />
            <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-400/20 to-red-400/20 animate-float" style={{ animationDelay: '-1.5s' }} />
          </div>
          
          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}