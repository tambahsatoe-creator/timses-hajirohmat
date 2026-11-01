import "./globals.css"

export const metadata = {
  title: "MY TPS - Timses Haji Rohmat | Pilkades Kampung Makmur Jaya",
  description:
    "Sistem Pengawalan & Tabulasi Suara Pilkades Kampung Makmur Jaya",
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-base font-sans text-on-surface antialiased selection:bg-status-kita-bg">
        {children}
      </body>
    </html>
  )
}
