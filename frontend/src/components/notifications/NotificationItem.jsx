import { useNavigate } from 'react-router-dom';

function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60)   return 'just now';
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationItem({ notification, onMarkRead }) {
  const navigate = useNavigate();
  const { id, message, createdAt, isRead, actorName, actorImageUrl, link } = notification;

  const firstLetter = actorName ? actorName.charAt(0).toUpperCase() : '?';

  function handleClick() {
    if (!isRead) onMarkRead(id);
    if (link) navigate(link);
  }

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
        ${!isRead
          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
          : 'bg-white dark:bg-slate-800 border-l-2 border-transparent hover:bg-gray-50 dark:hover:bg-slate-700'
        }`}
    >
      <div className="flex-shrink-0">
        {actorImageUrl ? (
          <img src={actorImageUrl} alt={actorName} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{firstLetter}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!isRead ? 'font-medium text-gray-800 dark:text-slate-100' : 'font-normal text-gray-700 dark:text-slate-300'}`}>
          {message}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{formatTimeAgo(createdAt)}</p>
      </div>

      <div className="flex-shrink-0 pt-1">
        {!isRead ? (
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
        ) : (
          <div className="w-2 h-2" />
        )}
      </div>
    </div>
  );
}
