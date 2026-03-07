import { Users, Dumbbell } from "lucide-react";

const stats = [
  { value: "100+", label: "trénerov" },
  { value: "500+", label: "aktívnych klientov" },
];

export function LandingTrainers() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
        Kto Progressio používa
      </h2>
      <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
        Tréneri a klienti z celej Slovenska spravujú plány, pokrok a predikcie na jednej platforme.
      </p>
      <div className="flex flex-wrap justify-center gap-12 max-w-2xl mx-auto">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-primary/15 p-4">
              <Users className="size-8 text-primary" />
            </div>
            <span className="text-3xl font-bold text-foreground">{s.value}</span>
            <span className="text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          <Dumbbell className="size-4 text-primary" />
          Fitness tréneri, nutriční poradcovia a ich klienti
        </div>
      </div>
    </section>
  );
}
