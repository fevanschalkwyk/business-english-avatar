import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BusinessEnglishAI — Speak confidently in every meeting',
  description: 'Practice real business English scenarios with AI avatars. Build fluency, reduce anxiety, advance your career.',
  openGraph: {
    title: 'BusinessEnglishAI',
    description: 'AI-powered Business English practice for non-native speakers.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
