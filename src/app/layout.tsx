import './globals.css'

export const metadata = {
  title: 'Fitness Tracker',
  description: 'AI-powered meal tracking app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK">
      <body>{children}</body>
    </html>
  )
}
