import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  /** Optional element rendered on the right side of the header (e.g. a Link) */
  action?: React.ReactNode;
  /**
   * When true, removes padding from CardContent so tables / lists can
   * manage their own padding edge-to-edge.
   */
  noPadding?: boolean;
  children: React.ReactNode;
}

export function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  noPadding,
  children,
}: SectionCardProps) {
  return (
    <Card className="border-0 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-slate-400" />
            <CardTitle className="text-base font-semibold text-slate-700">
              {title}
            </CardTitle>
          </div>
          {action}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className={noPadding ? "p-0" : undefined}>
        {children}
      </CardContent>
    </Card>
  );
}
