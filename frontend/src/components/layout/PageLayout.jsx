import Navbar from './Navbar';

/**
 * PageLayout — wraps every authenticated page with the sticky navbar.
 * Each page controls its own max-width and padding.
 * Props: children
 */
export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
}
