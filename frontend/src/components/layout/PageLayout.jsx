import Navbar from './Navbar';

/**
 * PageLayout — wraps every authenticated page with the sticky navbar
 * and a centred content area.
 * Props:
 *   children
 *   wide     – if true, uses max-w-7xl instead of max-w-4xl (e.g. for home page)
 *   noPadding – if true, removes the default padding (page manages its own)
 */
export default function PageLayout({ children, wide = false, noPadding = false }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className={`mx-auto ${wide ? 'max-w-7xl' : 'max-w-4xl'} ${noPadding ? '' : 'px-4 sm:px-6 lg:px-8 py-8'}`}>
        {children}
      </main>
    </div>
  );
}
