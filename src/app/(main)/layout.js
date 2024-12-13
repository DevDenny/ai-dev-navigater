import RootNav from '@/components/RootNav'

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen">
      <RootNav />
      <main>
        {children}
      </main>
    </div>
  );
} 