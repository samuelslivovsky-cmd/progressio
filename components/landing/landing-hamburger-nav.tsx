"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "uvod", label: "Úvod" },
  { id: "statistiky", label: "Štatistiky" },
  { id: "inteligencia", label: "Inteligencia" },
  { id: "how-it-works", label: "Ako to funguje" },
  { id: "features", label: "Funkcie" },
  { id: "pricing", label: "Cenník" },
  { id: "reviews", label: "Recenzie" },
] as const;

export function LandingHamburgerNav() {
  const [open, setOpen] = useState(false);

  function goTo(id: string) {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-white/80 hover:text-white hover:bg-white/10")}
        aria-label="Menu sekcií"
      >
        <MenuIcon className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[280px] border-white/10 bg-[#0c100d] text-white [&_button.absolute]:text-white [&_button.absolute]:hover:bg-white/10"
      >
        <nav className="flex flex-col gap-1 pt-8" aria-label="Sekcie">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => goTo(id)}
              className="rounded-lg px-3 py-2.5 text-left text-base font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              {label}
            </button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
