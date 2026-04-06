/**
 * Global toast notification UI.
 * Use alongside useToast hook.
 *
 * Usage:
 *   const { toast, showToast } = useToast();
 *   return <><ToastContainer toast={toast} />...</>
 */
export default function ToastContainer({ toast }) {
  if (!toast) return null;
  const bg = toast.type === 'error' ? 'bg-red-600' : 'bg-green-600';

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 ${bg} text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium`}
      role="alert"
    >
      {toast.type === 'success' ? (
        <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span>{toast.message}</span>
    </div>
  );
}
