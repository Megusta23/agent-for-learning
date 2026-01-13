# EduAgent - Autonomous AI Tutor

EduAgent je napredna platforma za učenje koju pokreće autonomni AI agent. Cilj projekta je pružiti personalizirano iskustvo učenja gdje agent proaktivno prati napredak korisnika, generira prilagođene lekcije i kvizove, te se prilagođava stilu učenja svakog pojedinca.

---

## Arhitektura

Ovaj projekat strogo prati principe **Clean Architecture** metodologije kako bi se osigurala skalabilnost, testabilnost i jasno razdvajanje odgovornosti.

### Slojevi aplikacije

Struktura koda je organizirana u jasne slojeve unutar `src/` direktorija:

1.  **Presentation Layer (`src/app`)**:
    *   Sadrži Next.js stranice i React komponente.
    *   Zadužen isključivo za prikaz podataka i interakciju sa korisnikom.
    *   Komunicira sa logičkim slojem (Server Actions) ali ne sadrži poslovnu logiku.

2.  **Logic/Domain Layer (`src/server/logic`)**:
    *   Srce aplikacije. Sadrži poslovna pravila i use-caseove.
    *   **Services**: `AgentOrchestrator`, `DecisionEngine` - ovdje živi "pamet" agenta.
    *   Neovisan o bazi podataka ili vanjskim API-jima (koristi interfejse).

3.  **Data/Infrastructure Layer (`src/server/db`, `src/server/llm`)**:
    *   Implementacija interfejsa definisanih u Core sloju.
    *   **Repositories**: Konkretna implementacija pristupa bazi (Drizzle ORM).
    *   **LLM Service**: Integracija sa Groq/Llama modelima.

4.  **Core (`src/server/core`)**:
    *   Dijeljeni tipovi, interfejsi i entiteti koje koriste svi ostali slojevi.

---

## Agent Architecture: The Cognitive Cycle

Autonomni agent (`AgentRunner`) operira u kontinuiranoj petlji koja simulira kognitivni proces. Ovaj proces je implementiran u `AgentOrchestrator` servisu i sastoji se od četiri ključne faze:

### 1. **Sense** 
Agent skenira okolinu (bazu podataka) tražeći promjene ili signale.
*   **Aktivnost**: Provjerava `UserState` tabelu za korisnike koji su neaktivni, imaju nizak mastery score, ili su upravo završili aktivnost.
*   **Kod**: `userStateRepo.findUsersNeedingAttention()`

### 2. **Think** 
Agent analizira prikupljene podatke i donosi odluku koristeći `DecisionEngine`.
*   **Analiza**: Uzima u obzir `MasteryLevel`, `RecentScores`, i `TimeSinceLastActivity`.
*   **Odluka**: Da li generisati novu lekciju? Dati kviz provjere? Ili sačekati jer korisnik dobro napreduje?
*   **Kod**: `decisionEngine.decide(userState, memory)`

### 3. **Act** 
Agent izvršava donesenu odluku u stvarnom svijetu.
*   **Akcije**:
    *   `GENERATE_LESSON`: Poziva LLM da kreira lekciju na specifičnu temu i težinu.
    *   `GENERATE_QUIZ`: Kreira set pitanja za provjeru znanja.
    *   `UPDATE_MASTERY`: Ažurira korisnikov nivo znanja na osnovu rezultata.
*   **Kod**: `orchestrator.executeDecision(decision)`

### 4. **Learn** 
Agent ažurira svoje interno pamćenje o korisniku kako bi bio bolji u budućnosti.
*   **Učenje**: Bilježi koje metode su bile uspješne (npr. "Korisnik bolje reaguje na kvizove ujutro").
*   **Kod**: `memoryRepo.updateMemory(memory)`

---

## Tehnologije

Projekat koristi moderan T3 stack sa fokusom na performanse i type-safety:

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Jezik**: [TypeScript](https://www.typescriptlang.org/)
*   **Baza Podataka**: [SQLite](https://www.sqlite.org/) (via LibSQL)
*   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
*   **AI/LLM**: [LangChain](https://js.langchain.com/) + [Groq SDK](https://groq.com/) (Llama 3.3 70B)
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
*   **Validacija**: [Zod](https://zod.dev/)

---

## Pokretanje Projekta

### Preduvjeti
*   Node.js 18+
*   pnpm (preporučeno) ili npm
*   Groq API Key (za AI funkcionalnosti)

### 1. Instalacija
```bash
# Instaliraj dependency-e
pnpm install
```

### 2. Konfiguracija Okruženja
Kreiraj `.env` fajl na osnovu `.env.example`:
```bash
cp .env.example .env
```
Obavezno popuni `GROQ_API_KEY` u `.env` fajlu.

### 3. Priprema Baze
```bash
# Push sheme na bazu (kreira db.sqlite)
pnpm db:push

# (Opcionalno) Popuni bazu testnim podacima
pnpm db:seed
```

### 4. Pokretanje Aplikacije
Za puni doživljaj potrebno je pokrenuti i Web aplikaciju i Agent workera paralelno.

```bash
# Pokreće i Next.js app i Agenta (preporučeno)
npm run dev:full
```

Alternativno, možeš ih pokrenuti zasebno u dva terminala:
```bash
# Terminal 1: Web App
npm run dev

# Terminal 2: AI Agent
npm run agent:dev
```

Aplikacija će biti dostupna na `http://localhost:3000`.
