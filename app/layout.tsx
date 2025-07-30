import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI-Powered Text-to-Speech',
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
      <body className="antialiased">
        <div className="min-h-screen">
          {/* Apple-style background with subtle gradients */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30" />
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-400/10 animate-float" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 animate-float" style={{ animationDelay: '-3s' }} />
            <div className="absolute top-1/3 right-1/4 w-60 h-60 rounded-full bg-gradient-to-br from-cyan-400/10 to-blue-400/10 animate-float" style={{ animationDelay: '-1.5s' }} />
          </div>
          
          {/* Main content with Apple Liquid Glass styling */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}