import Navbar from './Navbar';

/**
 * PageLayout — wraps every authenticated page with the sticky navbar.
 * Each page controls its own max-width and padding.
 * Props: children
 */
export default function PageLayout({ children, title }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="pt-6">
        {title && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
