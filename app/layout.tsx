import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'NetworkCheck | Cashless hospital directory', description: 'Check insurer cashless hospital network listings.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><header className="topbar"><a className="brand" href="/">Network<span>Check</span></a><nav><a href="/">Search hospitals</a><a href="/admin">Admin</a></nav></header>{children}<footer>NetworkCheck · Directory information should always be confirmed with your insurer and hospital.</footer></body></html>;
}
