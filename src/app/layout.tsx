import './globals.css'

export const metadata = {
  title: 'Fitness Tracker - AI 智能飲食記錄',
  description: 'AI-powered meal tracking app with real-time nutrition analysis',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#0f172a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fitness Tracker'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>{children}</body>
    </html>
  )
}
