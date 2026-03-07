import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Logo className="h-12 w-12 mx-auto mb-3" />
          <h1 className="text-3xl font-bold tracking-tight">Progressio</h1>
          <p className="text-muted-foreground mt-1">Fitness platform pre trénerov a klientov</p>
        </div>
        {children}
      </div>
    </div>
  );
}
