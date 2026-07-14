import './style.css'
import {
  answerAdaptiveQuestion,
  CORE_ADAPTIVE_QUESTIONS,
  createAdaptiveSession,
  evaluateAdaptiveSession,
  MAX_ADAPTIVE_QUESTIONS,
  MIN_ADAPTIVE_QUESTIONS,
  restoreAdaptiveSession,
  sessionFromLegacyAnswers,
  TYPICAL_ADAPTIVE_QUESTIONS,
} from './adaptive'
import { MOB_PREVIEW_IMAGE, WIKI_SOURCE } from './data/source'
import { mobProfiles, TRAIT_LABELS } from './data/mobs'
import { questions } from './data/questions'
import {
  clearAdaptiveSession,
  loadAdaptiveSession,
  loadAnswers,
  saveAdaptiveSession,
  STORAGE_KEY,
} from './storage'
import type { AdaptiveSession, MobProfile, RankedMob, TraitVector } from './types'

const root = document.querySelector<HTMLDivElement>('#app')

if (!root) {
  throw new Error('Missing #app root element.')
}

const app = root
const appHomeHref = import.meta.env.BASE_URL || '/'

const questionIds = questions.map((question) => question.id)
const legacyQuestionIds = questions.slice(0, 93).map((question) => question.id)
const savedSession = loadAdaptiveSession(window.localStorage, questionIds)
const legacyAnswers = savedSession ? {} : loadAnswers(window.localStorage, questionIds)
const hasLegacyAnswers = Object.keys(legacyAnswers).length > 0
let session: AdaptiveSession = savedSession
  ? restoreAdaptiveSession(savedSession)
  : hasLegacyAnswers
    ? sessionFromLegacyAnswers(
        legacyAnswers,
        legacyQuestionIds.every((questionId) => legacyAnswers[questionId]),
      )
    : createAdaptiveSession()
if (hasLegacyAnswers) {
  window.localStorage.removeItem(STORAGE_KEY)
}
saveAdaptiveSession(window.localStorage, session)

const questionById = new Map(questions.map((question) => [question.id, question]))
let currentIndex = Math.min(firstUnansweredIndex(), session.questionOrder.length - 1)
let resultMode = session.completed
let transientMessage = ''
let pendingAdvanceTimer: number | undefined

const AUTO_ADVANCE_DELAY_MS = 170

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

function firstUnansweredIndex(): number {
  const index = session.questionOrder.findIndex((questionId) => !session.answers[questionId])
  return index === -1 ? Math.max(0, session.questionOrder.length - 1) : index
}

function currentQuestion() {
  const questionId = session.questionOrder[currentIndex]
  const question = questionById.get(questionId)
  if (!question) {
    throw new Error(`Missing adaptive question ${questionId}.`)
  }
  return question
}

function answeredCount(): number {
  return Object.keys(session.answers).length
}

function categoryLabel(category: MobProfile['category']): string {
  if (category === 'boss') {
    return 'Boss 生物'
  }
  return category === 'friendly' ? '友好生物' : '敌对生物'
}

function visibleTraits(traits: TraitVector): string[] {
  return Object.entries(traits)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([key]) => TRAIT_LABELS[key] ?? key)
}

function clearPendingAdvance(): void {
  if (pendingAdvanceTimer !== undefined) {
    window.clearTimeout(pendingAdvanceTimer)
    pendingAdvanceTimer = undefined
  }
}

function advanceFromQuestion(questionId: string): void {
  const question = currentQuestion()
  if (question.id !== questionId || !session.answers[questionId]) {
    return
  }
  if (currentIndex < session.questionOrder.length - 1) {
    currentIndex += 1
    transientMessage = ''
    render()
    return
  }
  if (session.completed) {
    resultMode = true
    transientMessage = ''
    render()
  }
}

function queueAutoAdvance(questionId: string): void {
  clearPendingAdvance()
  pendingAdvanceTimer = window.setTimeout(() => {
    pendingAdvanceTimer = undefined
    advanceFromQuestion(questionId)
  }, AUTO_ADVANCE_DELAY_MS)
}

function setAnswer(choice: 'a' | 'b', autoAdvance = false): void {
  if (resultMode) return
  clearPendingAdvance()
  const question = currentQuestion()
  const previousAnswer = session.answers[question.id]
  const changedEarlierAnswer =
    previousAnswer !== undefined &&
    previousAnswer !== choice &&
    currentIndex < session.questionOrder.length - 1
  session = answerAdaptiveQuestion(session, question.id, choice)
  saveAdaptiveSession(window.localStorage, session)
  transientMessage = changedEarlierAnswer ? '已根据修改调整后续题目。' : ''
  render()
  if (autoAdvance) {
    queueAutoAdvance(question.id)
  }
}

function goNext(): void {
  clearPendingAdvance()
  const question = currentQuestion()
  if (!session.answers[question.id]) {
    transientMessage = '先选一个更接近你的反应。'
    render()
    return
  }
  advanceFromQuestion(question.id)
}

function goBack(): void {
  clearPendingAdvance()
  if (resultMode) {
    resultMode = false
    currentIndex = Math.max(0, session.questionOrder.length - 1)
    render()
    return
  }
  currentIndex = Math.max(0, currentIndex - 1)
  transientMessage = ''
  render()
}

function restart(): void {
  clearPendingAdvance()
  clearAdaptiveSession(window.localStorage)
  session = createAdaptiveSession()
  saveAdaptiveSession(window.localStorage, session)
  currentIndex = 0
  resultMode = false
  transientMessage = ''
  history.replaceState(null, '', location.pathname)
  render()
}

function assessmentProgress(completed: number): number {
  if (session.completed) return 100
  if (completed < MIN_ADAPTIVE_QUESTIONS) {
    return (completed / MIN_ADAPTIVE_QUESTIONS) * 55
  }
  if (completed < TYPICAL_ADAPTIVE_QUESTIONS) {
    return (
      55 +
      ((completed - MIN_ADAPTIVE_QUESTIONS) /
        (TYPICAL_ADAPTIVE_QUESTIONS - MIN_ADAPTIVE_QUESTIONS)) *
        25
    )
  }
  if (completed < CORE_ADAPTIVE_QUESTIONS) {
    return (
      80 +
      ((completed - TYPICAL_ADAPTIVE_QUESTIONS) /
        (CORE_ADAPTIVE_QUESTIONS - TYPICAL_ADAPTIVE_QUESTIONS)) *
        12
    )
  }
  return Math.min(
    100,
    92 +
      ((completed - CORE_ADAPTIVE_QUESTIONS) /
        (MAX_ADAPTIVE_QUESTIONS - CORE_ADAPTIVE_QUESTIONS)) *
        8,
  )
}

function renderHeader(): string {
  const completed = answeredCount()
  const decision = evaluateAdaptiveSession(session)
  const percent = assessmentProgress(completed)
  const progressCopy = session.completed
    ? `共完成 ${completed} 题`
    : completed >= CORE_ADAPTIVE_QUESTIONS
      ? `${completed} 题 · 深入辨析`
      : decision.phase === 'confirmation'
        ? `${completed} 题 · 正在确认`
        : completed >= MIN_ADAPTIVE_QUESTIONS
          ? `${completed} 题 · 缩小范围`
          : `${completed}/${MIN_ADAPTIVE_QUESTIONS} · 建立轮廓`
  return `
    <header class="topbar">
      <a class="brand" href="${escapeHtml(appHomeHref)}" aria-label="MCTI 首页">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>MCTI</span>
      </a>
      <div class="progress-copy" aria-live="polite">${progressCopy}</div>
    </header>
    <div class="progress-track" aria-hidden="true">
      <span style="inline-size:${percent}%"></span>
    </div>
  `
}

function renderQuestion(): void {
  const question = currentQuestion()
  const selected = session.answers[question.id]
  const questionNumber = currentIndex + 1
  const completed = answeredCount()
  const phaseLabel =
    completed >= CORE_ADAPTIVE_QUESTIONS
      ? '深入辨析'
      : evaluateAdaptiveSession(session).phase === 'confirmation'
        ? '候选确认'
        : completed >= MIN_ADAPTIVE_QUESTIONS
          ? '自适应辨析'
          : '基础倾向'
  app.innerHTML = `
    <main class="app-shell">
      ${renderHeader()}
      <section class="quiz-surface" aria-labelledby="question-title">
        <div class="mob-preview">
          <img src="${MOB_PREVIEW_IMAGE}" alt="Minecraft 生物预览" loading="lazy">
        </div>
        <p class="eyebrow">${phaseLabel} · 第 ${questionNumber} 题</p>
        <h1 id="question-title">${escapeHtml(question.prompt)}</h1>
        <div class="options" role="radiogroup" aria-labelledby="question-title">
          ${question.options
            .map(
              (candidate) => `
                <button
                  class="choice ${selected === candidate.id ? 'is-selected' : ''}"
                  type="button"
                  data-answer="${candidate.id}"
                  aria-pressed="${selected === candidate.id}"
                >
                  <span class="choice-key">${candidate.id === 'a' ? '1' : '2'}</span>
                  <span>${escapeHtml(candidate.label)}</span>
                </button>
              `,
            )
            .join('')}
        </div>
        <div class="actions quiz-actions">
          <button class="ghost" type="button" data-action="back" ${currentIndex === 0 ? 'disabled' : ''}>返回</button>
          <p class="inline-status" aria-live="polite">${escapeHtml(transientMessage)}</p>
        </div>
      </section>
      <button class="reset-link" type="button" data-action="restart">重做</button>
    </main>
  `
  bindQuestionEvents()
}

function resultUrl(profile: MobProfile): string {
  return `${location.origin}${location.pathname}#result=${encodeURIComponent(profile.code)}`
}

function renderRankedMob(ranked: RankedMob): string {
  return `
    <li>
      <a href="${ranked.profile.wikiUrl}" target="_blank" rel="noreferrer">
        <span>${escapeHtml(ranked.profile.name)}</span>
        <span>${Math.round(ranked.displayScore * 100)}%</span>
      </a>
    </li>
  `
}

async function copyResult(profile: MobProfile): Promise<void> {
  const text = `我的 MCTI 是 ${profile.name}（${profile.code}）：${profile.archetype}。${resultUrl(profile)}`
  try {
    await navigator.clipboard.writeText(text)
    transientMessage = '结果已复制。'
  } catch {
    transientMessage = fallbackCopyText(text) ? '结果已复制。' : '复制失败，请手动复制地址栏链接。'
  }
  render()
}

function fallbackCopyText(text: string): boolean {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'fixed'
  textArea.style.insetInlineStart = '-9999px'
  document.body.append(textArea)
  textArea.select()
  const copied = document.execCommand('copy')
  textArea.remove()
  return copied
}

function renderResult(): void {
  const result = evaluateAdaptiveSession(session).score
  const profile = result.top.profile
  const traits = visibleTraits(profile.traits)
  const limitedResult = session.stopReason === 'question_limit'
  history.replaceState(null, '', `#result=${encodeURIComponent(profile.code)}`)
  app.innerHTML = `
    <main class="app-shell">
      ${renderHeader()}
      <section class="result-surface" aria-labelledby="result-title">
        <p class="eyebrow">${limitedResult ? '当前最接近 · ' : ''}${categoryLabel(profile.category)} / ${escapeHtml(profile.code)}</p>
        <h1 id="result-title">${escapeHtml(profile.name)}</h1>
        <p class="archetype">${escapeHtml(profile.archetype)}</p>
        <p class="summary">${escapeHtml(profile.summary)}</p>
        <div class="trait-row" aria-label="主要倾向">
          ${traits.map((trait) => `<span>${escapeHtml(trait)}</span>`).join('')}
        </div>
        <div class="result-meta">
          <span>匹配度 ${Math.round(result.top.displayScore * 100)}%</span>
          <span>置信 ${Math.round(result.confidence * 100)}%</span>
          <span>共 ${result.completedCount} 题</span>
        </div>
        <div class="alternatives">
          <h2>接近结果</h2>
          <ol>${result.alternatives.map(renderRankedMob).join('')}</ol>
        </div>
        <div class="actions result-actions">
          <button class="ghost" type="button" data-action="back">修改答案</button>
          <p class="inline-status" aria-live="polite">${escapeHtml(transientMessage)}</p>
          <button class="primary" type="button" data-action="share">复制结果</button>
        </div>
        <p class="source-line">
          来源：<a href="${WIKI_SOURCE.pageUrl}" target="_blank" rel="noreferrer">中文 Minecraft Wiki 生物页</a>
          修订 ${WIKI_SOURCE.revisionId}
        </p>
      </section>
      <button class="reset-link" type="button" data-action="restart">重做</button>
    </main>
  `
  bindResultEvents(profile)
}

function renderSharedResult(profile: MobProfile): void {
  app.innerHTML = `
    <main class="app-shell">
      ${renderHeader()}
      <section class="result-surface" aria-labelledby="result-title">
        <p class="eyebrow">${categoryLabel(profile.category)} / ${escapeHtml(profile.code)}</p>
        <h1 id="result-title">${escapeHtml(profile.name)}</h1>
        <p class="archetype">${escapeHtml(profile.archetype)}</p>
        <p class="summary">${escapeHtml(profile.summary)}</p>
        <div class="trait-row" aria-label="主要倾向">
          ${visibleTraits(profile.traits).map((trait) => `<span>${escapeHtml(trait)}</span>`).join('')}
        </div>
        <div class="actions result-actions">
          <button class="primary" type="button" data-action="restart">开始测试</button>
        </div>
        <p class="source-line">
          来源：<a href="${WIKI_SOURCE.pageUrl}" target="_blank" rel="noreferrer">中文 Minecraft Wiki 生物页</a>
          修订 ${WIKI_SOURCE.revisionId}
        </p>
      </section>
    </main>
  `
  bindSharedEvents()
}

function bindQuestionEvents(): void {
  app.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach((button) => {
    button.addEventListener('click', () => setAnswer(button.dataset.answer === 'a' ? 'a' : 'b', true))
  })
  bindCommonEvents()
}

function bindResultEvents(profile: MobProfile): void {
  app.querySelector<HTMLButtonElement>('[data-action="share"]')?.addEventListener('click', () => {
    copyResult(profile).catch(() => {
      transientMessage = '复制失败，请手动复制地址栏链接。'
      render()
    })
  })
  bindCommonEvents()
}

function bindSharedEvents(): void {
  app.querySelector<HTMLButtonElement>('[data-action="restart"]')?.addEventListener('click', restart)
}

function bindCommonEvents(): void {
  app.querySelector<HTMLButtonElement>('[data-action="back"]')?.addEventListener('click', goBack)
  app.querySelector<HTMLButtonElement>('[data-action="next"]')?.addEventListener('click', goNext)
  app.querySelector<HTMLButtonElement>('[data-action="restart"]')?.addEventListener('click', restart)
}

function render(): void {
  const sharedCode = decodeURIComponent(location.hash.replace(/^#result=/, ''))
  const sharedProfile = location.hash.startsWith('#result=')
    ? mobProfiles.find((profile) => profile.code === sharedCode)
    : undefined

  if (sharedProfile && !session.completed) {
    renderSharedResult(sharedProfile)
    return
  }
  if (resultMode && session.completed) {
    renderResult()
    return
  }
  renderQuestion()
}

window.addEventListener('keydown', (event) => {
  if (event.key === '1') {
    setAnswer('a', true)
  } else if (event.key === '2') {
    setAnswer('b', true)
  } else if (event.key === 'ArrowLeft') {
    goBack()
  } else if (event.key === 'ArrowRight' || event.key === 'Enter') {
    goNext()
  }
})

render()
