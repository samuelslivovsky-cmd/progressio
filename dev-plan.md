# Progressio — Dev Plan

## Fáza 0 — Databáza & infraštruktúra ✅

> Hotové — schéma, tRPC routery

### 0.2 tRPC router scaffold

- [x] Vytvor `server/routers/analytics.ts` — procedúry: `getClientSnapshot`, `getAlerts`, `getDropOffRanking`
- [x] Vytvor `server/routers/ai.ts` — procedúry: `sendMessage`, `getHistory`, `getWeeklySummary`
- [x] Zaregistruj oba v `server/routers/index.ts`

---

## Fáza 1 — Klient: logovanie stravy ✅

> Hotové — denná rutina klienta

### 1.1 `/client/food` — Food log page

- [x] Denný prehľad s dátumovým navigátorom (predchádzajúci / nasledujúci deň)
- [x] Sekcie: Raňajky / Desiata / Obed / Olovrant / Večera
- [x] Každá sekcia: zoznam zaznamenaných jedál + tlačidlo "Pridať"
- [x] Kalórie + makrá (P/C/F) per sekcia + denný súčet
- [x] Progress bar: dnešné kalórie vs. cieľové (TDEE z `goalWeight` + `activityLevel`)

### 1.2 Add food dialog

- [x] Vyhľadávanie jedál cez `food` router
- [x] Výber porcie (gramáž), makrá sa prepočítavajú v reálnom čase
- [x] Submit → `foodLog.create` mutation

### 1.3 `/client/meal-plan` — Priradený jedálniček

- [x] Zobrazenie aktívneho jedálnička prideleného trénerom
- [x] Denný pohľad: raňajky/desiata/obed/olovrant/večera s jedlami, gramážami, makrami
- [x] Prázdny stav s CTA ak nie je pridelený plán

---

## Fáza 2 — Klient: tréning ✅

> Hotové — logovanie tréningov podľa plánu

### 2.1 `/client/workout` — Workout log page

- [x] Zoznam tréningov priradených trénerom (aktívny tréningový plán)
- [x] Tlačidlo "Začať tréning" → spustí session
- [x] Počas tréningu: zadávanie sérií, opakovaní a váhy
- [x] Po dokončení → `workoutLog.complete` (log + položky + série naraz)

### 2.2 Workout session UI

- [x] Každé cvičenie: názov, počet sérií × opakovaní × váha (inputs)
- [x] Časovač odpočinku (voliteľné, môže byť doplnený neskôr)
- [x] "Dokončiť tréning" → uloží log, zobrazí success toast

---

## Fáza 3 — Klient: progress ✅

> Hotové — váha, merania, prehľad; grafy aj na dashboarde

### 3.1 `/client/progress/weight` — Váha

- [x] Recharts `LineChart`: posledných 30 / 90 dní (toggle)
- [x] Formulár na pridanie váhy (dátum + hodnota)
- [x] Trend line (lineárna regresia) + predikcia dátumu cieľovej váhy
- [x] Mini štatistiky: štart, aktuálna, cieľ, zostatok

### 3.2 `/client/progress/measurements` — Merania

- [x] Multi-line chart: pás, boky, hrudník, paže, stehná, lýtka, krk (toggle v legende)
- [x] Formulár na pridanie merania (viac polí naraz, dátum)
- [x] Tabuľka: história posledných meraní

### 3.3 `/client/progress` — Overview

- [x] Agregovaný prehľad: mini weight chart + mini measurements
- [x] Streak (dni v rade s logom) — môže byť doplnený neskôr
- [x] Adherencia stravy (posledných 7 dní): 7 bodiek prázdny/plný kruh
- [x] Adherencia tréningu (posledných 7 dní): rovnaký pattern
- [x] CTA buttony na detailné stránky

### Dashboard klienta (`/client`)

- [x] Grafy: váha (14 dní) + kalórie (7 dní)

---

## Fáza 4 — Tréner: správa plánov ✅

> Hotové — knižnica jedál, jedálničky, tréningové plány s priradeniami a duplikáciou

### 4.1 `/trainer/plans/meal-templates` — Knižnica jedál

- [x] Zoznam (karty) všetkých `MealTemplate` vytvorených trénerom
- [x] CRUD: vytvoriť jedlo (názov), upraviť názov, zmazať; položky = potraviny z knižnice (kalórie, P/C/F z Food)
- [x] Vyhľadávanie a filter

### 4.2 `/trainer/plans/meal` — Jedálničky

- [x] Zoznam jedálničkov s menom prideleného klienta (Priradené: X, Y)
- [x] Vytvorenie nového jedálnička: názov → denné plány (Po–Ne) → pridávanie jedál z knižnice
- [x] Priradenie jedálnička klientovi (dropdown v detaile plánu)
- [x] Duplikovanie existujúceho jedálnička (tlačidlo Duplikovať → presmerovanie na kópiu)

### 4.3 `/trainer/plans/training` — Tréningové plány

- [x] Zoznam tréningových plánov s menom klienta (Priradené: X, Y)
- [x] Vytvorenie: názov → tréningové dni → každý deň: cvičenia (názov, série, opakovania, váha)
- [x] Priradenie klientovi (tlačidlo Priradiť + dialog)
- [x] Duplikovanie existujúceho tréningového plánu

---

## Fáza 5 — Tréner: detail klienta

> Centrálna stránka pre prácu s klientom

### 5.1 `/trainer/clients/[id]` — Client detail ✅

Záložky (Tabs):

- [x] **Prehľad** — posledná váha, trend, aktívne plány (ClientPlanAssignCards), odkaz na stravu
- [x] **Váha & merania** — read-only grafy (LineChart váha + merania)
- [x] **Strava** — read-only zoznam dní cez `foodLog.listForClient` + odkaz na kalendárový prehľad
- [x] **Tréning** — read-only zoznam workout logov cez `workoutLog.listForClient`
- [x] **Plány** — aktívny meal plan + training plan, možnosť zmeny (ClientPlanAssignCards)

### 5.2 Oprava trainer dashboardu ✅

- [x] "Aktívne (3 dni)" → počet klientov so záznamom stravy alebo tréningu v posledných 3 dňoch
- [x] Sekcia "Posledná aktivita" — zoznam klientov, ktorí logovali dnes/včera (dátum + typ: Strava/Tréning), odkaz na detail

---

## Fáza 6 — Prediktívna inteligencia ✅

> Hlavný diferenciátor; závisí na existujúcich dátach z fáz 1–5

### 6.1 Analytics router — algoritmy ✅

- [x] `getDropOffScore(clientId)` — kompozitný score 0–100 (adherencia, dni neaktivity, streak) v `lib/analytics.ts`
- [x] `detectPlateau(clientId)` — váha rozsah &lt; 0.5 kg za 21 dní + adherencia &gt; 70%
- [x] `detectSkippedExercises(clientId)` — cvičenia z plánu chýbajúce v posledných 3 workout logoch
- [x] `predictGoalDate(clientId)` — lineárna regresia 28 dní váhy, odhad dátumu cieľa
- [x] `generateAlerts(clientId)` → ukladá do `Alert` (bez duplicít nevyriešeného typu), `resolveAlert` mutation

### 6.2 Automatizácia alertov ✅

- [x] Pri načítaní trainer dashboardu: `RefreshAlertsOnMount` volá `generateAlertsForAllClients` (raz za session)
- [x] Alerty v DB, tréner ich vidí v sekcii Inteligencia; označenie „Vyriešiť“ cez `resolveAlert`

### 6.3 Trainer dashboard — Intelligence sekcia ✅

- [x] Prioritná fronta: `getDropOffRanking` (snapshot alebo on-the-fly), zoradené podľa drop-off skóre
- [x] Alert feed: karty podľa severity (high/medium/low), typ + správa, tlačidlá Detail + Vyriešiť
- [x] Badge s počtom nevyriešených alertov na položke „Dashboard“ v sidebar (tréner)

---

## Fáza 7 — Klient AI tier

> Závisí na fázach 0–3; monetizácia

### 7.1 Subscription logika

- [ ] `subscriptionTier` na Profile (z fázy 0)
- [ ] tRPC helper: `requireTier(tier)` pre procedúry za paywall
- [ ] Upgrade stránka `/upgrade` — popis Klient AI tieru, CTA

### 7.2 `/client/ai` — AI chat

- [ ] Chat UI: história správ, input, send button
- [ ] `ai.sendMessage`: zostaví system prompt (profil + posledný týždeň logov + ciele) → Claude API streaming
- [ ] Odpovede sa ukladajú do `AiChatMessage`
- [ ] Paywall: ak `subscriptionTier !== "KLIENT_AI"` → blokovaný UI s upgrade CTA

### 7.3 Weekly AI summary

- [ ] `ai.generateWeeklySummary`: zhrnutie minulého týždňa (kalórie, tréningy, váha) → Claude API → `WeeklySummary`
- [ ] Zobrazenie na client dashboarde: collapsible karta s AI zhrnutím
- [ ] Dynamické odporúčania: plateau → deload week; nízka adherencia → motivačný text

### 7.4 Sidebar rozšírenie pre Klient AI

- [ ] Pridaj `/client/ai` do clientNav — len pre `subscriptionTier === "KLIENT_AI"`
- [ ] Pre ostatných: šedá položka s "Upgrade" tagom

---

## Prioritizácia

| Fáza              | Hodnota     | Náročnosť | Priorita      |
| ----------------- | ----------- | --------- | ------------- |
| 0 — Schéma        | Blocker     | Nízka     | Ihneď         |
| 1 — Food log      | Vysoká      | Stredná   | Ihneď         |
| 2 — Tréning       | Vysoká      | Stredná   | Ihneď         |
| 3 — Progress      | Stredná     | Stredná   | Po 1+2        |
| 4 — Tréner plány  | Vysoká      | Vysoká    | Paralelne s 3 |
| 5 — Klient detail | Vysoká      | Stredná   | Po 4          |
| 6 — Inteligencia  | Kľúčová     | Vysoká    | Po 5          |
| 7 — Klient AI     | Monetizácia | Vysoká    | Posledná      |
