const BASE = "https://exercisedb-api.vercel.app/api/v1";

export type ExerciseDBItem = {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
};

type SearchResponse = {
  success: boolean;
  data?: ExerciseDBItem[];
  metadata?: { totalExercises: number; totalPages: number; currentPage: number };
};

export async function searchExercises(
  q: string,
  limit = 15,
  offset = 0
): Promise<ExerciseDBItem[]> {
  if (!q.trim()) return [];
  const params = new URLSearchParams({
    q: q.trim(),
    limit: String(Math.min(25, Math.max(1, limit))),
    offset: String(Math.max(0, offset)),
  });
  const res = await fetch(`${BASE}/exercises/search?${params}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const json: SearchResponse = await res.json();
  return json.data ?? [];
}

export async function getExerciseById(exerciseId: string): Promise<ExerciseDBItem | null> {
  const res = await fetch(`${BASE}/exercises/${encodeURIComponent(exerciseId)}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.success && json.data ? json.data : null;
}
