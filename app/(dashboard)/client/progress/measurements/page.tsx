"use client";

import { useState } from "react";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ruler, Plus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";

const MEASUREMENT_KEYS = [
  { key: "waist", label: "Pás", color: "var(--chart-1)" },
  { key: "hips", label: "Boky", color: "var(--chart-2)" },
  { key: "chest", label: "Hrudník", color: "var(--chart-3)" },
  { key: "arm", label: "Paže", color: "var(--chart-4)" },
  { key: "thigh", label: "Stehná", color: "var(--chart-5)" },
  { key: "calf", label: "Lýtka", color: "var(--chart-1)" },
  { key: "neck", label: "Krk", color: "var(--chart-2)" },
] as const;

export default function ClientMeasurementsPage() {
  const [showLines, setShowLines] = useState<Record<string, boolean>>({
    waist: true,
    hips: true,
    chest: true,
    arm: false,
    thigh: false,
    calf: false,
    neck: false,
  });
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    waist: "",
    hips: "",
    chest: "",
    arm: "",
    thigh: "",
    calf: "",
    neck: "",
    logDate: format(new Date(), "yyyy-MM-dd"),
    unit: "CM" as const,
  });

  const utils = trpc.useUtils();
  const { data: measurements = [], isLoading } = trpc.measurement.list.useQuery({
    limit: 50,
  });
  const addMeasurement = trpc.measurement.add.useMutation({
    onSuccess: () => {
      toast.success("Meranie pridané");
      setAddOpen(false);
      setForm({
        waist: "",
        hips: "",
        chest: "",
        arm: "",
        thigh: "",
        calf: "",
        neck: "",
        logDate: format(new Date(), "yyyy-MM-dd"),
        unit: "CM",
      });
      utils.measurement.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  type MeasurementRow = {
    loggedAt: Date | string;
    waist?: number | null;
    hips?: number | null;
    chest?: number | null;
    arm?: number | null;
    thigh?: number | null;
    calf?: number | null;
    neck?: number | null;
  };
  const chartData = measurements
    .slice()
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    .map((m: MeasurementRow) => ({
      date: format(new Date(m.loggedAt), "d.M."),
      fullDate: m.loggedAt,
      waist: m.waist ?? undefined,
      hips: m.hips ?? undefined,
      chest: m.chest ?? undefined,
      arm: m.arm ?? undefined,
      thigh: m.thigh ?? undefined,
      calf: m.calf ?? undefined,
      neck: m.neck ?? undefined,
    }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      waist: form.waist ? parseFloat(form.waist.replace(",", ".")) : undefined,
      hips: form.hips ? parseFloat(form.hips.replace(",", ".")) : undefined,
      chest: form.chest ? parseFloat(form.chest.replace(",", ".")) : undefined,
      arm: form.arm ? parseFloat(form.arm.replace(",", ".")) : undefined,
      thigh: form.thigh ? parseFloat(form.thigh.replace(",", ".")) : undefined,
      calf: form.calf ? parseFloat(form.calf.replace(",", ".")) : undefined,
      neck: form.neck ? parseFloat(form.neck.replace(",", ".")) : undefined,
      unit: form.unit,
      loggedAt: new Date(form.logDate + "T12:00:00"),
    };
    const hasAny = MEASUREMENT_KEYS.some(({ key }) => data[key as keyof typeof data] != null);
    if (!hasAny) {
      toast.error("Zadaj aspoň jednu hodnotu");
      return;
    }
    addMeasurement.mutate(data);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Merania</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Načítavam…
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Merania</h1>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Pridať meranie
        </Button>
      </div>

      {/* Graf */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Priebeh meraní (cm)</CardTitle>
          <p className="text-xs text-muted-foreground">
            Klikni na položku v legende pre zobrazenie/skrytie línie
          </p>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Ruler className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Žiadne merania</p>
              <p className="text-sm mt-1">Pridaj prvý záznam.</p>
              <Button className="mt-4" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Pridať meranie
              </Button>
            </div>
          ) : (
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    stroke="var(--border)"
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    stroke="var(--border)"
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      color: "var(--card-foreground)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px" }}
                    formatter={(value) => <span style={{ color: "var(--muted-foreground)" }}>{value}</span>}
                    onClick={(e) => {
                      const key = e.dataKey as string;
                      if (key) setShowLines((s) => ({ ...s, [key]: !s[key] }));
                    }}
                  />
                  {MEASUREMENT_KEYS.map(({ key, label, color }) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={label}
                      stroke={color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      hide={!showLines[key]}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabuľka histórie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">História meraní</CardTitle>
        </CardHeader>
        <CardContent>
          {measurements.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Žiadne záznamy.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium text-muted-foreground">Dátum</th>
                    {MEASUREMENT_KEYS.map(({ key, label }) => (
                      <th key={key} className="text-right py-2 font-medium text-muted-foreground">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id} className="border-b border-border/50">
                      <td className="py-2">
                        {format(new Date(m.loggedAt), "d. M. yyyy")}
                      </td>
                      {MEASUREMENT_KEYS.map(({ key }) => (
                        <td key={key} className="text-right py-2">
                          {((m as unknown) as Record<string, number | null>)[key] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form na pridanie */}
      {addOpen && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pridať meranie</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logDate">Dátum</Label>
                  <Input
                    id="logDate"
                    type="date"
                    value={form.logDate}
                    onChange={(e) => setForm((f) => ({ ...f, logDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MEASUREMENT_KEYS.map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label} (cm)</Label>
                    <Input
                      id={key}
                      type="text"
                      inputMode="decimal"
                      placeholder="—"
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={addMeasurement.isPending}>
                  {addMeasurement.isPending ? "Ukladám…" : "Uložiť"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  Zrušiť
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
