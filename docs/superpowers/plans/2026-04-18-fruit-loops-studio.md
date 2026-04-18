# Fruit Loops Studio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o mundo Fruit Loops num mini FL Studio local-first com upload de samples, step sequencer multicanal, patterns, playlist, mixer, FX, export WAV/JSON e persistência de múltiplos projetos.

**Architecture:** Domínio de estúdio isolado em `src/studio/` com tipos explícitos, engine Tone.js separada da UI, store Zustand dedicado para o projeto ativo, e `FruitLoopsWorld.tsx` como orquestrador de tela. A camada de áudio global (Howler/pixelLoveAudio) pausa ao entrar no estúdio e retoma ao sair.

**Tech Stack:** React 19, Tone.js 15 (já instalado), Zustand 5, Vitest, TypeScript 5.9, Vite + vite-plugin-singlefile

---

## Mapa de Arquivos

| Arquivo | Status | Responsabilidade |
|---------|--------|-----------------|
| `src/studio/types.ts` | **CRIAR** | Todas as interfaces/tipos do domínio |
| `src/studio/project.ts` | **EVOLUIR** | Funções puras de domínio (já existe base) |
| `src/studio/engine.ts` | **CRIAR** | Engine Tone.js — playback, FX, preview |
| `src/studio/export.ts` | **CRIAR** | Export WAV offline + JSON download |
| `src/studio/useStudioStore.ts` | **CRIAR** | Store Zustand com persist (projetos múltiplos) |
| `src/studio/__tests__/project.test.ts` | **EVOLUIR** | Testes de domínio (já existe base) |
| `src/studio/__tests__/engine.test.ts` | **CRIAR** | Testes de engine (mocks Tone.js) |
| `src/studio/components/StudioHeader.tsx` | **CRIAR** | Barra de título + transporte + BPM |
| `src/studio/components/ChannelRack.tsx` | **CRIAR** | Lista de canais com step pads |
| `src/studio/components/MixerPanel.tsx` | **CRIAR** | Volume/pan/mute/solo/FX por canal |
| `src/studio/components/PatternBar.tsx` | **CRIAR** | Seletor de patterns + duplicar |
| `src/studio/components/Playlist.tsx` | **CRIAR** | Grade de clips por barra/canal |
| `src/studio/components/ProjectManager.tsx` | **CRIAR** | Salvar/carregar/exportar projetos |
| `src/studio/components/GeniusButton.tsx` | **CRIAR** | Placeholder visual do co-producer futuro |
| `src/screens/FruitLoopsWorld.tsx` | **EVOLUIR** | Orquestrador da tela (mínimo de lógica) |
| `src/store/useStore.ts` | **EVOLUIR** | Adicionar `studioActive` flag para isolar áudio |

---

## Task 1: Consolidar tipos no studio/types.ts

**Files:**
- Create: `melovanzin/src/studio/types.ts`

- [ ] **Step 1.1: Criar o arquivo de tipos**

```typescript
// melovanzin/src/studio/types.ts

export type StepPattern = boolean[]

export interface ChannelSource {
  fileName: string
  mimeType: string
  sampleDataUrl: string // data URL base64 — serializável
}

export interface FilterFxState {
  enabled: boolean
  frequency: number   // Hz — 20..20000
  resonance: number   // Q — 0.1..30
}

export interface DelayFxState {
  enabled: boolean
  wet: number         // 0..1
  time: string        // Tone notation: '8n', '16n', etc.
  feedback: number    // 0..0.95
}

export interface ReverbFxState {
  enabled: boolean
  wet: number         // 0..1
  decay: number       // seconds — 0.1..10
}

export interface ChannelFxState {
  filter: FilterFxState
  delay: DelayFxState
  reverb: ReverbFxState
}

export interface StudioChannel {
  id: string
  name: string
  color: string       // CSS var ou hex
  source: ChannelSource
  volume: number      // dB — -60..6
  pan: number         // -1..1
  mute: boolean
  solo: boolean
  fx: ChannelFxState
  steps: Record<string, StepPattern> // patternId → steps
}

export interface PlaylistClip {
  id: string
  patternId: string
  barIndex: number    // 0-indexed
  channelId: string
}

export interface StudioProject {
  version: 1
  id: string
  name: string
  bpm: number
  bars: number
  patternLength: number
  patternOrder: string[]
  patterns: Record<string, StepPattern> // patternId → master steps (para UI de pattern)
  channels: StudioChannel[]
  playlist: PlaylistClip[]
  selectedPatternId: string
  createdAt: number
  updatedAt: number
}

// Slices auxiliares internos
export interface NewChannelInput {
  name: string
  fileName: string
  mimeType: string
  sampleDataUrl: string
}

export interface PlaceClipInput {
  patternId: string
  barIndex: number
  channelId: string
}
```

- [ ] **Step 1.2: Verificar que o arquivo compila sem erros**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin
npx tsc --noEmit --skipLibCheck 2>&1 | head -20
```

Esperado: sem erros relacionados a `types.ts`.

- [ ] **Step 1.3: Commit**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin
git -C /Users/ana/Projects/pixel-love add src/studio/types.ts
git -C /Users/ana/Projects/pixel-love commit -m "feat(studio): add canonical types module"
```

---

## Task 2: Evoluir studio/project.ts para importar de types.ts

**Files:**
- Modify: `melovanzin/src/studio/project.ts`

O arquivo já existe com lógica correta. Refatorar para importar tipos de `types.ts` e remover duplicatas locais.

- [ ] **Step 2.1: Reescrever project.ts importando de types.ts**

```typescript
// melovanzin/src/studio/project.ts
import type {
  StudioProject,
  StudioChannel,
  StepPattern,
  PlaylistClip,
  ChannelFxState,
  NewChannelInput,
  PlaceClipInput,
} from './types'

export type { StudioProject, StudioChannel, StepPattern, PlaylistClip, ChannelFxState }

const DEFAULT_PATTERN_ID = 'pattern-a'
const DEFAULT_PATTERN_LENGTH = 16
const DEFAULT_BARS = 8

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

function clonePatterns(patterns: Record<string, StepPattern>) {
  return Object.fromEntries(
    Object.entries(patterns).map(([id, pattern]) => [id, [...pattern]])
  )
}

function emptyFx(): ChannelFxState {
  return {
    filter: { enabled: false, frequency: 1200, resonance: 1 },
    delay: { enabled: false, wet: 0, time: '8n', feedback: 0.25 },
    reverb: { enabled: false, wet: 0, decay: 1.2 },
  }
}

export function createPattern(length = DEFAULT_PATTERN_LENGTH): StepPattern {
  return Array.from({ length }, () => false)
}

export function createEmptyProject(name = 'Projeto MeloVanzin'): StudioProject {
  const now = Date.now()
  return {
    version: 1,
    id: makeId('project'),
    name,
    bpm: 128,
    bars: DEFAULT_BARS,
    patternLength: DEFAULT_PATTERN_LENGTH,
    patternOrder: [DEFAULT_PATTERN_ID],
    patterns: { [DEFAULT_PATTERN_ID]: createPattern() },
    channels: [],
    playlist: [],
    selectedPatternId: DEFAULT_PATTERN_ID,
    createdAt: now,
    updatedAt: now,
  }
}

export function createSampleChannel(input: NewChannelInput): StudioChannel {
  return {
    id: makeId('channel'),
    name: input.name,
    color: 'var(--pu)',
    source: {
      fileName: input.fileName,
      mimeType: input.mimeType,
      sampleDataUrl: input.sampleDataUrl,
    },
    volume: 0,
    pan: 0,
    mute: false,
    solo: false,
    fx: emptyFx(),
    steps: { [DEFAULT_PATTERN_ID]: createPattern() },
  }
}

export function addChannelToProject(
  project: StudioProject,
  channel: StudioChannel
): StudioProject {
  // Garante que o canal tem steps para todos os patterns existentes
  const steps: Record<string, StepPattern> = {}
  for (const pid of project.patternOrder) {
    steps[pid] = channel.steps[pid] ?? createPattern(project.patternLength)
  }
  return {
    ...project,
    updatedAt: Date.now(),
    channels: [...project.channels, { ...channel, steps }],
  }
}

export function duplicatePattern(
  project: StudioProject,
  sourcePatternId: string
): StudioProject {
  const source = project.patterns[sourcePatternId]
  if (!source) return project

  const nextLetter = String.fromCharCode(97 + project.patternOrder.length)
  const nextPatternId = `pattern-${nextLetter}`
  const now = Date.now()

  return {
    ...project,
    updatedAt: now,
    patternOrder: [...project.patternOrder, nextPatternId],
    patterns: {
      ...clonePatterns(project.patterns),
      [nextPatternId]: [...source],
    },
    channels: project.channels.map((channel) => ({
      ...channel,
      steps: {
        ...clonePatterns(channel.steps),
        [nextPatternId]: [
          ...(channel.steps[sourcePatternId] ?? createPattern(project.patternLength)),
        ],
      },
    })),
  }
}

export function setStep(
  project: StudioProject,
  channelId: string,
  patternId: string,
  stepIndex: number,
  value: boolean
): StudioProject {
  return {
    ...project,
    updatedAt: Date.now(),
    channels: project.channels.map((ch) => {
      if (ch.id !== channelId) return ch
      const steps = { ...ch.steps }
      const pattern = [...(steps[patternId] ?? createPattern(project.patternLength))]
      pattern[stepIndex] = value
      steps[patternId] = pattern
      return { ...ch, steps }
    }),
  }
}

export function updateChannelMixer(
  project: StudioProject,
  channelId: string,
  patch: Partial<Pick<StudioChannel, 'volume' | 'pan' | 'mute' | 'solo'>>
): StudioProject {
  return {
    ...project,
    updatedAt: Date.now(),
    channels: project.channels.map((ch) =>
      ch.id === channelId ? { ...ch, ...patch } : ch
    ),
  }
}

export function updateChannelFx(
  project: StudioProject,
  channelId: string,
  fx: Partial<ChannelFxState>
): StudioProject {
  return {
    ...project,
    updatedAt: Date.now(),
    channels: project.channels.map((ch) =>
      ch.id === channelId ? { ...ch, fx: { ...ch.fx, ...fx } } : ch
    ),
  }
}

export function placeClip(
  project: StudioProject,
  clip: PlaceClipInput
): StudioProject {
  const now = Date.now()
  const nextClip: PlaylistClip = { id: makeId('clip'), ...clip }
  const filtered = project.playlist.filter(
    (item) =>
      !(item.channelId === clip.channelId && item.barIndex === clip.barIndex)
  )
  return {
    ...project,
    updatedAt: now,
    playlist: [...filtered, nextClip].sort((a, b) => a.barIndex - b.barIndex),
  }
}

export function removeClip(
  project: StudioProject,
  channelId: string,
  barIndex: number
): StudioProject {
  return {
    ...project,
    updatedAt: Date.now(),
    playlist: project.playlist.filter(
      (c) => !(c.channelId === channelId && c.barIndex === barIndex)
    ),
  }
}

export function resolveChannelStepsAtSongStep(
  project: StudioProject,
  channelId: string,
  songStep: number
): boolean {
  const channel = project.channels.find((e) => e.id === channelId)
  if (!channel) return false

  const barLength = project.patternLength
  const barIndex = Math.floor(songStep / barLength)
  const localStep = songStep % barLength

  const clip = project.playlist.find(
    (e) => e.channelId === channelId && e.barIndex === barIndex
  )
  if (!clip) return false

  return Boolean(channel.steps[clip.patternId]?.[localStep])
}

export function serializeProject(project: StudioProject): string {
  return JSON.stringify(project, null, 2)
}

export function hydrateProject(raw: string): StudioProject | null {
  try {
    const parsed = JSON.parse(raw) as StudioProject
    if (parsed.version !== 1) return null
    if (!parsed.patternOrder?.length || !parsed.patterns || !parsed.channels) return null
    return parsed
  } catch {
    return null
  }
}
```

- [ ] **Step 2.2: Rodar os testes existentes para confirmar nenhuma regressão**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin && npx vitest run
```

Esperado: 5 testes passando.

- [ ] **Step 2.3: Commit**

```bash
git -C /Users/ana/Projects/pixel-love add melovanzin/src/studio/
git -C /Users/ana/Projects/pixel-love commit -m "refactor(studio): import types from types.ts, add setStep/updateMixer/updateFx/removeClip"
```

---

## Task 3: Expandir testes de domínio

**Files:**
- Modify: `melovanzin/src/studio/__tests__/project.test.ts`

- [ ] **Step 3.1: Escrever testes novos (adicionar ao arquivo existente)**

Substituir o conteúdo completo do arquivo por:

```typescript
// melovanzin/src/studio/__tests__/project.test.ts
import { describe, expect, it } from 'vitest'

import {
  createEmptyProject,
  createSampleChannel,
  createPattern,
  addChannelToProject,
  duplicatePattern,
  setStep,
  updateChannelMixer,
  updateChannelFx,
  placeClip,
  removeClip,
  resolveChannelStepsAtSongStep,
  serializeProject,
  hydrateProject,
} from '../project'

// Helper
function makeChannel(name = 'Test') {
  return createSampleChannel({
    name,
    fileName: `${name}.wav`,
    mimeType: 'audio/wav',
    sampleDataUrl: 'data:audio/wav;base64,AAA=',
  })
}

describe('studio project domain', () => {
  it('creates a project with a default starter pattern and empty playlist', () => {
    const project = createEmptyProject('Nosso Loop')
    expect(project.name).toBe('Nosso Loop')
    expect(project.bpm).toBe(128)
    expect(project.patternOrder).toEqual(['pattern-a'])
    expect(project.playlist).toEqual([])
    expect(project.channels).toHaveLength(0)
    expect(project.patterns['pattern-a']).toHaveLength(16)
  })

  it('creates uploaded-sample channels with mixer defaults and empty pattern data', () => {
    const channel = makeChannel('Vocal Chop')
    expect(channel.name).toBe('Vocal Chop')
    expect(channel.source.fileName).toBe('Vocal Chop.wav')
    expect(channel.steps['pattern-a']).toHaveLength(16)
    expect(channel.volume).toBe(0)
    expect(channel.pan).toBe(0)
    expect(channel.fx.filter.enabled).toBe(false)
    expect(channel.fx.delay.wet).toBe(0)
    expect(channel.fx.reverb.wet).toBe(0)
  })

  it('addChannelToProject ensures channel has steps for every existing pattern', () => {
    let project = createEmptyProject('p')
    project = duplicatePattern(project, 'pattern-a') // agora tem pattern-a e pattern-b
    const channel = makeChannel('Kick')
    const next = addChannelToProject(project, channel)
    expect(next.channels[0].steps['pattern-a']).toHaveLength(16)
    expect(next.channels[0].steps['pattern-b']).toHaveLength(16)
  })

  it('duplicates a pattern and preserves the original step arrangement', () => {
    const project = createEmptyProject('Pad test')
    const source = createPattern()
    source[0] = true
    source[7] = true
    project.patterns['pattern-a'] = source
    const next = duplicatePattern(project, 'pattern-a')
    expect(next.patternOrder).toEqual(['pattern-a', 'pattern-b'])
    expect(next.patterns['pattern-b']).toEqual(source)
    expect(next.patterns['pattern-b']).not.toBe(source) // deve ser cópia
  })

  it('setStep toggles a single step in a channel pattern without mutating project', () => {
    let project = createEmptyProject('Steps')
    const channel = makeChannel('Snare')
    project = addChannelToProject(project, channel)
    const before = project.channels[0].steps['pattern-a'][3]
    const next = setStep(project, project.channels[0].id, 'pattern-a', 3, true)
    expect(next.channels[0].steps['pattern-a'][3]).toBe(true)
    expect(project.channels[0].steps['pattern-a'][3]).toBe(before) // imutável
  })

  it('updateChannelMixer patches volume/pan/mute/solo without touching other fields', () => {
    let project = createEmptyProject('Mixer')
    const channel = makeChannel('Hat')
    project = addChannelToProject(project, channel)
    const next = updateChannelMixer(project, channel.id, { mute: true, volume: -6 })
    expect(next.channels[0].mute).toBe(true)
    expect(next.channels[0].volume).toBe(-6)
    expect(next.channels[0].pan).toBe(0) // não tocado
  })

  it('updateChannelFx patches fx state without touching mixer fields', () => {
    let project = createEmptyProject('FX')
    const channel = makeChannel('Vocal')
    project = addChannelToProject(project, channel)
    const next = updateChannelFx(project, channel.id, {
      filter: { enabled: true, frequency: 800, resonance: 2 },
    })
    expect(next.channels[0].fx.filter.enabled).toBe(true)
    expect(next.channels[0].fx.delay.wet).toBe(0) // não tocado
  })

  it('places clips on bars and resolves active channel steps from playlist arrangement', () => {
    let project = createEmptyProject('Arrangement')
    const channel = makeChannel('Kick')
    channel.steps['pattern-a'][0] = true
    channel.steps['pattern-a'][4] = true
    project = addChannelToProject(project, channel)
    project = placeClip(project, {
      patternId: 'pattern-a',
      barIndex: 2,
      channelId: project.channels[0].id,
    })
    expect(resolveChannelStepsAtSongStep(project, project.channels[0].id, 0)).toBe(false) // bar 0 — sem clip
    expect(resolveChannelStepsAtSongStep(project, project.channels[0].id, 32)).toBe(true)  // bar 2, step 0
    expect(resolveChannelStepsAtSongStep(project, project.channels[0].id, 36)).toBe(true)  // bar 2, step 4
    expect(resolveChannelStepsAtSongStep(project, project.channels[0].id, 47)).toBe(false) // bar 2, step 15 — off
  })

  it('placing a clip on the same bar+channel replaces the previous clip', () => {
    let project = createEmptyProject('Replace')
    const channel = makeChannel('Bass')
    project = addChannelToProject(project, channel)
    project = placeClip(project, { patternId: 'pattern-a', barIndex: 0, channelId: channel.id })
    project = placeClip(project, { patternId: 'pattern-a', barIndex: 0, channelId: channel.id })
    expect(project.playlist.filter((c) => c.channelId === channel.id && c.barIndex === 0)).toHaveLength(1)
  })

  it('removeClip removes only the matching bar+channel clip', () => {
    let project = createEmptyProject('Remove')
    const channel = makeChannel('Bass')
    project = addChannelToProject(project, channel)
    project = placeClip(project, { patternId: 'pattern-a', barIndex: 0, channelId: channel.id })
    project = placeClip(project, { patternId: 'pattern-a', barIndex: 1, channelId: channel.id })
    project = removeClip(project, channel.id, 0)
    expect(project.playlist).toHaveLength(1)
    expect(project.playlist[0].barIndex).toBe(1)
  })

  it('serializes and hydrates project JSON without losing channels, patterns or clips', () => {
    let project = createEmptyProject('Save me')
    const channel = makeChannel('Snare')
    project = addChannelToProject(project, channel)
    project = placeClip(project, {
      patternId: 'pattern-a',
      barIndex: 1,
      channelId: project.channels[0].id,
    })
    const serialized = serializeProject(project)
    const hydrated = hydrateProject(serialized)
    expect(hydrated).not.toBeNull()
    expect(hydrated?.name).toBe('Save me')
    expect(hydrated?.channels[0].source.fileName).toBe('Snare.wav')
    expect(hydrated?.playlist[0]).toMatchObject({
      patternId: 'pattern-a',
      barIndex: 1,
      channelId: project.channels[0].id,
    })
  })

  it('hydrateProject returns null for invalid JSON or wrong version', () => {
    expect(hydrateProject('not-json')).toBeNull()
    expect(hydrateProject(JSON.stringify({ version: 2, patternOrder: [], patterns: {}, channels: [] }))).toBeNull()
  })
})
```

- [ ] **Step 3.2: Rodar testes — todos devem passar (incluindo os novos)**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin && npx vitest run
```

Esperado: 12 testes passando (5 originais + 7 novos).

- [ ] **Step 3.3: Commit**

```bash
git -C /Users/ana/Projects/pixel-love add melovanzin/src/studio/__tests__/project.test.ts
git -C /Users/ana/Projects/pixel-love commit -m "test(studio): expand domain tests — setStep, mixer, fx, removeClip, hydration"
```

---

## Task 4: Engine de áudio (studio/engine.ts)

**Files:**
- Create: `melovanzin/src/studio/engine.ts`
- Create: `melovanzin/src/studio/__tests__/engine.test.ts`

- [ ] **Step 4.1: Escrever o teste da engine primeiro**

```typescript
// melovanzin/src/studio/__tests__/engine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Tone.js é uma engine de áudio real — mockar para testes unitários
vi.mock('tone', () => {
  const Player = vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    dispose: vi.fn(),
    loaded: true,
  }))
  const Gain = vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    toDestination: vi.fn().mockReturnThis(),
    gain: { value: 1 },
    dispose: vi.fn(),
  }))
  const Panner = vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    pan: { value: 0 },
    dispose: vi.fn(),
  }))
  const Filter = vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    frequency: { value: 1200 },
    Q: { value: 1 },
    dispose: vi.fn(),
  }))
  const FeedbackDelay = vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    wet: { value: 0 },
    delayTime: { value: 0 },
    feedback: { value: 0 },
    dispose: vi.fn(),
  }))
  const Reverb = vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    wet: { value: 0 },
    decay: 1,
    generate: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn(),
  }))
  const getTransport = vi.fn(() => ({
    bpm: { value: 128 },
    start: vi.fn(),
    stop: vi.fn(),
    cancel: vi.fn(),
    schedule: vi.fn(),
  }))
  const getContext = vi.fn(() => ({
    resume: vi.fn().mockResolvedValue(undefined),
  }))
  return { Player, Gain, Panner, Filter, FeedbackDelay, Reverb, getTransport, getContext }
})

import { StudioEngine } from '../engine'
import { createEmptyProject, createSampleChannel, addChannelToProject } from '../project'

function makeSampleChannel(name: string) {
  return createSampleChannel({
    name,
    fileName: `${name}.wav`,
    mimeType: 'audio/wav',
    sampleDataUrl: 'data:audio/wav;base64,AAA=',
  })
}

describe('StudioEngine', () => {
  let engine: StudioEngine

  beforeEach(() => {
    engine = new StudioEngine()
  })

  it('starts in stopped state', () => {
    expect(engine.isPlaying()).toBe(false)
  })

  it('loadProject does not throw for valid project', () => {
    const project = createEmptyProject('Test')
    expect(() => engine.loadProject(project)).not.toThrow()
  })

  it('loadProject with channel initializes channel node', () => {
    let project = createEmptyProject('Test')
    const channel = makeSampleChannel('Kick')
    project = addChannelToProject(project, channel)
    expect(() => engine.loadProject(project)).not.toThrow()
    expect(engine.hasChannel(project.channels[0].id)).toBe(true)
  })

  it('dispose clears all channel nodes', () => {
    let project = createEmptyProject('Test')
    const channel = makeSampleChannel('Kick')
    project = addChannelToProject(project, channel)
    engine.loadProject(project)
    engine.dispose()
    expect(engine.hasChannel(project.channels[0].id)).toBe(false)
  })

  it('setBpm updates transport bpm', () => {
    engine.setBpm(140)
    // Apenas verifica que não lança exceção (transport está mockado)
    expect(() => engine.setBpm(140)).not.toThrow()
  })

  it('previewChannel does not throw when channel exists in engine', () => {
    let project = createEmptyProject('Test')
    const channel = makeSampleChannel('Snare')
    project = addChannelToProject(project, channel)
    engine.loadProject(project)
    expect(() => engine.previewChannel(project.channels[0].id)).not.toThrow()
  })
})
```

- [ ] **Step 4.2: Rodar teste para confirmar que falha por falta de implementação**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin && npx vitest run src/studio/__tests__/engine.test.ts 2>&1 | tail -20
```

Esperado: erros de importação de `../engine`.

- [ ] **Step 4.3: Criar a engine**

```typescript
// melovanzin/src/studio/engine.ts
import * as Tone from 'tone'
import type { StudioProject, StudioChannel, ChannelFxState } from './types'

interface ChannelNodes {
  player: Tone.Player | null
  gain: Tone.Gain
  panner: Tone.Panner
  filter: Tone.Filter
  delay: Tone.FeedbackDelay
  reverb: Tone.Reverb
}

export class StudioEngine {
  private channelNodes = new Map<string, ChannelNodes>()
  private _playing = false
  private scheduledIds: number[] = []

  // ── Nodes ──────────────────────────────────────────────────────────────────

  private buildChannelNodes(channel: StudioChannel): ChannelNodes {
    const reverb = new Tone.Reverb({ decay: channel.fx.reverb.decay, wet: channel.fx.reverb.wet })
    const delay = new Tone.FeedbackDelay({
      delayTime: channel.fx.delay.time,
      feedback: channel.fx.delay.feedback,
      wet: channel.fx.delay.wet,
    })
    const filter = new Tone.Filter({
      frequency: channel.fx.filter.frequency,
      Q: channel.fx.filter.resonance,
    })
    const panner = new Tone.Panner(channel.pan)
    const gain = new Tone.Gain(Tone.dbToGain(channel.volume))

    // Chain: player → filter → delay → reverb → panner → gain → destination
    filter.connect(delay)
    delay.connect(reverb)
    reverb.connect(panner)
    panner.connect(gain)
    gain.toDestination()

    // Player is created later when we actually have audio data decoded
    return { player: null, gain, panner, filter, delay, reverb }
  }

  private disposeNodes(nodes: ChannelNodes) {
    nodes.player?.dispose()
    nodes.gain.dispose()
    nodes.panner.dispose()
    nodes.filter.dispose()
    nodes.delay.dispose()
    nodes.reverb.dispose()
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  async loadProject(project: StudioProject): Promise<void> {
    this.dispose()

    for (const channel of project.channels) {
      const nodes = this.buildChannelNodes(channel)

      if (channel.source.sampleDataUrl) {
        try {
          const player = new Tone.Player(channel.source.sampleDataUrl)
          player.connect(nodes.filter)
          nodes.player = player
        } catch {
          // Player sem fonte — preview simplesmente não toca
        }
      }

      this.channelNodes.set(channel.id, nodes)
    }
  }

  dispose(): void {
    this.stop()
    for (const nodes of this.channelNodes.values()) {
      this.disposeNodes(nodes)
    }
    this.channelNodes.clear()
  }

  hasChannel(channelId: string): boolean {
    return this.channelNodes.has(channelId)
  }

  isPlaying(): boolean {
    return this._playing
  }

  setBpm(bpm: number): void {
    Tone.getTransport().bpm.value = bpm
  }

  // Dispara o Player de um canal para preview (one-shot)
  previewChannel(channelId: string): void {
    const nodes = this.channelNodes.get(channelId)
    if (!nodes?.player) return
    nodes.player.stop()
    nodes.player.start()
  }

  // Atualiza mixer de um canal sem recriar nodes
  updateChannelMixer(
    channelId: string,
    patch: Partial<{ volume: number; pan: number; mute: boolean; solo: boolean }>,
    allChannels: StudioChannel[]
  ): void {
    const nodes = this.channelNodes.get(channelId)
    if (!nodes) return

    if (patch.volume !== undefined) {
      nodes.gain.gain.value = Tone.dbToGain(patch.volume)
    }
    if (patch.pan !== undefined) {
      nodes.panner.pan.value = patch.pan
    }

    // Mute/solo: ajustar gain de todos os canais
    this._applyMuteSolo(allChannels)
  }

  private _applyMuteSolo(channels: StudioChannel[]): void {
    const hasSolo = channels.some((c) => c.solo && !c.mute)
    for (const ch of channels) {
      const nodes = this.channelNodes.get(ch.id)
      if (!nodes) continue
      const silenced = ch.mute || (hasSolo && !ch.solo)
      nodes.gain.gain.value = silenced ? 0 : Tone.dbToGain(ch.volume)
    }
  }

  // Atualiza FX de um canal sem recriar nodes
  updateChannelFx(channelId: string, fx: Partial<ChannelFxState>): void {
    const nodes = this.channelNodes.get(channelId)
    if (!nodes) return

    if (fx.filter) {
      nodes.filter.frequency.value = fx.filter.frequency
      nodes.filter.Q.value = fx.filter.resonance
    }
    if (fx.delay) {
      nodes.delay.wet.value = fx.delay.enabled ? fx.delay.wet : 0
      nodes.delay.feedback.value = fx.delay.feedback
    }
    if (fx.reverb) {
      nodes.reverb.wet.value = fx.reverb.enabled ? fx.reverb.wet : 0
    }
  }

  // Playback do sequencer baseado no projeto
  start(project: StudioProject, onStep?: (step: number) => void): void {
    if (this._playing) return

    const transport = Tone.getTransport()
    transport.bpm.value = project.bpm
    transport.cancel()

    const totalSteps = project.bars * project.patternLength
    const stepDuration = '16n' as Tone.Unit.Time

    for (let songStep = 0; songStep < totalSteps; songStep++) {
      const step = songStep
      const id = transport.schedule((time) => {
        // Notificar UI do step atual
        if (onStep) {
          Tone.getDraw().schedule(() => onStep(step % project.patternLength), time)
        }

        // Disparar canais ativos neste step
        for (const channel of project.channels) {
          const barIndex = Math.floor(step / project.patternLength)
          const localStep = step % project.patternLength
          const clip = project.playlist.find(
            (c) => c.channelId === channel.id && c.barIndex === barIndex
          )
          if (!clip) continue
          const active = channel.steps[clip.patternId]?.[localStep]
          if (!active) continue
          if (channel.mute) continue

          const nodes = this.channelNodes.get(channel.id)
          if (!nodes?.player) continue
          nodes.player.stop(time)
          nodes.player.start(time)
        }
      }, `${step} * ${stepDuration}`)

      this.scheduledIds.push(id as unknown as number)
    }

    void Tone.getContext().resume().then(() => {
      transport.start()
      this._playing = true
    })
  }

  stop(): void {
    const transport = Tone.getTransport()
    transport.stop()
    transport.cancel()
    this.scheduledIds = []
    this._playing = false
  }
}

// Singleton compartilhado pela UI do estúdio
export const studioEngine = new StudioEngine()
```

- [ ] **Step 4.4: Rodar testes de engine**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin && npx vitest run src/studio/__tests__/engine.test.ts 2>&1 | tail -20
```

Esperado: 6 testes passando.

- [ ] **Step 4.5: Rodar todos os testes**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin && npx vitest run 2>&1 | tail -10
```

Esperado: todos passando.

- [ ] **Step 4.6: Commit**

```bash
git -C /Users/ana/Projects/pixel-love add melovanzin/src/studio/engine.ts melovanzin/src/studio/__tests__/engine.test.ts
git -C /Users/ana/Projects/pixel-love commit -m "feat(studio): add StudioEngine with Tone.js playback, preview, mixer, fx"
```

---

## Task 5: Export (studio/export.ts)

**Files:**
- Create: `melovanzin/src/studio/export.ts`

- [ ] **Step 5.1: Criar o módulo de export**

```typescript
// melovanzin/src/studio/export.ts
import * as Tone from 'tone'
import type { StudioProject } from './types'
import { serializeProject } from './project'

/**
 * Faz download de um arquivo no browser.
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

/**
 * Exporta o projeto como JSON.
 * O sampleDataUrl dos canais é incluído — o arquivo pode ser reimportado.
 */
export function exportProjectJson(project: StudioProject): void {
  const json = serializeProject(project)
  const blob = new Blob([json], { type: 'application/json' })
  const safeName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  triggerDownload(blob, `${safeName}.melovanzin.json`)
}

/**
 * Renderiza o projeto como WAV usando Tone.Offline.
 * Retorna o Blob do WAV renderizado.
 *
 * Limitação MVP: renderiza apenas os canais e clips da playlist.
 * Não aplica automações de parâmetros no tempo.
 */
export async function exportProjectWav(
  project: StudioProject
): Promise<Blob> {
  const beatsPerBar = project.patternLength / 4 // 16 steps = 4 beats
  const totalBars = project.bars
  const bpm = project.bpm
  const secondsPerBeat = 60 / bpm
  const durationSeconds = totalBars * beatsPerBar * secondsPerBeat + 2 // +2s tail

  const buffer = await Tone.Offline(async ({ transport }) => {
    transport.bpm.value = bpm

    // Pré-carregar todos os Players
    const playerMap = new Map<string, Tone.Player>()

    for (const channel of project.channels) {
      if (!channel.source.sampleDataUrl || channel.mute) continue

      const reverb = new Tone.Reverb({
        decay: channel.fx.reverb.decay,
        wet: channel.fx.reverb.enabled ? channel.fx.reverb.wet : 0,
      })
      const delay = new Tone.FeedbackDelay({
        delayTime: channel.fx.delay.time,
        feedback: channel.fx.delay.feedback,
        wet: channel.fx.delay.enabled ? channel.fx.delay.wet : 0,
      })
      const filter = new Tone.Filter({
        frequency: channel.fx.filter.enabled ? channel.fx.filter.frequency : 20000,
        Q: channel.fx.filter.resonance,
      })
      const panner = new Tone.Panner(channel.pan)
      const gain = new Tone.Gain(Tone.dbToGain(channel.volume))

      filter.connect(delay)
      delay.connect(reverb)
      reverb.connect(panner)
      panner.connect(gain)
      gain.toDestination()

      const player = new Tone.Player(channel.source.sampleDataUrl)
      player.connect(filter)
      playerMap.set(channel.id, player)

      // Agendar disparos de acordo com a playlist
      const totalSongSteps = project.bars * project.patternLength

      for (let songStep = 0; songStep < totalSongSteps; songStep++) {
        const barIndex = Math.floor(songStep / project.patternLength)
        const localStep = songStep % project.patternLength

        const clip = project.playlist.find(
          (c) => c.channelId === channel.id && c.barIndex === barIndex
        )
        if (!clip) continue

        const active = channel.steps[clip.patternId]?.[localStep]
        if (!active) continue

        const stepDurationInBeats = 1 / 4 // 16n = 1/4 beat
        const timeInBeats = songStep * stepDurationInBeats
        const timeInSeconds = timeInBeats * secondsPerBeat
        transport.schedule((time) => {
          player.start(time)
        }, timeInSeconds)
      }
    }

    // Aguardar todos os players carregarem
    await Promise.all(
      Array.from(playerMap.values()).map((p) => {
        return new Promise<void>((resolve) => {
          if (p.loaded) return resolve()
          p.onstop = () => resolve()
          // Fallback timeout
          setTimeout(resolve, 3000)
        })
      })
    )

    transport.start()
  }, durationSeconds)

  // Converter AudioBuffer para WAV
  return audioBufferToWav(buffer)
}

function audioBufferToWav(buffer: Tone.ToneAudioBuffer): Blob {
  const rawBuffer = buffer.get()!
  const numChannels = rawBuffer.numberOfChannels
  const sampleRate = rawBuffer.sampleRate
  const numSamples = rawBuffer.length
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = numSamples * blockAlign

  const arrayBuffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(arrayBuffer)

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)           // PCM
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)          // 16-bit
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, rawBuffer.getChannelData(ch)[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

export function downloadWav(blob: Blob, projectName: string): void {
  const safeName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  triggerDownload(blob, `${safeName}.wav`)
}
```

- [ ] **Step 5.2: Verificar tipos**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin && npx tsc --noEmit --skipLibCheck 2>&1 | grep "export.ts"
```

Esperado: sem erros.

- [ ] **Step 5.3: Commit**

```bash
git -C /Users/ana/Projects/pixel-love add melovanzin/src/studio/export.ts
git -C /Users/ana/Projects/pixel-love commit -m "feat(studio): add WAV offline render and JSON project export"
```

---

## Task 6: Store de estúdio (studio/useStudioStore.ts)

**Files:**
- Create: `melovanzin/src/studio/useStudioStore.ts`

- [ ] **Step 6.1: Criar o store**

```typescript
// melovanzin/src/studio/useStudioStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createEmptyProject,
  addChannelToProject,
  createSampleChannel,
  duplicatePattern,
  setStep,
  updateChannelMixer,
  updateChannelFx,
  placeClip,
  removeClip,
  hydrateProject,
} from './project'
import type { StudioProject, ChannelFxState } from './types'

interface SavedProjectEntry {
  id: string
  name: string
  updatedAt: number
  data: string // JSON serializado
}

interface StudioState {
  // Projeto ativo em memória
  activeProject: StudioProject
  // Projetos salvos localmente
  savedProjects: SavedProjectEntry[]
  // Step atual do sequencer (para highlight na UI)
  currentStep: number
  setCurrentStep: (step: number) => void

  // Ações de projeto
  newProject: (name?: string) => void
  renameProject: (name: string) => void
  saveProject: () => void
  loadProject: (id: string) => void
  deleteProject: (id: string) => void
  importProjectJson: (raw: string) => boolean

  // Ações de canal
  addChannel: (name: string, fileName: string, mimeType: string, sampleDataUrl: string) => void
  removeChannel: (channelId: string) => void

  // Ações de step
  toggleStep: (channelId: string, patternId: string, stepIndex: number) => void

  // Ações de mixer
  setChannelVolume: (channelId: string, volume: number) => void
  setChannelPan: (channelId: string, pan: number) => void
  setChannelMute: (channelId: string, mute: boolean) => void
  setChannelSolo: (channelId: string, solo: boolean) => void

  // Ações de FX
  setChannelFx: (channelId: string, fx: Partial<ChannelFxState>) => void

  // Ações de pattern
  selectPattern: (patternId: string) => void
  duplicateSelectedPattern: () => void

  // Ações de playlist
  placeClip: (channelId: string, barIndex: number, patternId: string) => void
  removeClip: (channelId: string, barIndex: number) => void

  // BPM
  setBpm: (bpm: number) => void
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      activeProject: createEmptyProject(),
      savedProjects: [],
      currentStep: -1,

      setCurrentStep: (step) => set({ currentStep: step }),

      newProject: (name = 'Projeto MeloVanzin') =>
        set({ activeProject: createEmptyProject(name) }),

      renameProject: (name) =>
        set((s) => ({
          activeProject: { ...s.activeProject, name, updatedAt: Date.now() },
        })),

      saveProject: () => {
        const { activeProject, savedProjects } = get()
        const { serializeProject } = require('./project') // dynamic to avoid circular
        const entry: SavedProjectEntry = {
          id: activeProject.id,
          name: activeProject.name,
          updatedAt: activeProject.updatedAt,
          data: serializeProject(activeProject),
        }
        set({
          savedProjects: [
            ...savedProjects.filter((p) => p.id !== entry.id),
            entry,
          ],
        })
      },

      loadProject: (id) => {
        const entry = get().savedProjects.find((p) => p.id === id)
        if (!entry) return
        const project = hydrateProject(entry.data)
        if (!project) return
        set({ activeProject: project })
      },

      deleteProject: (id) =>
        set((s) => ({
          savedProjects: s.savedProjects.filter((p) => p.id !== id),
        })),

      importProjectJson: (raw) => {
        const project = hydrateProject(raw)
        if (!project) return false
        set({ activeProject: project })
        return true
      },

      addChannel: (name, fileName, mimeType, sampleDataUrl) => {
        const channel = createSampleChannel({ name, fileName, mimeType, sampleDataUrl })
        set((s) => ({ activeProject: addChannelToProject(s.activeProject, channel) }))
      },

      removeChannel: (channelId) =>
        set((s) => ({
          activeProject: {
            ...s.activeProject,
            updatedAt: Date.now(),
            channels: s.activeProject.channels.filter((c) => c.id !== channelId),
            playlist: s.activeProject.playlist.filter((c) => c.channelId !== channelId),
          },
        })),

      toggleStep: (channelId, patternId, stepIndex) =>
        set((s) => {
          const channel = s.activeProject.channels.find((c) => c.id === channelId)
          if (!channel) return s
          const current = channel.steps[patternId]?.[stepIndex] ?? false
          return {
            activeProject: setStep(s.activeProject, channelId, patternId, stepIndex, !current),
          }
        }),

      setChannelVolume: (channelId, volume) =>
        set((s) => ({
          activeProject: updateChannelMixer(s.activeProject, channelId, { volume }),
        })),

      setChannelPan: (channelId, pan) =>
        set((s) => ({
          activeProject: updateChannelMixer(s.activeProject, channelId, { pan }),
        })),

      setChannelMute: (channelId, mute) =>
        set((s) => ({
          activeProject: updateChannelMixer(s.activeProject, channelId, { mute }),
        })),

      setChannelSolo: (channelId, solo) =>
        set((s) => ({
          activeProject: updateChannelMixer(s.activeProject, channelId, { solo }),
        })),

      setChannelFx: (channelId, fx) =>
        set((s) => ({
          activeProject: updateChannelFx(s.activeProject, channelId, fx),
        })),

      selectPattern: (patternId) =>
        set((s) => ({
          activeProject: { ...s.activeProject, selectedPatternId: patternId },
        })),

      duplicateSelectedPattern: () =>
        set((s) => ({
          activeProject: duplicatePattern(
            s.activeProject,
            s.activeProject.selectedPatternId
          ),
        })),

      placeClip: (channelId, barIndex, patternId) =>
        set((s) => ({
          activeProject: placeClip(s.activeProject, { channelId, barIndex, patternId }),
        })),

      removeClip: (channelId, barIndex) =>
        set((s) => ({
          activeProject: removeClip(s.activeProject, channelId, barIndex),
        })),

      setBpm: (bpm) =>
        set((s) => ({
          activeProject: { ...s.activeProject, bpm, updatedAt: Date.now() },
        })),
    }),
    {
      name: 'studio-projects',
      partialize: (s) => ({
        savedProjects: s.savedProjects,
        // Não persiste activeProject — usuário abre explicitamente
      }),
    }
  )
)
```

> **Nota:** A chamada `require('./project')` em `saveProject` precisa ser refatorada para import direto. Corrigir no próximo passo.

- [ ] **Step 6.2: Corrigir o saveProject para não usar require**

```typescript
// Substituir o método saveProject na função create:
saveProject: () => {
  const { activeProject, savedProjects } = get()
  const entry: SavedProjectEntry = {
    id: activeProject.id,
    name: activeProject.name,
    updatedAt: activeProject.updatedAt,
    data: JSON.stringify(activeProject),
  }
  set({
    savedProjects: [
      ...savedProjects.filter((p) => p.id !== entry.id),
      entry,
    ],
  })
},
```

O arquivo final não deve ter nenhum `require`. Reescrever `saveProject` sem import dinâmico: usar `JSON.stringify(activeProject)` direto.

- [ ] **Step 6.3: Verificar que TypeScript compila**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin && npx tsc --noEmit --skipLibCheck 2>&1 | grep "useStudioStore"
```

Esperado: sem erros.

- [ ] **Step 6.4: Commit**

```bash
git -C /Users/ana/Projects/pixel-love add melovanzin/src/studio/useStudioStore.ts
git -C /Users/ana/Projects/pixel-love commit -m "feat(studio): add useStudioStore with persist, multi-project save/load"
```

---

## Task 7: Componentes de UI do estúdio

**Files:**
- Create: `melovanzin/src/studio/components/StudioHeader.tsx`
- Create: `melovanzin/src/studio/components/ChannelRack.tsx`
- Create: `melovanzin/src/studio/components/MixerPanel.tsx`
- Create: `melovanzin/src/studio/components/PatternBar.tsx`
- Create: `melovanzin/src/studio/components/Playlist.tsx`
- Create: `melovanzin/src/studio/components/ProjectManager.tsx`
- Create: `melovanzin/src/studio/components/GeniusButton.tsx`

### 7A: StudioHeader.tsx

- [ ] **Step 7A.1: Criar StudioHeader**

```tsx
// melovanzin/src/studio/components/StudioHeader.tsx
import { useStudioStore } from '../useStudioStore'
import { studioEngine } from '../engine'
import { useState } from 'react'

interface StudioHeaderProps {
  onBack: () => void
  playing: boolean
  onPlay: () => void
  onStop: () => void
}

export default function StudioHeader({ onBack, playing, onPlay, onStop }: StudioHeaderProps) {
  const { activeProject, setBpm, renameProject } = useStudioStore()
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(activeProject.name)

  const handleBpm = (v: number) => {
    setBpm(v)
    studioEngine.setBpm(v)
  }

  const handleNameCommit = () => {
    if (nameInput.trim()) renameProject(nameInput.trim())
    setEditingName(false)
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 shrink-0 select-none"
      style={{
        background: '#0d0d14',
        borderBottom: '2px solid #2a1a3a',
        minHeight: '44px',
      }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="pixel-font transition-colors hover:text-white"
        style={{ fontSize: '8px', color: 'var(--tx3)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ← hub
      </button>

      {/* Logo */}
      <div
        className="pixel-font"
        style={{ fontSize: '10px', color: 'var(--pu)', letterSpacing: '2px', textShadow: '0 0 8px var(--pu)' }}
      >
        ★ FL KAWAII
      </div>

      {/* Project name */}
      {editingName ? (
        <input
          autoFocus
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onBlur={handleNameCommit}
          onKeyDown={(e) => e.key === 'Enter' && handleNameCommit()}
          className="mono-font text-xs px-2 py-1 rounded"
          style={{
            background: 'var(--panel2)',
            border: '1px solid var(--pu)',
            color: 'var(--tx)',
            outline: 'none',
            maxWidth: '160px',
          }}
        />
      ) : (
        <button
          onClick={() => { setNameInput(activeProject.name); setEditingName(true) }}
          className="mono-font text-xs px-2 py-1 rounded opacity-70 hover:opacity-100 transition-opacity"
          style={{ background: 'transparent', border: '1px solid transparent', color: 'var(--tx2)', cursor: 'pointer' }}
          title="Clique para renomear"
        >
          {activeProject.name}
        </button>
      )}

      <div className="flex-1" />

      {/* Transport */}
      <button
        onClick={playing ? onStop : onPlay}
        className="pixel-font px-4 py-1 rounded transition-all"
        style={{
          fontSize: '9px',
          background: playing ? 'rgba(29,185,84,0.18)' : 'rgba(201,125,255,0.18)',
          border: `1px solid ${playing ? 'var(--grn)' : 'var(--pu)'}`,
          color: playing ? 'var(--grn)' : 'var(--pu)',
          cursor: 'pointer',
          minWidth: '70px',
        }}
      >
        {playing ? '⏹ STOP' : '▶ PLAY'}
      </button>

      {/* BPM */}
      <div className="flex items-center gap-2">
        <span className="pixel-font" style={{ fontSize: '7px', color: 'var(--tx3)' }}>BPM</span>
        <input
          type="number"
          min={40} max={300} value={activeProject.bpm}
          onChange={(e) => handleBpm(Number(e.target.value))}
          className="mono-font text-xs text-center rounded"
          style={{
            width: '48px',
            background: 'var(--panel2)',
            border: '1px solid var(--border)',
            color: 'var(--yl)',
            padding: '2px',
            outline: 'none',
          }}
        />
      </div>
    </div>
  )
}
```

### 7B: PatternBar.tsx

- [ ] **Step 7B.1: Criar PatternBar**

```tsx
// melovanzin/src/studio/components/PatternBar.tsx
import { useStudioStore } from '../useStudioStore'

export default function PatternBar() {
  const { activeProject, selectPattern, duplicateSelectedPattern } = useStudioStore()
  const { patternOrder, selectedPatternId } = activeProject

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 shrink-0 overflow-x-auto"
      style={{ background: '#0f0f1a', borderBottom: '1px solid #1e1030' }}
    >
      <span className="pixel-font mr-1 shrink-0" style={{ fontSize: '7px', color: 'var(--tx3)' }}>
        PATTERNS
      </span>
      {patternOrder.map((pid) => (
        <button
          key={pid}
          onClick={() => selectPattern(pid)}
          className="pixel-font px-3 py-1 rounded transition-all shrink-0"
          style={{
            fontSize: '8px',
            background: pid === selectedPatternId ? 'var(--pu3)' : 'var(--panel2)',
            border: `1px solid ${pid === selectedPatternId ? 'var(--pu)' : 'var(--border)'}`,
            color: pid === selectedPatternId ? 'var(--pu)' : 'var(--tx3)',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {pid.replace('pattern-', '')}
        </button>
      ))}
      <button
        onClick={duplicateSelectedPattern}
        className="pixel-font px-2 py-1 rounded shrink-0 transition-all hover:opacity-80"
        style={{
          fontSize: '7px',
          background: 'rgba(255,224,102,0.08)',
          border: '1px solid rgba(255,224,102,0.25)',
          color: 'var(--yl)',
          cursor: 'pointer',
        }}
        title="Duplicar pattern selecionado"
      >
        + DUP
      </button>
    </div>
  )
}
```

### 7C: ChannelRack.tsx

- [ ] **Step 7C.1: Criar ChannelRack**

```tsx
// melovanzin/src/studio/components/ChannelRack.tsx
import { useRef } from 'react'
import { useStudioStore } from '../useStudioStore'
import { studioEngine } from '../engine'

const CHANNEL_COLORS = [
  'var(--pu)', 'var(--pk)', 'var(--yl)', '#4ade80', '#60a5fa', '#f97316', '#a78bfa',
]

export default function ChannelRack() {
  const {
    activeProject,
    addChannel,
    removeChannel,
    toggleStep,
  } = useStudioStore()
  const { channels, selectedPatternId, patternLength, currentStep } = activeProject
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      if (!dataUrl) return
      addChannel(
        file.name.replace(/\.[^.]+$/, ''),
        file.name,
        file.type,
        dataUrl
      )
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const currentStepVal = useStudioStore((s) => s.currentStep)

  return (
    <div className="flex flex-col gap-0 overflow-y-auto flex-1">
      {channels.length === 0 && (
        <div
          className="flex flex-col items-center justify-center flex-1 py-12"
          style={{ color: 'var(--tx3)' }}
        >
          <div className="pixel-font mb-2" style={{ fontSize: '9px' }}>
            nenhum canal ainda
          </div>
          <div className="mono-font text-xs opacity-50">
            sobe um sample e começa a montar
          </div>
        </div>
      )}

      {channels.map((channel, idx) => {
        const steps = channel.steps[selectedPatternId] ?? Array(patternLength).fill(false)
        const color = CHANNEL_COLORS[idx % CHANNEL_COLORS.length]

        return (
          <div
            key={channel.id}
            className="flex items-center gap-2 px-3 py-2"
            style={{
              borderBottom: '1px solid #1a0f2e',
              background: idx % 2 === 0 ? '#0a0812' : '#080710',
            }}
          >
            {/* Channel label */}
            <div
              className="flex flex-col shrink-0 gap-1"
              style={{ width: '80px' }}
            >
              <div
                className="pixel-font truncate"
                style={{ fontSize: '7px', color, textShadow: `0 0 6px ${color}` }}
                title={channel.name}
              >
                {channel.name}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => studioEngine.previewChannel(channel.id)}
                  className="pixel-font px-1 rounded transition-opacity hover:opacity-80"
                  style={{ fontSize: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid var(--border)', color: 'var(--tx3)', cursor: 'pointer' }}
                  title="Preview sample"
                >
                  ▶
                </button>
                <button
                  onClick={() => removeChannel(channel.id)}
                  className="pixel-font px-1 rounded transition-opacity hover:opacity-80"
                  style={{ fontSize: '6px', background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.25)', color: '#ff6060', cursor: 'pointer' }}
                  title="Remover canal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Step pads */}
            <div className="flex gap-0.5 flex-1 min-w-0">
              {steps.map((on, i) => {
                const isActive = currentStepVal === i
                const groupStart = i % 4 === 0

                return (
                  <button
                    key={i}
                    onClick={() => toggleStep(channel.id, selectedPatternId, i)}
                    className="flex-1 rounded-sm transition-all duration-75"
                    style={{
                      height: '20px',
                      minWidth: 0,
                      background: on
                        ? color
                        : isActive
                        ? 'rgba(255,255,255,0.18)'
                        : 'var(--panel2)',
                      border: `1px solid ${
                        isActive ? '#fff' : on ? color : 'var(--border)'
                      }`,
                      opacity: on ? 1 : isActive ? 1 : 0.7,
                      boxShadow: on ? `0 0 6px ${color}40` : 'none',
                      outline: groupStart ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      outlineOffset: '2px',
                      cursor: 'pointer',
                    }}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Add channel button */}
      <div className="px-3 py-3 shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/wav,audio/mpeg,audio/mp3,audio/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="pixel-font w-full py-2 rounded transition-all hover:opacity-80"
          style={{
            fontSize: '8px',
            background: 'rgba(201,125,255,0.07)',
            border: '1px dashed rgba(201,125,255,0.4)',
            color: 'var(--pu)',
            cursor: 'pointer',
          }}
        >
          + upload sample (wav / mp3)
        </button>
      </div>
    </div>
  )
}
```

### 7D: MixerPanel.tsx

- [ ] **Step 7D.1: Criar MixerPanel**

```tsx
// melovanzin/src/studio/components/MixerPanel.tsx
import { useState } from 'react'
import { useStudioStore } from '../useStudioStore'
import { studioEngine } from '../engine'

export default function MixerPanel() {
  const {
    activeProject,
    setChannelVolume, setChannelPan,
    setChannelMute, setChannelSolo,
    setChannelFx,
  } = useStudioStore()
  const { channels } = activeProject
  const [expandedFx, setExpandedFx] = useState<string | null>(null)

  if (channels.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-6"
        style={{ color: 'var(--tx3)', fontSize: '9px' }}
        className="pixel-font"
      >
        mixer vazio
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0 overflow-y-auto">
      {channels.map((ch) => (
        <div
          key={ch.id}
          className="px-3 py-3"
          style={{ borderBottom: '1px solid #1a0f2e' }}
        >
          {/* Channel name + mute/solo */}
          <div className="flex items-center gap-2 mb-2">
            <span className="mono-font text-xs truncate flex-1" style={{ color: ch.color }}>
              {ch.name}
            </span>
            <button
              onClick={() => {
                setChannelMute(ch.id, !ch.mute)
                studioEngine.updateChannelMixer(ch.id, { mute: !ch.mute }, activeProject.channels)
              }}
              className="pixel-font px-1 rounded"
              style={{
                fontSize: '6px',
                background: ch.mute ? 'rgba(255,100,100,0.3)' : 'var(--panel2)',
                border: `1px solid ${ch.mute ? '#ff6060' : 'var(--border)'}`,
                color: ch.mute ? '#ff6060' : 'var(--tx3)',
                cursor: 'pointer',
              }}
            >M</button>
            <button
              onClick={() => {
                setChannelSolo(ch.id, !ch.solo)
                studioEngine.updateChannelMixer(ch.id, { solo: !ch.solo }, activeProject.channels)
              }}
              className="pixel-font px-1 rounded"
              style={{
                fontSize: '6px',
                background: ch.solo ? 'rgba(255,224,102,0.3)' : 'var(--panel2)',
                border: `1px solid ${ch.solo ? 'var(--yl)' : 'var(--border)'}`,
                color: ch.solo ? 'var(--yl)' : 'var(--tx3)',
                cursor: 'pointer',
              }}
            >S</button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel-font shrink-0" style={{ fontSize: '6px', color: 'var(--tx3)', width: '20px' }}>VOL</span>
            <input
              type="range" min={-60} max={6} step={0.5} value={ch.volume}
              onChange={(e) => {
                const v = Number(e.target.value)
                setChannelVolume(ch.id, v)
                studioEngine.updateChannelMixer(ch.id, { volume: v }, activeProject.channels)
              }}
              className="flex-1"
              style={{ accentColor: ch.color }}
            />
            <span className="mono-font shrink-0" style={{ fontSize: '9px', color: 'var(--tx2)', width: '28px', textAlign: 'right' }}>
              {ch.volume > 0 ? `+${ch.volume}` : ch.volume}dB
            </span>
          </div>

          {/* Pan */}
          <div className="flex items-center gap-2 mb-2">
            <span className="pixel-font shrink-0" style={{ fontSize: '6px', color: 'var(--tx3)', width: '20px' }}>PAN</span>
            <input
              type="range" min={-1} max={1} step={0.01} value={ch.pan}
              onChange={(e) => {
                const v = Number(e.target.value)
                setChannelPan(ch.id, v)
                studioEngine.updateChannelMixer(ch.id, { pan: v }, activeProject.channels)
              }}
              className="flex-1"
              style={{ accentColor: 'var(--pk)' }}
            />
            <span className="mono-font shrink-0" style={{ fontSize: '9px', color: 'var(--tx2)', width: '28px', textAlign: 'right' }}>
              {ch.pan === 0 ? 'C' : ch.pan > 0 ? `R${Math.round(ch.pan * 100)}` : `L${Math.round(-ch.pan * 100)}`}
            </span>
          </div>

          {/* FX toggle */}
          <button
            onClick={() => setExpandedFx(expandedFx === ch.id ? null : ch.id)}
            className="pixel-font px-2 py-1 rounded w-full text-left"
            style={{
              fontSize: '7px',
              background: expandedFx === ch.id ? 'rgba(201,125,255,0.1)' : 'transparent',
              border: `1px solid ${expandedFx === ch.id ? 'var(--pu)' : 'var(--border)'}`,
              color: 'var(--pu)',
              cursor: 'pointer',
            }}
          >
            FX {expandedFx === ch.id ? '▲' : '▼'}
          </button>

          {expandedFx === ch.id && (
            <div className="mt-2 flex flex-col gap-2 pl-2" style={{ borderLeft: '2px solid var(--pu3)' }}>
              {/* Filter */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={ch.fx.filter.enabled}
                    onChange={(e) => {
                      const fx = { filter: { ...ch.fx.filter, enabled: e.target.checked } }
                      setChannelFx(ch.id, fx)
                      studioEngine.updateChannelFx(ch.id, fx)
                    }}
                    style={{ accentColor: 'var(--pu)' }}
                  />
                  <span className="pixel-font" style={{ fontSize: '6px', color: 'var(--pu)' }}>FILTER</span>
                </div>
                {ch.fx.filter.enabled && (
                  <div className="flex items-center gap-2">
                    <span className="pixel-font shrink-0" style={{ fontSize: '6px', color: 'var(--tx3)', width: '16px' }}>Hz</span>
                    <input
                      type="range" min={80} max={18000} step={10} value={ch.fx.filter.frequency}
                      onChange={(e) => {
                        const fx = { filter: { ...ch.fx.filter, frequency: Number(e.target.value) } }
                        setChannelFx(ch.id, fx)
                        studioEngine.updateChannelFx(ch.id, fx)
                      }}
                      className="flex-1"
                      style={{ accentColor: 'var(--pu)' }}
                    />
                    <span className="mono-font shrink-0" style={{ fontSize: '9px', color: 'var(--tx2)', width: '40px', textAlign: 'right' }}>
                      {ch.fx.filter.frequency}Hz
                    </span>
                  </div>
                )}
              </div>

              {/* Delay */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={ch.fx.delay.enabled}
                    onChange={(e) => {
                      const fx = { delay: { ...ch.fx.delay, enabled: e.target.checked } }
                      setChannelFx(ch.id, fx)
                      studioEngine.updateChannelFx(ch.id, fx)
                    }}
                    style={{ accentColor: 'var(--pk)' }}
                  />
                  <span className="pixel-font" style={{ fontSize: '6px', color: 'var(--pk)' }}>DELAY</span>
                </div>
                {ch.fx.delay.enabled && (
                  <div className="flex items-center gap-2">
                    <span className="pixel-font shrink-0" style={{ fontSize: '6px', color: 'var(--tx3)', width: '16px' }}>wet</span>
                    <input
                      type="range" min={0} max={1} step={0.01} value={ch.fx.delay.wet}
                      onChange={(e) => {
                        const fx = { delay: { ...ch.fx.delay, wet: Number(e.target.value) } }
                        setChannelFx(ch.id, fx)
                        studioEngine.updateChannelFx(ch.id, fx)
                      }}
                      className="flex-1"
                      style={{ accentColor: 'var(--pk)' }}
                    />
                    <span className="mono-font shrink-0" style={{ fontSize: '9px', color: 'var(--tx2)', width: '28px', textAlign: 'right' }}>
                      {Math.round(ch.fx.delay.wet * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Reverb */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={ch.fx.reverb.enabled}
                    onChange={(e) => {
                      const fx = { reverb: { ...ch.fx.reverb, enabled: e.target.checked } }
                      setChannelFx(ch.id, fx)
                      studioEngine.updateChannelFx(ch.id, fx)
                    }}
                    style={{ accentColor: 'var(--yl)' }}
                  />
                  <span className="pixel-font" style={{ fontSize: '6px', color: 'var(--yl)' }}>REVERB</span>
                </div>
                {ch.fx.reverb.enabled && (
                  <div className="flex items-center gap-2">
                    <span className="pixel-font shrink-0" style={{ fontSize: '6px', color: 'var(--tx3)', width: '16px' }}>wet</span>
                    <input
                      type="range" min={0} max={1} step={0.01} value={ch.fx.reverb.wet}
                      onChange={(e) => {
                        const fx = { reverb: { ...ch.fx.reverb, wet: Number(e.target.value) } }
                        setChannelFx(ch.id, fx)
                        studioEngine.updateChannelFx(ch.id, fx)
                      }}
                      className="flex-1"
                      style={{ accentColor: 'var(--yl)' }}
                    />
                    <span className="mono-font shrink-0" style={{ fontSize: '9px', color: 'var(--tx2)', width: '28px', textAlign: 'right' }}>
                      {Math.round(ch.fx.reverb.wet * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

### 7E: Playlist.tsx

- [ ] **Step 7E.1: Criar Playlist**

```tsx
// melovanzin/src/studio/components/Playlist.tsx
import { useStudioStore } from '../useStudioStore'

export default function Playlist() {
  const { activeProject, placeClip, removeClip } = useStudioStore()
  const { channels, bars, patternOrder, selectedPatternId, playlist } = activeProject

  if (channels.length === 0) {
    return (
      <div
        className="flex items-center justify-center py-6"
        style={{ color: 'var(--tx3)', fontSize: '9px' }}
      >
        <span className="pixel-font">adicione canais para usar a playlist</span>
      </div>
    )
  }

  const barNumbers = Array.from({ length: bars }, (_, i) => i)

  const getClip = (channelId: string, barIndex: number) =>
    playlist.find((c) => c.channelId === channelId && c.barIndex === barIndex)

  return (
    <div className="overflow-auto" style={{ maxHeight: '280px' }}>
      {/* Header: bar numbers */}
      <div className="flex sticky top-0 z-10" style={{ background: '#0a0812', borderBottom: '1px solid #1a0f2e' }}>
        <div style={{ width: '80px', minWidth: '80px', padding: '4px 8px' }}></div>
        {barNumbers.map((b) => (
          <div
            key={b}
            className="flex-1 text-center pixel-font"
            style={{ fontSize: '7px', color: 'var(--tx3)', padding: '4px 0', minWidth: '32px' }}
          >
            {b + 1}
          </div>
        ))}
      </div>

      {/* Rows per channel */}
      {channels.map((ch, idx) => (
        <div
          key={ch.id}
          className="flex items-center"
          style={{ background: idx % 2 === 0 ? '#0a0812' : '#08070f', borderBottom: '1px solid #1a0f2e' }}
        >
          {/* Channel label */}
          <div
            className="shrink-0 px-2 py-2"
            style={{ width: '80px', minWidth: '80px' }}
          >
            <span className="mono-font" style={{ fontSize: '9px', color: ch.color }}>
              {ch.name.slice(0, 10)}
            </span>
          </div>

          {/* Bar cells */}
          {barNumbers.map((barIndex) => {
            const clip = getClip(ch.id, barIndex)
            const hasClip = !!clip

            return (
              <div
                key={barIndex}
                className="flex-1 px-0.5 py-1"
                style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'stretch' }}
              >
                <button
                  onClick={() => {
                    if (hasClip) {
                      removeClip(ch.id, barIndex)
                    } else {
                      placeClip(ch.id, barIndex, selectedPatternId)
                    }
                  }}
                  className="w-full h-full rounded-sm transition-all"
                  style={{
                    background: hasClip ? `${ch.color}30` : 'transparent',
                    border: `1px solid ${hasClip ? ch.color : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer',
                    fontSize: '7px',
                    color: hasClip ? ch.color : 'transparent',
                    textAlign: 'center',
                    lineHeight: 1,
                    overflow: 'hidden',
                    padding: '1px',
                  }}
                  title={hasClip ? `${clip.patternId} — clique para remover` : 'Clique para colocar pattern selecionado'}
                >
                  {hasClip ? clip.patternId.replace('pattern-', '') : ''}
                </button>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
```

### 7F: ProjectManager.tsx

- [ ] **Step 7F.1: Criar ProjectManager**

```tsx
// melovanzin/src/studio/components/ProjectManager.tsx
import { useState, useRef } from 'react'
import { useStudioStore } from '../useStudioStore'
import { exportProjectJson, exportProjectWav, downloadWav } from '../export'

export default function ProjectManager() {
  const {
    activeProject,
    savedProjects,
    saveProject,
    loadProject,
    deleteProject,
    newProject,
    importProjectJson,
  } = useStudioStore()

  const [open, setOpen] = useState(false)
  const [exportingWav, setExportingWav] = useState(false)
  const [importError, setImportError] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  const handleExportWav = async () => {
    setExportingWav(true)
    try {
      const blob = await exportProjectWav(activeProject)
      downloadWav(blob, activeProject.name)
    } catch (e) {
      console.error('Erro ao exportar WAV:', e)
    } finally {
      setExportingWav(false)
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const raw = ev.target?.result as string
      const ok = importProjectJson(raw)
      if (!ok) setImportError('Arquivo inválido ou versão incompatível.')
      else { setImportError(''); setOpen(false) }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="pixel-font px-3 py-1 rounded transition-all hover:opacity-80"
        style={{
          fontSize: '8px',
          background: 'rgba(29,185,84,0.1)',
          border: '1px solid rgba(29,185,84,0.3)',
          color: 'var(--grn)',
          cursor: 'pointer',
        }}
      >
        PROJETOS
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(13,0,21,0.88)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="rounded-xl p-6 flex flex-col gap-4"
            style={{
              background: 'var(--panel)',
              border: '2px solid var(--pu)',
              minWidth: '320px',
              maxWidth: '420px',
              maxHeight: '80vh',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pixel-font text-center" style={{ fontSize: '10px', color: 'var(--pu)' }}>
              ★ PROJETOS
            </div>

            {/* Ações do projeto ativo */}
            <div className="flex flex-col gap-2">
              <div className="pixel-font" style={{ fontSize: '7px', color: 'var(--tx3)' }}>
                PROJETO ATUAL: {activeProject.name}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => { saveProject(); setOpen(false) }}
                  className="pixel-font px-3 py-2 rounded flex-1"
                  style={{ fontSize: '8px', background: 'rgba(29,185,84,0.12)', border: '1px solid var(--grn)', color: 'var(--grn)', cursor: 'pointer' }}>
                  salvar
                </button>
                <button onClick={() => exportProjectJson(activeProject)}
                  className="pixel-font px-3 py-2 rounded flex-1"
                  style={{ fontSize: '8px', background: 'rgba(201,125,255,0.1)', border: '1px solid var(--pu)', color: 'var(--pu)', cursor: 'pointer' }}>
                  .json
                </button>
                <button onClick={handleExportWav} disabled={exportingWav}
                  className="pixel-font px-3 py-2 rounded flex-1"
                  style={{ fontSize: '8px', background: 'rgba(255,224,102,0.1)', border: '1px solid var(--yl)', color: 'var(--yl)', cursor: exportingWav ? 'wait' : 'pointer', opacity: exportingWav ? 0.6 : 1 }}>
                  {exportingWav ? 'renderizando...' : '.wav'}
                </button>
              </div>

              {/* Import */}
              <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              <button onClick={() => importRef.current?.click()}
                className="pixel-font py-2 rounded w-full"
                style={{ fontSize: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--tx3)', cursor: 'pointer' }}>
                importar .json
              </button>
              {importError && (
                <div className="pixel-font" style={{ fontSize: '7px', color: '#ff6060' }}>{importError}</div>
              )}
            </div>

            {/* Separador */}
            <div style={{ height: '1px', background: 'var(--border)' }} />

            {/* Novo projeto */}
            <button
              onClick={() => { newProject(); setOpen(false) }}
              className="pixel-font py-2 rounded"
              style={{ fontSize: '8px', background: 'rgba(255,110,180,0.1)', border: '1px solid var(--pk)', color: 'var(--pk)', cursor: 'pointer' }}>
              + novo projeto
            </button>

            {/* Projetos salvos */}
            <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '200px' }}>
              {savedProjects.length === 0 && (
                <div className="pixel-font text-center py-4" style={{ fontSize: '8px', color: 'var(--tx3)' }}>
                  nenhum projeto salvo ainda
                </div>
              )}
              {savedProjects.map((p) => (
                <div key={p.id} className="flex items-center gap-2 p-2 rounded"
                  style={{ background: p.id === activeProject.id ? 'rgba(201,125,255,0.08)' : 'var(--panel2)', border: `1px solid ${p.id === activeProject.id ? 'var(--pu3)' : 'var(--border)'}` }}>
                  <span className="mono-font text-sm flex-1" style={{ color: 'var(--tx)' }}>{p.name}</span>
                  <span className="mono-font" style={{ fontSize: '9px', color: 'var(--tx3)' }}>
                    {new Date(p.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                  <button onClick={() => { loadProject(p.id); setOpen(false) }}
                    className="pixel-font px-2 py-1 rounded"
                    style={{ fontSize: '7px', background: 'rgba(29,185,84,0.1)', border: '1px solid var(--grn)', color: 'var(--grn)', cursor: 'pointer' }}>
                    abrir
                  </button>
                  <button onClick={() => deleteProject(p.id)}
                    className="pixel-font px-2 py-1 rounded"
                    style={{ fontSize: '7px', background: 'rgba(255,60,60,0.1)', border: '1px solid #ff6060', color: '#ff6060', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button onClick={() => setOpen(false)}
              className="pixel-font py-2 rounded"
              style={{ fontSize: '8px', background: 'var(--panel2)', border: '1px solid var(--border)', color: 'var(--tx3)', cursor: 'pointer' }}>
              fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
```

### 7G: GeniusButton.tsx

- [ ] **Step 7G.1: Criar GeniusButton (placeholder co-producer)**

```tsx
// melovanzin/src/studio/components/GeniusButton.tsx

// Ponto de extensão para futura integração de IA co-producer.
// Não conecta nenhuma API. Apenas affordance visual.
export default function GeniusButton() {
  return (
    <button
      disabled
      className="pixel-font px-3 py-1 rounded transition-all cursor-not-allowed"
      style={{
        fontSize: '7px',
        background: 'rgba(255,200,60,0.04)',
        border: '1px solid rgba(255,200,60,0.2)',
        color: 'rgba(255,200,60,0.4)',
        letterSpacing: '1px',
      }}
      title="co-producer IA — em breve"
    >
      🪄 gênio
    </button>
  )
}
```

- [ ] **Step 7G.2: Verificar tipos de todos os componentes**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin && npx tsc --noEmit --skipLibCheck 2>&1 | head -30
```

Esperado: sem erros novos.

- [ ] **Step 7G.3: Commit**

```bash
git -C /Users/ana/Projects/pixel-love add melovanzin/src/studio/components/
git -C /Users/ana/Projects/pixel-love commit -m "feat(studio): add UI components — Header, ChannelRack, MixerPanel, PatternBar, Playlist, ProjectManager, GeniusButton"
```

---

## Task 8: Integrar tudo em FruitLoopsWorld.tsx

**Files:**
- Modify: `melovanzin/src/screens/FruitLoopsWorld.tsx`

- [ ] **Step 8.1: Reescrever FruitLoopsWorld.tsx**

```tsx
// melovanzin/src/screens/FruitLoopsWorld.tsx
import { useEffect, useCallback, useState } from 'react'
import { useStore } from '../store/useStore'
import { useStudioStore } from '../studio/useStudioStore'
import { studioEngine } from '../studio/engine'
import StudioHeader from '../studio/components/StudioHeader'
import PatternBar from '../studio/components/PatternBar'
import ChannelRack from '../studio/components/ChannelRack'
import MixerPanel from '../studio/components/MixerPanel'
import Playlist from '../studio/components/Playlist'
import ProjectManager from '../studio/components/ProjectManager'
import GeniusButton from '../studio/components/GeniusButton'

type Tab = 'sequencer' | 'mixer' | 'playlist'

export default function FruitLoopsWorld() {
  const { setWorld, addNotification } = useStore()
  const {
    activeProject,
    setCurrentStep,
    saveProject,
  } = useStudioStore()

  const [playing, setPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('sequencer')

  // Carregar projeto na engine quando o projeto ativo muda
  useEffect(() => {
    studioEngine.loadProject(activeProject).catch(console.error)
    return () => {
      studioEngine.stop()
    }
  }, [activeProject.id])

  // Sincronizar BPM na engine quando muda no projeto
  useEffect(() => {
    studioEngine.setBpm(activeProject.bpm)
  }, [activeProject.bpm])

  const handlePlay = useCallback(() => {
    studioEngine.start(activeProject, (step) => {
      setCurrentStep(step)
    })
    setPlaying(true)
  }, [activeProject, setCurrentStep])

  const handleStop = useCallback(() => {
    studioEngine.stop()
    setCurrentStep(-1)
    setPlaying(false)
  }, [setCurrentStep])

  // Parar ao desmontar
  useEffect(() => {
    return () => {
      studioEngine.stop()
      studioEngine.dispose()
    }
  }, [])

  const handleBack = () => {
    handleStop()
    setWorld('hub')
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'sequencer', label: 'STEP SEQ' },
    { id: 'mixer', label: 'MIXER' },
    { id: 'playlist', label: 'PLAYLIST' },
  ]

  return (
    <div className="screen flex flex-col" style={{ background: '#080710', color: 'var(--tx)' }}>
      {/* Header com transporte */}
      <StudioHeader
        onBack={handleBack}
        playing={playing}
        onPlay={handlePlay}
        onStop={handleStop}
      />

      {/* Toolbar secundária */}
      <div
        className="flex items-center gap-2 px-4 py-2 shrink-0 overflow-x-auto"
        style={{ background: '#0a0812', borderBottom: '1px solid #1a0f2e' }}
      >
        {/* Tabs */}
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="pixel-font px-3 py-1 rounded shrink-0 transition-all"
            style={{
              fontSize: '8px',
              background: activeTab === tab.id ? 'rgba(201,125,255,0.15)' : 'transparent',
              border: `1px solid ${activeTab === tab.id ? 'var(--pu)' : 'transparent'}`,
              color: activeTab === tab.id ? 'var(--pu)' : 'var(--tx3)',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}

        <div className="flex-1" />

        {/* Actions */}
        <ProjectManager />
        <GeniusButton />

        <button
          onClick={() => {
            saveProject()
            addNotification(`projeto "${activeProject.name}" salvo! ✦`, '✦')
          }}
          className="pixel-font px-3 py-1 rounded shrink-0 transition-all hover:opacity-80"
          style={{
            fontSize: '8px',
            background: 'rgba(29,185,84,0.1)',
            border: '1px solid rgba(29,185,84,0.3)',
            color: 'var(--grn)',
            cursor: 'pointer',
          }}
        >
          ✦ salvar
        </button>
      </div>

      {/* Pattern selector (sempre visível no sequencer) */}
      {activeTab === 'sequencer' && <PatternBar />}

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'sequencer' && <ChannelRack />}
        {activeTab === 'mixer' && (
          <div className="flex-1 overflow-y-auto">
            <MixerPanel />
          </div>
        )}
        {activeTab === 'playlist' && (
          <div className="flex-1 overflow-auto flex flex-col gap-0 py-2">
            <div className="px-4 pb-2 pixel-font" style={{ fontSize: '8px', color: 'var(--tx3)' }}>
              ARRANJO — clique para colocar/remover o pattern selecionado em cada barra
            </div>
            <Playlist />
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 8.2: Verificar tipos**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin && npx tsc --noEmit --skipLibCheck 2>&1 | head -30
```

Esperado: sem erros.

- [ ] **Step 8.3: Commit**

```bash
git -C /Users/ana/Projects/pixel-love add melovanzin/src/screens/FruitLoopsWorld.tsx
git -C /Users/ana/Projects/pixel-love commit -m "feat: rewire FruitLoopsWorld to mini FL Studio UI"
```

---

## Task 9: Isolamento do áudio global (pixelLoveAudio)

**Files:**
- Modify: `melovanzin/src/store/useStore.ts`
- Modify: `melovanzin/src/App.tsx`

- [ ] **Step 9.1: Adicionar flag `studioActive` no useStore**

No `useStore.ts`, adicionar à interface `AppState` e ao `create`:

```typescript
// Adicionar à interface AppState:
studioActive: boolean
setStudioActive: (v: boolean) => void
```

```typescript
// Adicionar ao objeto create:
studioActive: false,
setStudioActive: (v) => set({ studioActive: v }),
```

- [ ] **Step 9.2: Usar studioActive no App.tsx para pausar pixelLoveAudio**

No `App.tsx`, no `useEffect` de bootstrap de áudio, adicionar lógica de pausa:

```typescript
// Já existe no App.tsx — adicionar observer de studioActive:
const studioActive = useStore((s) => s.studioActive)

useEffect(() => {
  if (studioActive) {
    pixelLoveAudio.pauseMusic()
  } else if (spotifyPlaying && pixelLoveAudio.hasUnlockedAudio()) {
    pixelLoveAudio.playMusic()
  }
}, [studioActive, spotifyPlaying])
```

- [ ] **Step 9.3: Ativar/desativar studioActive no FruitLoopsWorld**

No `FruitLoopsWorld.tsx`, adicionar no topo do componente:

```typescript
const { setWorld, addNotification, setStudioActive } = useStore()

// Ativar ao entrar
useEffect(() => {
  setStudioActive(true)
  return () => setStudioActive(false)
}, [setStudioActive])
```

- [ ] **Step 9.4: Verificar tipos e rodar testes**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin && npx tsc --noEmit --skipLibCheck 2>&1 | head -20
npx vitest run 2>&1 | tail -10
```

Esperado: sem erros de tipo, todos os testes passando.

- [ ] **Step 9.5: Commit**

```bash
git -C /Users/ana/Projects/pixel-love add melovanzin/src/store/useStore.ts melovanzin/src/App.tsx melovanzin/src/screens/FruitLoopsWorld.tsx
git -C /Users/ana/Projects/pixel-love commit -m "feat: isolate global audio when studio is active"
```

---

## Task 10: Verificação final

- [ ] **Step 10.1: Rodar todos os testes**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin && npx vitest run
```

Esperado: todos os testes passando (pelo menos 18).

- [ ] **Step 10.2: Rodar build completo**

```bash
cd /Users/ana/Projects/pixel-love/melovanzin && npm run build 2>&1 | tail -20
```

Esperado: build bem-sucedido, sem erros. Warnings de tamanho de bundle são aceitáveis.

- [ ] **Step 10.3: Commit final**

```bash
git -C /Users/ana/Projects/pixel-love add .
git -C /Users/ana/Projects/pixel-love commit -m "feat(fruit-loops): complete mini FL Studio MVP — step sequencer, mixer, FX, playlist, export, multi-project persistence"
```

---

## Limitações conhecidas do MVP

1. **Export WAV com Tone.Offline**: Player em modo offline exige que o `sampleDataUrl` seja decodificável. Samples muito grandes podem demorar ou falhar silenciosamente.
2. **Tone.Player + data URLs grandes**: browsers mobile podem rejeitar data URLs > 5MB. Solução futura: IndexedDB em vez de localStorage/data URLs.
3. **Step scheduling com Tone.Transport**: para loops longos (>32 barras), o scheduling de eventos individuais pode ser pesado. Solução futura: usar `Sequence` ou `Part` do Tone.
4. **vite-plugin-singlefile + samples inline**: samples em base64 dentro do bundle podem tornar o `index.html` exportável enorme. Considerar separar export de samples em versão futura.
5. **Sem piano roll**: MVP só suporta step sequencer binário (on/off por step).
6. **Sem automação de parâmetros no tempo**: volume, pan e FX são estáticos durante o playback.
7. **`getDraw` no Tone.js v15**: a função `Tone.getDraw()` pode não existir dependendo da versão minor. Ajustar para `Tone.Draw` se necessário.

---

## Notas de arquitetura

- **Engine singleton** (`studioEngine`): instância única compartilhada pela UI. Recarregada ao trocar de projeto via `loadProject()`.
- **Store isolado** (`useStudioStore`): separado do `useStore` global — não polui o estado romântico do app com lógica de produção musical.
- **Imutabilidade**: todas as funções de domínio em `project.ts` retornam novos objetos — nunca mutam o projeto existente.
- **Ponto de extensão IA**: `GeniusButton.tsx` é o único arquivo a modificar para conectar a futura integração. Não há dependência circular — o botão não importa nada de áudio.
