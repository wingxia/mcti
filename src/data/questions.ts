import type { Question, QuestionOption, TraitVector } from '../types'
import { affinityKey, mobProfiles } from './mobs'

const option = (id: 'a' | 'b', label: string, weights: TraitVector): QuestionOption => ({
  id,
  label,
  weights,
})

const anchorWeights = (code: string, traits: TraitVector): TraitVector => ({
  ...traits,
  [affinityKey(code)]: 8,
})

const neutralLabels = [
  '我会先保留判断，不急着把自己放进这个角色。',
  '我更想选择普通路线，等局势清楚后再行动。',
  '我会让这个场景过去，保持自己的节奏。',
  '我不太会这样做，更倾向于低调观察。',
]

const mobQuestions: readonly Question[] = mobProfiles.map((mob, index) => ({
  id: `mob-${mob.code}`,
  prompt: `如果局面变得像“${mob.name}”的行为模式，你更接近哪一种反应？`,
  options: [
    option('a', mob.anchorChoice, anchorWeights(mob.code, mob.traits)),
    option('b', neutralLabels[index % neutralLabels.length], {}),
  ],
}))

const calibrationQuestions: readonly Question[] = [
  {
    id: 'calibration-gather-or-guard',
    prompt: '团队进入陌生区域时，你更自然的第一反应是？',
    options: [
      option('a', '先找资源、线索和可交换的筹码。', {
        curiosity: 1,
        resource: 1,
        trade: 0.5,
      }),
      option('b', '先确认边界、风险和谁需要被保护。', {
        caution: 1,
        protection: 1,
        order: 0.5,
      }),
    ],
  },
  {
    id: 'calibration-fast-or-steady',
    prompt: '遇到突发变化，你更偏向哪种处理方式？',
    options: [
      option('a', '快速移动、换位、绕开阻碍。', {
        mobility: 1,
        mischief: 0.6,
        independence: 0.4,
      }),
      option('b', '稳住阵地，靠耐心和韧性扛过去。', {
        patience: 1,
        resilience: 1,
        order: 0.4,
      }),
    ],
  },
  {
    id: 'calibration-social-or-solo',
    prompt: '你更像哪种协作方式？',
    options: [
      option('a', '和同伴保持连接，必要时一起行动。', {
        social: 1,
        loyalty: 0.8,
        nurture: 0.5,
      }),
      option('b', '独自把路线看清楚，再决定是否靠近。', {
        independence: 1,
        stealth: 0.7,
        caution: 0.5,
      }),
    ],
  },
  {
    id: 'calibration-direct-or-subtle',
    prompt: '当你必须制造影响时，你更愿意怎样出现？',
    options: [
      option('a', '直接出手，让局势明确改变。', {
        aggression: 1,
        spectacle: 0.8,
        mobility: 0.4,
      }),
      option('b', '用细节、时机或环境慢慢改变走向。', {
        stealth: 0.8,
        patience: 0.7,
        curiosity: 0.5,
      }),
    ],
  },
]

export const questions: readonly Question[] = [...mobQuestions, ...calibrationQuestions]

if (questions.length !== 93) {
  throw new Error(`Expected 93 MCTI questions, received ${questions.length}`)
}
