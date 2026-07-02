import type { MobProfile, Question, QuestionOption, TraitVector } from '../types'
import { affinityKey, mobProfiles } from './mobs'

type ChoiceBlueprint = {
  label: string
  weights: TraitVector
}

type QuestionBlueprint = {
  id: string
  prompt: string
  options: readonly [ChoiceBlueprint, ChoiceBlueprint]
}

const option = (id: 'a' | 'b', label: string, weights: TraitVector): QuestionOption => ({
  id,
  label,
  weights,
})

const weights = (entries: readonly (readonly [string, number])[]): TraitVector =>
  Object.fromEntries(entries)

const hashValue = (value: string): number => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const traitScore = (profile: MobProfile, vector: TraitVector): number =>
  Object.entries(vector).reduce((total, [key, value]) => total + (profile.traits[key] ?? 0) * value, 0)

const behaviorQuirk = (profile: MobProfile, question: QuestionBlueprint, side: 'a' | 'b'): number =>
  ((hashValue(`${profile.code}:${question.id}:${side}`) % 2001) / 2000 - 0.5) * 0.9

const alignedSide = (profile: MobProfile, question: QuestionBlueprint): 'a' | 'b' => {
  const [first, second] = question.options
  const firstScore = traitScore(profile, first.weights) + behaviorQuirk(profile, question, 'a')
  const secondScore = traitScore(profile, second.weights) + behaviorQuirk(profile, question, 'b')
  return firstScore >= secondScore ? 'a' : 'b'
}

const withAffinityWeights = (
  side: 'a' | 'b',
  question: QuestionBlueprint,
  baseWeights: TraitVector,
): TraitVector => {
  const next: TraitVector = { ...baseWeights }
  for (const profile of mobProfiles) {
    if (alignedSide(profile, question) === side) {
      next[affinityKey(profile.code)] = 1.45
    }
  }
  return next
}

const buildQuestion = (question: QuestionBlueprint): Question => ({
  id: question.id,
  prompt: question.prompt,
  options: [
    option('a', question.options[0].label, withAffinityWeights('a', question, question.options[0].weights)),
    option('b', question.options[1].label, withAffinityWeights('b', question, question.options[1].weights)),
  ],
})

const questionBlueprints: readonly QuestionBlueprint[] = [
  {
    id: 'q01-lost-spark',
    prompt: '路边掉着一颗会发光的小东西，你第一反应是？',
    options: [
      {
        label: '捡起来问一圈，努力把它送回主人手里。',
        weights: weights([
          ['loyalty', 1],
          ['social', 0.8],
          ['nurture', 0.6],
          ['resource', 0.4],
        ]),
      },
      {
        label: '先记下位置和线索，弄清它为什么会在这里。',
        weights: weights([
          ['curiosity', 1],
          ['caution', 0.6],
          ['order', 0.5],
          ['independence', 0.3],
        ]),
      },
    ],
  },
  {
    id: 'q02-cave-sound',
    prompt: '洞穴深处传来奇怪的响动，你会怎么做？',
    options: [
      {
        label: '轻手轻脚靠近一点，看看是不是新发现。',
        weights: weights([
          ['curiosity', 1],
          ['stealth', 0.8],
          ['mobility', 0.5],
        ]),
      },
      {
        label: '先插好火把和路标，确认退路再继续。',
        weights: weights([
          ['caution', 1],
          ['order', 0.8],
          ['patience', 0.6],
        ]),
      },
    ],
  },
  {
    id: 'q03-slow-friend',
    prompt: '同伴走得慢，队伍快要错过时间了。',
    options: [
      {
        label: '放慢节奏，想办法让大家一起到。',
        weights: weights([
          ['social', 1],
          ['nurture', 0.9],
          ['loyalty', 0.7],
          ['patience', 0.4],
        ]),
      },
      {
        label: '先去前面探路，把安全路线带回来。',
        weights: weights([
          ['mobility', 1],
          ['independence', 0.8],
          ['curiosity', 0.6],
          ['protection', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q04-small-base',
    prompt: '新基地只有一小块空地，你最想先做什么？',
    options: [
      {
        label: '把箱子、床和工具排整齐，住起来安心。',
        weights: weights([
          ['order', 1],
          ['resource', 0.8],
          ['patience', 0.5],
        ]),
      },
      {
        label: '留出活动空间，方便以后随时改造。',
        weights: weights([
          ['mobility', 0.9],
          ['curiosity', 0.7],
          ['independence', 0.6],
        ]),
      },
    ],
  },
  {
    id: 'q05-argument',
    prompt: '朋友之间为了路线吵起来了，你更像哪种处理方式？',
    options: [
      {
        label: '站出来定一个方向，先让局面动起来。',
        weights: weights([
          ['order', 0.8],
          ['aggression', 0.7],
          ['protection', 0.6],
          ['spectacle', 0.4],
        ]),
      },
      {
        label: '把两边想法都听完，再悄悄补上缺的线索。',
        weights: weights([
          ['patience', 1],
          ['social', 0.7],
          ['caution', 0.6],
          ['curiosity', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q06-rainy-night',
    prompt: '雨夜出门，路上湿漉漉的，你会带什么心情？',
    options: [
      {
        label: '喜欢这种水汽和安静，慢慢走也可以。',
        weights: weights([
          ['aquatic', 1],
          ['patience', 0.7],
          ['stealth', 0.4],
        ]),
      },
      {
        label: '雨声正好遮住脚步，快点把事办完。',
        weights: weights([
          ['mobility', 0.9],
          ['stealth', 0.8],
          ['resource', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q07-surprise-guest',
    prompt: '突然有人闯进你的节奏里，你会？',
    options: [
      {
        label: '先观察对方有没有危险，再决定靠不靠近。',
        weights: weights([
          ['caution', 1],
          ['stealth', 0.6],
          ['independence', 0.5],
        ]),
      },
      {
        label: '直接打招呼，看看能不能一起做点事。',
        weights: weights([
          ['social', 1],
          ['trade', 0.6],
          ['curiosity', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q08-valuable-map',
    prompt: '你拿到一张可能很有价值的地图。',
    options: [
      {
        label: '先保管好，等关键时刻再拿出来用。',
        weights: weights([
          ['resource', 1],
          ['caution', 0.7],
          ['patience', 0.5],
        ]),
      },
      {
        label: '马上沿着线索出发，地图就是用来冒险的。',
        weights: weights([
          ['curiosity', 1],
          ['mobility', 0.8],
          ['independence', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q09-thin-bridge',
    prompt: '面前是一座窄窄的桥，下面很深。',
    options: [
      {
        label: '一步一步稳住呼吸，慢慢过。',
        weights: weights([
          ['caution', 1],
          ['patience', 0.9],
          ['resilience', 0.6],
        ]),
      },
      {
        label: '看准角度，一口气冲过去。',
        weights: weights([
          ['mobility', 1],
          ['spectacle', 0.5],
          ['aggression', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q10-group-treasure',
    prompt: '大家找到一箱宝物，你会先关心？',
    options: [
      {
        label: '怎么公平分配，别让谁心里不舒服。',
        weights: weights([
          ['order', 1],
          ['social', 0.7],
          ['trade', 0.6],
        ]),
      },
      {
        label: '哪些东西最稀有，怎么留到以后发挥作用。',
        weights: weights([
          ['resource', 1],
          ['curiosity', 0.5],
          ['patience', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q11-noisy-crowd',
    prompt: '人很多、声音很杂，你更想躲到哪里？',
    options: [
      {
        label: '找个角落安静待着，等噪音过去。',
        weights: weights([
          ['stealth', 1],
          ['independence', 0.8],
          ['patience', 0.5],
        ]),
      },
      {
        label: '站到能看清全局的位置，帮大家排队。',
        weights: weights([
          ['order', 0.9],
          ['social', 0.7],
          ['protection', 0.6],
        ]),
      },
    ],
  },
  {
    id: 'q12-tiny-garden',
    prompt: '你负责照看一小片刚种下的植物。',
    options: [
      {
        label: '每天看一眼，慢慢等它长好。',
        weights: weights([
          ['nurture', 1],
          ['patience', 0.9],
          ['order', 0.4],
        ]),
      },
      {
        label: '想试试不同种法，看哪种变化最快。',
        weights: weights([
          ['curiosity', 1],
          ['resource', 0.6],
          ['mischief', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q13-wrong-turn',
    prompt: '你发现自己走错路了。',
    options: [
      {
        label: '立刻回头，别把错误滚大。',
        weights: weights([
          ['caution', 0.9],
          ['order', 0.7],
          ['patience', 0.4],
        ]),
      },
      {
        label: '既然来了，就顺便看看这条路有什么。',
        weights: weights([
          ['curiosity', 1],
          ['independence', 0.7],
          ['mobility', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q14-hidden-door',
    prompt: '墙上有一扇半掩的小门。',
    options: [
      {
        label: '悄悄打开一条缝，先看看里面。',
        weights: weights([
          ['stealth', 1],
          ['curiosity', 0.8],
          ['caution', 0.4],
        ]),
      },
      {
        label: '敲门说明来意，不想吓到里面的人。',
        weights: weights([
          ['social', 0.8],
          ['order', 0.6],
          ['nurture', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q15-sudden-danger',
    prompt: '危险突然贴近，时间只够反应一下。',
    options: [
      {
        label: '挡在前面，先把别人护住。',
        weights: weights([
          ['protection', 1],
          ['loyalty', 0.8],
          ['resilience', 0.6],
        ]),
      },
      {
        label: '迅速拉开距离，找机会反制。',
        weights: weights([
          ['mobility', 1],
          ['caution', 0.6],
          ['aggression', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q16-stage-light',
    prompt: '如果必须让所有人注意到一件事，你会？',
    options: [
      {
        label: '做得醒目一点，让它一下子被看见。',
        weights: weights([
          ['spectacle', 1],
          ['aggression', 0.5],
          ['social', 0.4],
        ]),
      },
      {
        label: '把线索摆清楚，让人自然发现它重要。',
        weights: weights([
          ['order', 0.9],
          ['patience', 0.7],
          ['curiosity', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q17-snack-choice',
    prompt: '背包只能带一种小零食。',
    options: [
      {
        label: '带耐放、能救急的，实用最重要。',
        weights: weights([
          ['resource', 1],
          ['caution', 0.6],
          ['resilience', 0.4],
        ]),
      },
      {
        label: '带大家都爱分着吃的，路上开心一点。',
        weights: weights([
          ['social', 0.9],
          ['nurture', 0.7],
          ['trade', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q18-quiet-lake',
    prompt: '面前是一片很安静的湖。',
    options: [
      {
        label: '想在水边待久一点，听听水声。',
        weights: weights([
          ['aquatic', 1],
          ['patience', 0.7],
          ['caution', 0.3],
        ]),
      },
      {
        label: '想绕湖走一圈，看看岸边藏着什么。',
        weights: weights([
          ['curiosity', 0.9],
          ['mobility', 0.7],
          ['resource', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q19-rules-or-improv',
    prompt: '临时小游戏开始了，但规则还没说完。',
    options: [
      {
        label: '先听完规则，玩起来才公平。',
        weights: weights([
          ['order', 1],
          ['patience', 0.7],
          ['social', 0.4],
        ]),
      },
      {
        label: '边玩边懂，试错也很好玩。',
        weights: weights([
          ['mischief', 1],
          ['curiosity', 0.8],
          ['mobility', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q20-alone-task',
    prompt: '有件小事交给你一个人处理。',
    options: [
      {
        label: '很好，我可以按自己的节奏悄悄做完。',
        weights: weights([
          ['independence', 1],
          ['stealth', 0.7],
          ['patience', 0.4],
        ]),
      },
      {
        label: '我会先问清大家期待，别做偏了。',
        weights: weights([
          ['social', 0.8],
          ['order', 0.7],
          ['loyalty', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q21-broken-tool',
    prompt: '最顺手的工具突然坏了。',
    options: [
      {
        label: '先修好它，熟悉的东西值得维护。',
        weights: weights([
          ['loyalty', 0.8],
          ['patience', 0.8],
          ['resource', 0.7],
        ]),
      },
      {
        label: '换个办法也行，正好试试新路线。',
        weights: weights([
          ['curiosity', 0.9],
          ['mobility', 0.7],
          ['independence', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q22-strange-market',
    prompt: '你走进一个没见过的小集市。',
    options: [
      {
        label: '先看看谁在交换什么，找找合适的交易。',
        weights: weights([
          ['trade', 1],
          ['resource', 0.8],
          ['social', 0.5],
        ]),
      },
      {
        label: '先看路、出口和人群动线，心里有底。',
        weights: weights([
          ['caution', 0.9],
          ['order', 0.8],
          ['stealth', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q23-messy-room',
    prompt: '房间乱得像刚被风吹过。',
    options: [
      {
        label: '从分类开始，把东西归位。',
        weights: weights([
          ['order', 1],
          ['patience', 0.7],
          ['resource', 0.5],
        ]),
      },
      {
        label: '先找最重要的东西，其他慢慢说。',
        weights: weights([
          ['resource', 0.8],
          ['curiosity', 0.6],
          ['mobility', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q24-morning-plan',
    prompt: '新的一天开始，你更喜欢？',
    options: [
      {
        label: '先列一个小计划，今天就不乱跑。',
        weights: weights([
          ['order', 1],
          ['patience', 0.5],
          ['caution', 0.4],
        ]),
      },
      {
        label: '先出门看看，计划可以在路上长出来。',
        weights: weights([
          ['curiosity', 1],
          ['mobility', 0.8],
          ['mischief', 0.3],
        ]),
      },
    ],
  },
  {
    id: 'q25-guard-duty',
    prompt: '今晚轮到你守夜。',
    options: [
      {
        label: '安静巡逻，任何动静都不放过。',
        weights: weights([
          ['protection', 0.9],
          ['caution', 0.8],
          ['stealth', 0.6],
        ]),
      },
      {
        label: '坐在高处看全局，关键时刻再出手。',
        weights: weights([
          ['patience', 0.9],
          ['order', 0.6],
          ['spectacle', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q26-prank-energy',
    prompt: '大家有点没精神，你想让气氛变好。',
    options: [
      {
        label: '搞一个小小的无害惊喜，让大家笑一下。',
        weights: weights([
          ['mischief', 1],
          ['social', 0.7],
          ['spectacle', 0.5],
        ]),
      },
      {
        label: '递点吃的、补点水，慢慢照顾回来。',
        weights: weights([
          ['nurture', 1],
          ['social', 0.6],
          ['resource', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q27-deep-water',
    prompt: '任务要经过一段深水。',
    options: [
      {
        label: '我可以适应水里的节奏，慢慢找路。',
        weights: weights([
          ['aquatic', 1],
          ['patience', 0.6],
          ['resilience', 0.4],
        ]),
      },
      {
        label: '我会尽快通过，不在水里拖太久。',
        weights: weights([
          ['mobility', 0.9],
          ['caution', 0.6],
          ['resource', 0.3],
        ]),
      },
    ],
  },
  {
    id: 'q28-big-decision',
    prompt: '一个决定会影响很多人。',
    options: [
      {
        label: '优先保护大家的安全，慢一点也没关系。',
        weights: weights([
          ['protection', 1],
          ['caution', 0.8],
          ['social', 0.5],
        ]),
      },
      {
        label: '抓住窗口期推进，错过就太可惜。',
        weights: weights([
          ['aggression', 0.8],
          ['mobility', 0.7],
          ['spectacle', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q29-secret-note',
    prompt: '你收到一张没署名的小纸条。',
    options: [
      {
        label: '把字迹、纸张和时机都研究一下。',
        weights: weights([
          ['curiosity', 1],
          ['caution', 0.6],
          ['order', 0.4],
        ]),
      },
      {
        label: '先藏好，不让别人被这件事打扰。',
        weights: weights([
          ['stealth', 0.9],
          ['protection', 0.7],
          ['patience', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q30-heavy-load',
    prompt: '大家要搬一堆很重的材料。',
    options: [
      {
        label: '分批慢慢搬，稳比快重要。',
        weights: weights([
          ['resilience', 1],
          ['patience', 0.8],
          ['order', 0.5],
        ]),
      },
      {
        label: '找捷径和工具，让搬运变轻一点。',
        weights: weights([
          ['resource', 0.9],
          ['curiosity', 0.7],
          ['mobility', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q31-spotlight-mistake',
    prompt: '你在大家面前出了小错。',
    options: [
      {
        label: '坦然笑笑，顺手把场面接住。',
        weights: weights([
          ['spectacle', 0.8],
          ['resilience', 0.7],
          ['social', 0.5],
        ]),
      },
      {
        label: '先退一步，安静修正错误。',
        weights: weights([
          ['caution', 0.8],
          ['stealth', 0.7],
          ['patience', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q32-old-path',
    prompt: '熟悉的小路被堵住了。',
    options: [
      {
        label: '换路，顺便看看有没有新风景。',
        weights: weights([
          ['curiosity', 1],
          ['mobility', 0.8],
          ['independence', 0.4],
        ]),
      },
      {
        label: '想办法清理障碍，把可靠路线修回来。',
        weights: weights([
          ['resilience', 0.8],
          ['loyalty', 0.7],
          ['order', 0.6],
        ]),
      },
    ],
  },
  {
    id: 'q33-new-neighbor',
    prompt: '旁边搬来一个有点神秘的新邻居。',
    options: [
      {
        label: '先保持礼貌距离，慢慢熟悉。',
        weights: weights([
          ['caution', 0.8],
          ['patience', 0.7],
          ['order', 0.4],
        ]),
      },
      {
        label: '带点小礼物过去，看看能不能聊起来。',
        weights: weights([
          ['social', 1],
          ['trade', 0.6],
          ['nurture', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q34-fast-shadow',
    prompt: '眼角闪过一个很快的影子。',
    options: [
      {
        label: '追上去看一眼，可能是线索。',
        weights: weights([
          ['mobility', 1],
          ['curiosity', 0.8],
          ['aggression', 0.3],
        ]),
      },
      {
        label: '先别动，判断它是不是在引你过去。',
        weights: weights([
          ['caution', 1],
          ['stealth', 0.7],
          ['patience', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q35-shared-home',
    prompt: '你和朋友一起布置公共空间。',
    options: [
      {
        label: '让每个人都有舒服的位置。',
        weights: weights([
          ['social', 1],
          ['nurture', 0.8],
          ['order', 0.4],
        ]),
      },
      {
        label: '做成好看又有记忆点的样子。',
        weights: weights([
          ['spectacle', 0.9],
          ['curiosity', 0.5],
          ['resource', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q36-risky-shortcut',
    prompt: '有条近路很快，但看起来不太稳。',
    options: [
      {
        label: '试试，但随时准备调整脚步。',
        weights: weights([
          ['mobility', 1],
          ['caution', 0.5],
          ['mischief', 0.4],
        ]),
      },
      {
        label: '绕远一点，少出意外才是真省时间。',
        weights: weights([
          ['patience', 0.9],
          ['caution', 0.8],
          ['order', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q37-little-one',
    prompt: '有个小家伙一直跟着你。',
    options: [
      {
        label: '放慢脚步照看它，别让它掉队。',
        weights: weights([
          ['nurture', 1],
          ['loyalty', 0.7],
          ['social', 0.5],
        ]),
      },
      {
        label: '带它认识周围，但也教它保持距离。',
        weights: weights([
          ['curiosity', 0.7],
          ['caution', 0.7],
          ['protection', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q38-missing-key',
    prompt: '重要钥匙不见了。',
    options: [
      {
        label: '按最后使用顺序一点点回忆。',
        weights: weights([
          ['order', 0.9],
          ['patience', 0.8],
          ['caution', 0.4],
        ]),
      },
      {
        label: '发动大家一起找，边找边交换线索。',
        weights: weights([
          ['social', 0.9],
          ['trade', 0.6],
          ['curiosity', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q39-glowing-room',
    prompt: '你发现一个会发光的小房间。',
    options: [
      {
        label: '研究它为什么发光，可能藏着机制。',
        weights: weights([
          ['curiosity', 1],
          ['resource', 0.5],
          ['order', 0.4],
        ]),
      },
      {
        label: '先确认有没有危险，再让大家进来。',
        weights: weights([
          ['protection', 0.9],
          ['caution', 0.8],
          ['social', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q40-loud-thunder',
    prompt: '雷声突然很响，大家都吓了一下。',
    options: [
      {
        label: '我会先稳住自己，再稳住别人。',
        weights: weights([
          ['resilience', 1],
          ['protection', 0.7],
          ['patience', 0.5],
        ]),
      },
      {
        label: '我会马上找遮蔽物，别站在危险处。',
        weights: weights([
          ['caution', 1],
          ['mobility', 0.6],
          ['order', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q41-festival-booth',
    prompt: '节日摊位需要一个主意。',
    options: [
      {
        label: '做一个亮眼的小表演，吸引大家来玩。',
        weights: weights([
          ['spectacle', 1],
          ['social', 0.7],
          ['mischief', 0.4],
        ]),
      },
      {
        label: '设计一个交换小礼物的规则，人人有收获。',
        weights: weights([
          ['trade', 1],
          ['order', 0.6],
          ['nurture', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q42-empty-pocket',
    prompt: '出门后发现背包里少带了东西。',
    options: [
      {
        label: '想办法就地替代，别让行程停住。',
        weights: weights([
          ['resource', 1],
          ['mobility', 0.6],
          ['resilience', 0.4],
        ]),
      },
      {
        label: '回去补齐，准备充分才安心。',
        weights: weights([
          ['caution', 0.9],
          ['order', 0.7],
          ['patience', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q43-quiet-compliment',
    prompt: '有人悄悄夸你做得好。',
    options: [
      {
        label: '开心收下，但更想继续把事情做好。',
        weights: weights([
          ['patience', 0.8],
          ['loyalty', 0.6],
          ['order', 0.4],
        ]),
      },
      {
        label: '把功劳也分给帮忙的人。',
        weights: weights([
          ['social', 0.9],
          ['nurture', 0.6],
          ['trade', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q44-unfair-moment',
    prompt: '你看到有人被不公平对待。',
    options: [
      {
        label: '站出来说明问题，不能让它过去。',
        weights: weights([
          ['protection', 1],
          ['aggression', 0.7],
          ['order', 0.5],
        ]),
      },
      {
        label: '先把受委屈的人带离现场，再想办法。',
        weights: weights([
          ['nurture', 0.9],
          ['caution', 0.7],
          ['loyalty', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q45-moving-target',
    prompt: '目标一直在变，计划跟不上。',
    options: [
      {
        label: '跟着变化快速调整，先别停。',
        weights: weights([
          ['mobility', 1],
          ['curiosity', 0.6],
          ['mischief', 0.4],
        ]),
      },
      {
        label: '抓住不变的部分，重新立一个框架。',
        weights: weights([
          ['order', 0.9],
          ['patience', 0.7],
          ['resilience', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q46-soft-boundary',
    prompt: '有人一直越过你的边界。',
    options: [
      {
        label: '明确说不，让边界被看见。',
        weights: weights([
          ['aggression', 0.8],
          ['order', 0.7],
          ['protection', 0.6],
        ]),
      },
      {
        label: '先拉开距离，用行动减少接触。',
        weights: weights([
          ['independence', 0.9],
          ['stealth', 0.7],
          ['caution', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q47-rare-find',
    prompt: '你找到一种很少见的材料。',
    options: [
      {
        label: '存起来，等真正需要时再用。',
        weights: weights([
          ['resource', 1],
          ['patience', 0.7],
          ['caution', 0.5],
        ]),
      },
      {
        label: '立刻试试它能做出什么效果。',
        weights: weights([
          ['curiosity', 1],
          ['spectacle', 0.5],
          ['mischief', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q48-night-walk',
    prompt: '夜里必须穿过一片空地。',
    options: [
      {
        label: '贴着阴影走，尽量不惊动任何东西。',
        weights: weights([
          ['stealth', 1],
          ['caution', 0.8],
          ['independence', 0.4],
        ]),
      },
      {
        label: '举着光走，让自己和路线都很明显。',
        weights: weights([
          ['spectacle', 0.8],
          ['protection', 0.6],
          ['order', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q49-team-signal',
    prompt: '队伍需要一个集合信号。',
    options: [
      {
        label: '简单、固定、大家一听就懂。',
        weights: weights([
          ['order', 1],
          ['social', 0.6],
          ['loyalty', 0.4],
        ]),
      },
      {
        label: '有点特别，最好听起来就很有记忆点。',
        weights: weights([
          ['spectacle', 0.9],
          ['mischief', 0.6],
          ['curiosity', 0.3],
        ]),
      },
    ],
  },
  {
    id: 'q50-long-wait',
    prompt: '等待时间比预想中久很多。',
    options: [
      {
        label: '能等，顺便整理信息和物资。',
        weights: weights([
          ['patience', 1],
          ['resource', 0.6],
          ['order', 0.5],
        ]),
      },
      {
        label: '坐不住，想找点能推进的小动作。',
        weights: weights([
          ['mobility', 0.9],
          ['curiosity', 0.7],
          ['mischief', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q51-broken-bridge-help',
    prompt: '别人过不了断桥，正在发愁。',
    options: [
      {
        label: '先搭一个稳稳的临时通道。',
        weights: weights([
          ['protection', 0.9],
          ['order', 0.8],
          ['resource', 0.5],
        ]),
      },
      {
        label: '教他找另一条路，自己走也能安全。',
        weights: weights([
          ['curiosity', 0.8],
          ['independence', 0.6],
          ['nurture', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q52-small-conflict',
    prompt: '小误会快要变成大冲突。',
    options: [
      {
        label: '立刻把话说开，别让它继续发酵。',
        weights: weights([
          ['social', 0.8],
          ['order', 0.7],
          ['aggression', 0.4],
        ]),
      },
      {
        label: '先降温，等大家都冷静再谈。',
        weights: weights([
          ['patience', 0.9],
          ['nurture', 0.7],
          ['caution', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q53-shiny-trap',
    prompt: '一个东西闪闪发光，但位置很可疑。',
    options: [
      {
        label: '不急着碰，先看周围有没有机关。',
        weights: weights([
          ['caution', 1],
          ['stealth', 0.6],
          ['order', 0.4],
        ]),
      },
      {
        label: '想办法隔空试一下，看看会发生什么。',
        weights: weights([
          ['curiosity', 0.9],
          ['mischief', 0.7],
          ['resource', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q54-home-defense',
    prompt: '你的家门口出现了陌生脚印。',
    options: [
      {
        label: '加固入口，今晚提高警觉。',
        weights: weights([
          ['protection', 1],
          ['caution', 0.8],
          ['order', 0.5],
        ]),
      },
      {
        label: '顺着脚印查来源，弄清谁来过。',
        weights: weights([
          ['curiosity', 0.9],
          ['stealth', 0.6],
          ['mobility', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q55-invisible-work',
    prompt: '有些工作没人看见，但很重要。',
    options: [
      {
        label: '没关系，安静做好也很有价值。',
        weights: weights([
          ['patience', 1],
          ['loyalty', 0.7],
          ['stealth', 0.5],
        ]),
      },
      {
        label: '至少要留下记录，让后来的人知道。',
        weights: weights([
          ['order', 0.9],
          ['social', 0.5],
          ['resource', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q56-quick-rescue',
    prompt: '有人差一点掉进坑里。',
    options: [
      {
        label: '马上伸手拉住，先救人再说。',
        weights: weights([
          ['protection', 1],
          ['mobility', 0.7],
          ['loyalty', 0.5],
        ]),
      },
      {
        label: '先喊停周围动作，别让更多人靠近。',
        weights: weights([
          ['order', 0.9],
          ['caution', 0.8],
          ['social', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q57-new-rule',
    prompt: '大家要制定一条新规则。',
    options: [
      {
        label: '规则要清楚，执行起来不能含糊。',
        weights: weights([
          ['order', 1],
          ['protection', 0.5],
          ['patience', 0.4],
        ]),
      },
      {
        label: '规则要留余地，不同情况可以调整。',
        weights: weights([
          ['curiosity', 0.6],
          ['social', 0.6],
          ['mischief', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q58-far-light',
    prompt: '远处有一点灯光，像是在邀请你过去。',
    options: [
      {
        label: '想去看看，光从哪里来很有意思。',
        weights: weights([
          ['curiosity', 1],
          ['mobility', 0.7],
          ['spectacle', 0.3],
        ]),
      },
      {
        label: '先绕一圈观察，别被光牵着走。',
        weights: weights([
          ['caution', 0.9],
          ['stealth', 0.7],
          ['patience', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q59-trade-offer',
    prompt: '有人提出一个看起来不错的交换。',
    options: [
      {
        label: '认真算算双方是不是都划算。',
        weights: weights([
          ['trade', 1],
          ['resource', 0.8],
          ['order', 0.4],
        ]),
      },
      {
        label: '先看对方是否可信，再谈条件。',
        weights: weights([
          ['caution', 0.9],
          ['social', 0.5],
          ['patience', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q60-colorful-choice',
    prompt: '你要给小屋选一种装饰风格。',
    options: [
      {
        label: '颜色多一点，进门就觉得开心。',
        weights: weights([
          ['spectacle', 0.9],
          ['social', 0.5],
          ['mischief', 0.4],
        ]),
      },
      {
        label: '颜色柔和一点，待久了也舒服。',
        weights: weights([
          ['patience', 0.8],
          ['nurture', 0.6],
          ['order', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q61-escape-route',
    prompt: '你进入一个新地方，会不会先记出口？',
    options: [
      {
        label: '会，知道怎么离开才放松。',
        weights: weights([
          ['caution', 1],
          ['order', 0.6],
          ['stealth', 0.4],
        ]),
      },
      {
        label: '不一定，我更想先看里面有什么。',
        weights: weights([
          ['curiosity', 1],
          ['independence', 0.5],
          ['mobility', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q62-tiny-mission',
    prompt: '有人拜托你送一件小东西。',
    options: [
      {
        label: '一定送到，还会确认对方收到。',
        weights: weights([
          ['loyalty', 1],
          ['social', 0.6],
          ['order', 0.5],
        ]),
      },
      {
        label: '送到路上顺便看看有没有更好的路线。',
        weights: weights([
          ['mobility', 0.8],
          ['curiosity', 0.7],
          ['resource', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q63-bumpy-road',
    prompt: '路很颠，事情也不太顺。',
    options: [
      {
        label: '咬咬牙继续，慢慢会过去。',
        weights: weights([
          ['resilience', 1],
          ['patience', 0.8],
          ['loyalty', 0.4],
        ]),
      },
      {
        label: '换个姿势前进，别硬扛同一种难受。',
        weights: weights([
          ['mobility', 0.9],
          ['curiosity', 0.5],
          ['caution', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q64-watch-or-act',
    prompt: '一件事刚露出苗头。',
    options: [
      {
        label: '先看它怎么发展，不急着插手。',
        weights: weights([
          ['patience', 1],
          ['caution', 0.6],
          ['stealth', 0.4],
        ]),
      },
      {
        label: '趁早处理，小问题别养成大问题。',
        weights: weights([
          ['aggression', 0.8],
          ['order', 0.7],
          ['protection', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q65-friendly-noise',
    prompt: '朋友突然来找你玩，声音还很大。',
    options: [
      {
        label: '被打断也没关系，一起热闹一下。',
        weights: weights([
          ['social', 1],
          ['mischief', 0.6],
          ['spectacle', 0.4],
        ]),
      },
      {
        label: '先把手上的事收尾，再慢慢加入。',
        weights: weights([
          ['order', 0.8],
          ['patience', 0.7],
          ['independence', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q66-soft-hiding',
    prompt: '你想一个人安静一会儿。',
    options: [
      {
        label: '找个没人注意的小角落回血。',
        weights: weights([
          ['stealth', 1],
          ['independence', 0.8],
          ['patience', 0.4],
        ]),
      },
      {
        label: '告诉亲近的人我需要一点时间。',
        weights: weights([
          ['social', 0.7],
          ['loyalty', 0.6],
          ['order', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q67-wild-idea',
    prompt: '脑袋里冒出一个有点离谱的点子。',
    options: [
      {
        label: '先试小规模，万一很好玩呢。',
        weights: weights([
          ['mischief', 1],
          ['curiosity', 0.8],
          ['mobility', 0.4],
        ]),
      },
      {
        label: '先写下来，等条件成熟再试。',
        weights: weights([
          ['patience', 0.8],
          ['order', 0.7],
          ['resource', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q68-stand-ground',
    prompt: '有人催你快点改变立场。',
    options: [
      {
        label: '如果我判断没错，就会稳稳站住。',
        weights: weights([
          ['resilience', 1],
          ['independence', 0.7],
          ['order', 0.4],
        ]),
      },
      {
        label: '我会听新信息，能调整就调整。',
        weights: weights([
          ['curiosity', 0.8],
          ['social', 0.6],
          ['mobility', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q69-little-shop',
    prompt: '如果开一个小摊，你更想卖什么？',
    options: [
      {
        label: '实用补给，让路过的人真的用得上。',
        weights: weights([
          ['resource', 1],
          ['trade', 0.8],
          ['nurture', 0.4],
        ]),
      },
      {
        label: '稀奇小玩意，让人忍不住停下来看。',
        weights: weights([
          ['spectacle', 0.8],
          ['curiosity', 0.7],
          ['trade', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q70-distant-friend',
    prompt: '很久没联系的朋友突然需要帮忙。',
    options: [
      {
        label: '能帮就帮，旧连接也值得认真对待。',
        weights: weights([
          ['loyalty', 1],
          ['nurture', 0.7],
          ['social', 0.5],
        ]),
      },
      {
        label: '先问清情况，别盲目答应。',
        weights: weights([
          ['caution', 0.9],
          ['order', 0.6],
          ['resource', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q71-falling-apart',
    prompt: '计划突然散架，大家有点慌。',
    options: [
      {
        label: '我会先把最危险的部分稳住。',
        weights: weights([
          ['protection', 0.9],
          ['resilience', 0.8],
          ['order', 0.5],
        ]),
      },
      {
        label: '我会快速找新机会，别陷在原计划里。',
        weights: weights([
          ['mobility', 1],
          ['curiosity', 0.7],
          ['aggression', 0.3],
        ]),
      },
    ],
  },
  {
    id: 'q72-muddy-boots',
    prompt: '鞋子踩了一脚泥，还要继续赶路。',
    options: [
      {
        label: '先擦干净，舒服了再走。',
        weights: weights([
          ['order', 0.8],
          ['patience', 0.7],
          ['caution', 0.4],
        ]),
      },
      {
        label: '先走，泥巴干了再处理。',
        weights: weights([
          ['resilience', 0.8],
          ['mobility', 0.7],
          ['independence', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q73-soft-warning',
    prompt: '你感觉某件事不太对劲，但证据还不够。',
    options: [
      {
        label: '先提醒亲近的人小心一点。',
        weights: weights([
          ['protection', 0.8],
          ['caution', 0.8],
          ['loyalty', 0.5],
        ]),
      },
      {
        label: '继续观察，等线索更明确。',
        weights: weights([
          ['patience', 0.9],
          ['stealth', 0.6],
          ['curiosity', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q74-bright-entrance',
    prompt: '如果必须登场，你希望怎么出现？',
    options: [
      {
        label: '利落、明确，让大家立刻知道我来了。',
        weights: weights([
          ['spectacle', 1],
          ['aggression', 0.6],
          ['order', 0.3],
        ]),
      },
      {
        label: '轻轻出现，先融入环境再行动。',
        weights: weights([
          ['stealth', 0.9],
          ['caution', 0.5],
          ['social', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q75-same-route',
    prompt: '同一条路线你已经走了很多遍。',
    options: [
      {
        label: '熟悉很好，稳定路线让人安心。',
        weights: weights([
          ['loyalty', 0.8],
          ['order', 0.7],
          ['patience', 0.5],
        ]),
      },
      {
        label: '想换条路，给今天一点新鲜感。',
        weights: weights([
          ['curiosity', 1],
          ['mobility', 0.7],
          ['mischief', 0.3],
        ]),
      },
    ],
  },
  {
    id: 'q76-help-reward',
    prompt: '帮完忙后，对方想回礼。',
    options: [
      {
        label: '收一点就好，心意到了就行。',
        weights: weights([
          ['social', 0.7],
          ['nurture', 0.6],
          ['loyalty', 0.5],
        ]),
      },
      {
        label: '那就换成彼此都需要的东西。',
        weights: weights([
          ['trade', 1],
          ['resource', 0.7],
          ['order', 0.3],
        ]),
      },
    ],
  },
  {
    id: 'q77-open-field',
    prompt: '一大片空地，什么都还没发生。',
    options: [
      {
        label: '想冲出去跑一圈，看看边界在哪。',
        weights: weights([
          ['mobility', 1],
          ['curiosity', 0.6],
          ['spectacle', 0.3],
        ]),
      },
      {
        label: '想先找个安全点，建立一个小据点。',
        weights: weights([
          ['caution', 0.9],
          ['protection', 0.6],
          ['order', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q78-gentle-promise',
    prompt: '你答应了一个不算大的承诺。',
    options: [
      {
        label: '哪怕很小，也要记得完成。',
        weights: weights([
          ['loyalty', 1],
          ['order', 0.6],
          ['patience', 0.4],
        ]),
      },
      {
        label: '如果情况变化，会及时解释和调整。',
        weights: weights([
          ['social', 0.7],
          ['mobility', 0.5],
          ['caution', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q79-warm-corner',
    prompt: '你发现一个很暖和的小角落。',
    options: [
      {
        label: '想把它变成大家都能休息的地方。',
        weights: weights([
          ['nurture', 1],
          ['social', 0.7],
          ['protection', 0.4],
        ]),
      },
      {
        label: '想自己静静待一会儿，恢复能量。',
        weights: weights([
          ['independence', 0.9],
          ['patience', 0.6],
          ['stealth', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q80-suspicious-smile',
    prompt: '有人笑得很神秘，好像知道什么。',
    options: [
      {
        label: '配合一下，看看谜底会不会自己出来。',
        weights: weights([
          ['mischief', 0.8],
          ['curiosity', 0.7],
          ['social', 0.4],
        ]),
      },
      {
        label: '不被带节奏，先守住自己的判断。',
        weights: weights([
          ['caution', 0.8],
          ['independence', 0.7],
          ['resilience', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q81-last-resource',
    prompt: '最后一份资源只够做一件事。',
    options: [
      {
        label: '用在最能保护大家的地方。',
        weights: weights([
          ['protection', 0.9],
          ['resource', 0.8],
          ['order', 0.4],
        ]),
      },
      {
        label: '用在最可能打开新局面的地方。',
        weights: weights([
          ['curiosity', 0.8],
          ['aggression', 0.5],
          ['spectacle', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q82-smooth-water',
    prompt: '水面很平，下面看不清。',
    options: [
      {
        label: '慢慢靠近，水下也许有答案。',
        weights: weights([
          ['aquatic', 1],
          ['curiosity', 0.6],
          ['patience', 0.4],
        ]),
      },
      {
        label: '不轻易下水，先从岸上判断。',
        weights: weights([
          ['caution', 0.9],
          ['order', 0.5],
          ['stealth', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q83-lost-child',
    prompt: '有人在陌生地方迷路了。',
    options: [
      {
        label: '陪他回到熟悉的地方，别让他害怕。',
        weights: weights([
          ['nurture', 1],
          ['protection', 0.8],
          ['social', 0.5],
        ]),
      },
      {
        label: '教他看标记和方向，下次能自己走。',
        weights: weights([
          ['order', 0.8],
          ['curiosity', 0.5],
          ['independence', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q84-hidden-strength',
    prompt: '你最希望自己的厉害之处像什么？',
    options: [
      {
        label: '平时不显眼，但关键时刻很可靠。',
        weights: weights([
          ['resilience', 1],
          ['stealth', 0.6],
          ['loyalty', 0.5],
        ]),
      },
      {
        label: '一出现就能改变局势，让人记住。',
        weights: weights([
          ['spectacle', 1],
          ['aggression', 0.7],
          ['mobility', 0.3],
        ]),
      },
    ],
  },
  {
    id: 'q85-half-finished',
    prompt: '一个作品只完成了一半。',
    options: [
      {
        label: '继续打磨，直到它真的完整。',
        weights: weights([
          ['patience', 1],
          ['order', 0.8],
          ['resilience', 0.4],
        ]),
      },
      {
        label: '先拿去试用，边用边补。',
        weights: weights([
          ['curiosity', 0.8],
          ['mobility', 0.6],
          ['mischief', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q86-crowded-boat',
    prompt: '一艘小船坐得满满的。',
    options: [
      {
        label: '安排好位置和重量，慢慢划。',
        weights: weights([
          ['aquatic', 0.8],
          ['order', 0.8],
          ['caution', 0.6],
        ]),
      },
      {
        label: '让大家轻松一点，路上聊聊天。',
        weights: weights([
          ['social', 0.9],
          ['nurture', 0.5],
          ['patience', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q87-unexpected-gift',
    prompt: '你收到一个完全没想到的礼物。',
    options: [
      {
        label: '先好好收着，珍惜这份心意。',
        weights: weights([
          ['loyalty', 0.8],
          ['resource', 0.6],
          ['nurture', 0.4],
        ]),
      },
      {
        label: '马上研究它能怎么玩、能做什么。',
        weights: weights([
          ['curiosity', 1],
          ['mischief', 0.5],
          ['spectacle', 0.3],
        ]),
      },
    ],
  },
  {
    id: 'q88-last-line',
    prompt: '队伍需要有人守住最后一道线。',
    options: [
      {
        label: '我可以留下，稳稳把线守住。',
        weights: weights([
          ['protection', 1],
          ['resilience', 0.9],
          ['loyalty', 0.5],
        ]),
      },
      {
        label: '我更适合从侧面找突破口。',
        weights: weights([
          ['mobility', 0.8],
          ['stealth', 0.7],
          ['aggression', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q89-odd-collection',
    prompt: '你会不会收集一些别人觉得奇怪的小东西？',
    options: [
      {
        label: '会，它们总有一天能派上用场。',
        weights: weights([
          ['resource', 1],
          ['curiosity', 0.7],
          ['patience', 0.4],
        ]),
      },
      {
        label: '不太会，我更喜欢保持轻便。',
        weights: weights([
          ['mobility', 0.8],
          ['order', 0.6],
          ['independence', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q90-spark-before-storm',
    prompt: '你感觉一场大事快要开始。',
    options: [
      {
        label: '兴奋，想站到能推动变化的位置。',
        weights: weights([
          ['aggression', 0.9],
          ['spectacle', 0.8],
          ['mobility', 0.4],
        ]),
      },
      {
        label: '警觉，想先保护好重要的人和物。',
        weights: weights([
          ['caution', 0.9],
          ['protection', 0.8],
          ['resource', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q91-tired-team',
    prompt: '队伍已经有点累了，但还没到终点。',
    options: [
      {
        label: '鼓励大家一小段一小段往前走。',
        weights: weights([
          ['resilience', 0.9],
          ['social', 0.7],
          ['nurture', 0.5],
        ]),
      },
      {
        label: '找一个安全点休整，恢复后再出发。',
        weights: weights([
          ['caution', 0.8],
          ['patience', 0.8],
          ['protection', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q92-unknown-button',
    prompt: '墙上有个没标签的按钮。',
    options: [
      {
        label: '想按，但会先找东西隔远一点试。',
        weights: weights([
          ['mischief', 0.9],
          ['curiosity', 0.8],
          ['caution', 0.4],
        ]),
      },
      {
        label: '先查清楚连接到哪里，不乱按。',
        weights: weights([
          ['order', 0.9],
          ['caution', 0.8],
          ['patience', 0.4],
        ]),
      },
    ],
  },
  {
    id: 'q93-final-door',
    prompt: '最后一扇门打开前，你更想确认什么？',
    options: [
      {
        label: '大家都准备好了，进去后能互相照应。',
        weights: weights([
          ['social', 0.9],
          ['protection', 0.8],
          ['loyalty', 0.5],
        ]),
      },
      {
        label: '线索、物资和退路都清楚，可以开始。',
        weights: weights([
          ['order', 0.8],
          ['resource', 0.7],
          ['caution', 0.6],
        ]),
      },
    ],
  },
]

export const questions: readonly Question[] = questionBlueprints.map(buildQuestion)

if (questions.length !== 93) {
  throw new Error(`Expected 93 MCTI questions, received ${questions.length}`)
}
