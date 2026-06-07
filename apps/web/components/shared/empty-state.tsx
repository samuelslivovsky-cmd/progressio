import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Optional icon (e.g. Lucide icon) */
  icon?: React.ReactNode;
  /** Main message, often bold */
  title?: React.ReactNode;
  /** Secondary text below title */
  description?: React.ReactNode;
  /** CTA button or link */
  children?: React.ReactNode;
  /** Wrap content in Card (default true) */
  wrapInCard?: boolean;
  className?: string;
}

const emptyContentClass =
  "py-12 text-center text-muted-foreground flex flex-col items-center justify-center";

export function EmptyState({
  icon,
  title,
  description,
  children,
  wrapInCard = true,
  className,
}: EmptyStateProps) {
  const hasExtra = description != null || children != null;
  const content = (
    <div className={cn(emptyContentClass, className)}>
      {icon && <span className="mb-3 opacity-50 [&>svg]:h-12 [&>svg]:w-12">{icon}</span>}
      {title != null && (
        <p className={hasExtra ? "font-medium text-foreground" : undefined}>{title}</p>
      )}
      {description != null && <p className="text-sm mt-1">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );

  if (wrapInCard) {
    return (
      <Card>
        <CardContent className="p-0">{content}</CardContent>
      </Card>
    );
  }

  return content;
}
