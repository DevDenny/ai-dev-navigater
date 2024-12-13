import './globals.css'
import RootNav from '@/components/RootNav'

export const metadata = {
  title: 'CodeAI Hub',
  description: 'Your AI Development Navigator',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
} 