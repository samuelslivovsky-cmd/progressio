"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: React.ReactNode;
  /** If set, shows back button linking to this href */
  backHref?: string;
  description?: React.ReactNode;
  /** Optional actions (e.g. buttons) on the right */
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  backHref,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {backHref && (
        <Link
          href={backHref}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          aria-label="Späť"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description != null && (
          <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
