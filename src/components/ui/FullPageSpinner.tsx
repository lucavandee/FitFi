import React from 'react';

const FullPageSpinner: React.FC<{ label?: string; delayMs?: number }> = ({ label, delayMs = 0 }) => {
  const [show, setShow] = React.useState(delayMs === 0);
  React.useEffect(() => {
    if (delayMs === 0) return;
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  if (!show) return null;

  return (
    <div className="min-h-[60vh] grid place-items-center text-gray-700">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-transparent" />
        {label ? <p className="text-sm">{label}</p> : null}
      </div>
    </div>
  );
};
export default FullPageSpinner;