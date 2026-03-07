export function LandingIntro() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Čo je Progressio?
        </h2>
        <p className="text-lg text-muted-foreground">
          Progressio spája trénerov a klientov a pridáva predikcie z ich správania.
          Tréneri vytvárajú stravovacie a tréningové plány, klienti logujú jedlo,
          tréningy, váhu a merania. Platforma vyhodnocuje dáta a navrhuje ďalšie kroky —
          všetko na jednom mieste, bez zbytočných tabuliek a e-mailov.
        </p>
      </div>
    </section>
  );
}
