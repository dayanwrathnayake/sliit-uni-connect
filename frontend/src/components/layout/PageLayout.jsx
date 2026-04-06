import Navbar from './Navbar';

/**
 * PageLayout — wraps every authenticated page with the sticky navbar
 * and a centred content area.
 * Props: children
 */
export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
