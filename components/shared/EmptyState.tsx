interface EmptyStateProps {
  icon: React.ElementType;
  message: string;
}

export function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-10 text-slate-400">
      <Icon className="h-8 w-8 mb-2 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
