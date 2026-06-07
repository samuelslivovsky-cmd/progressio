import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Logo className="h-10 w-10 shrink-0" />
          <span className="text-lg font-semibold tracking-tight">Progressio</span>
        </div>
        {children}
      </div>
    </div>
  );
}
