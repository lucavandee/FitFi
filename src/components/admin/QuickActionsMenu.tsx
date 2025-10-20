interface QuickAction {
  id: string;
  label: string;
  icon: string;
  gradient: string;
  onClick: () => void;
}

interface QuickActionsMenuProps {
  actions: QuickAction[];
}

export default function QuickActionsMenu({ actions }: QuickActionsMenuProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className="group relative p-6 rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-transparent transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${action.gradient})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative flex flex-col items-center text-center">
            <div className="text-4xl mb-3">{action.icon}</div>
            <span className="text-sm font-semibold text-white drop-shadow-lg">
              {action.label}
            </span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </button>
      ))}
    </div>
  );
}
