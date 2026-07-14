import type { Question, QuestionOption, QuestionTier, TraitVector } from '../types'
import { mobProfiles } from './mobs'

type ChoiceBlueprint = {
  label: string
  weights: TraitVector
}

type QuestionBlueprint = {
  id: string
  prompt: string
  options: readonly [ChoiceBlueprint, ChoiceBlueprint]
}

const targetMobCodes = (label: string): string[] => {
  const occupied: Array<readonly [number, number]> = []
  const targets: string[] = []

  for (const profile of [...mobProfiles].sort((left, right) => right.name.length - left.name.length)) {
    let index = label.indexOf(profile.name)
    while (index !== -1) {
      const end = index + profile.name.length
      if (!occupied.some(([start, stop]) => index < stop && end > start)) {
        occupied.push([index, end])
        targets.push(profile.code)
      }
      index = label.indexOf(profile.name, index + 1)
    }
  }

  return targets
}

const option = (id: 'a' | 'b', label: string, weights: TraitVector): QuestionOption => ({
  id,
  label,
  weights,
  targetMobCodes: targetMobCodes(label),
})

const weights = (entries: readonly (readonly [string, number])[]): TraitVector =>
  Object.fromEntries(entries)

const buildQuestion = (question: QuestionBlueprint, tier: QuestionTier): Question => ({
  id: question.id,
  prompt: question.prompt,
  tier,
  options: [
    option('a', question.options[0].label, question.options[0].weights),
    option('b', question.options[1].label, question.options[1].weights),
  ],
})

const questionBlueprints: readonly QuestionBlueprint[] = [
  {
    id: 'q01-lost-spark',
    prompt: '别人掉下一个小物件，你更像哪种反应？',
    options: [
      {
        label: '像悦灵一样捡起同类物品，尽量送回需要的人身边。',
        weights: weights([
          ['loyalty', 1],
          ['social', 0.8],
          ['nurture', 0.6],
          ['resource', 0.4],
        ]),
      },
      {
        label: '像嗅探兽一样先闻线索，弄清它从哪里来。',
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
    prompt: '洞穴里忽然传出细小声响，你会怎么处理？',
    options: [
      {
        label: '像蝙蝠、蜘蛛或洞穴蜘蛛一样轻轻靠近，先看黑暗里有什么。',
        weights: weights([
          ['curiosity', 1],
          ['stealth', 0.8],
          ['mobility', 0.5],
        ]),
      },
      {
        label: '像监守者会在意振动那样，先控住脚步和退路。',
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
    prompt: '同行的人走得慢，队伍快错过时间了。',
    options: [
      {
        label: '像快乐恶魂装上挽具后能载多人飞行一样，先接住走得慢的同伴。',
        weights: weights([
          ['social', 1],
          ['nurture', 0.9],
          ['loyalty', 0.7],
          ['patience', 0.4],
        ]),
      },
      {
        label: '像马或兔子先跑一段探路，再把安全路线带回来。',
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
    prompt: '新基地只剩一小块地方，你先安排什么？',
    options: [
      {
        label: '像铜傀儡把铜箱物品分到对应箱子一样，先把床、箱子、工具归位。',
        weights: weights([
          ['order', 1],
          ['resource', 0.8],
          ['patience', 0.5],
        ]),
      },
      {
        label: '像末影人搬方块那样，先留出以后改动的空间。',
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
    prompt: '朋友为了走哪条路线争起来了。',
    options: [
      {
        label: '像猪灵蛮兵守住堡垒遗迹一样，先挡住冲突扩散再定方向。',
        weights: weights([
          ['order', 0.8],
          ['aggression', 0.7],
          ['protection', 0.6],
          ['spectacle', 0.4],
        ]),
      },
      {
        label: '像海豚领路前会看水流一样，先听完两边线索。',
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
    prompt: '雨夜出门，路面湿漉漉的。',
    options: [
      {
        label: '像鱿鱼和鲑鱼适应水流一样，喜欢水汽里的慢节奏。',
        weights: weights([
          ['aquatic', 1],
          ['patience', 0.7],
          ['stealth', 0.4],
        ]),
      },
      {
        label: '像狐狸夜行一样，借雨声遮住脚步，快点办完事。',
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
    prompt: '突然有人闯进你的节奏里。',
    options: [
      {
        label: '像豹猫被靠近时会保持距离，先判断对方有没有危险。',
        weights: weights([
          ['caution', 1],
          ['stealth', 0.6],
          ['independence', 0.5],
        ]),
      },
      {
        label: '像流浪商人开摊一样，直接打招呼看看能不能合作。',
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
    prompt: '你拿到一张可能通向宝藏的地图。',
    options: [
      {
        label: '像驴或骡会带箱子一样，先把重要线索稳稳保管。',
        weights: weights([
          ['resource', 1],
          ['caution', 0.7],
          ['patience', 0.5],
        ]),
      },
      {
        label: '像海豚带人找沉船宝藏一样，马上沿线索出发。',
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
    prompt: '面前是一座很窄的桥，下面很深。',
    options: [
      {
        label: '像海龟回海滩那样，一步一步慢慢过也没关系。',
        weights: weights([
          ['caution', 1],
          ['patience', 0.9],
          ['resilience', 0.6],
        ]),
      },
      {
        label: '像山羊或旋风人那样看准角度，一下跨过去。',
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
    prompt: '大家找到一箱战利品，你先关心什么？',
    options: [
      {
        label: '像村民交易一样，把分配规则说清楚，别让谁吃亏。',
        weights: weights([
          ['order', 1],
          ['social', 0.7],
          ['trade', 0.6],
        ]),
      },
      {
        label: '像猪灵看重金子一样，先判断哪些东西最稀有。',
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
    prompt: '周围人很多、声音很杂，你会想躲到哪儿？',
    options: [
      {
        label: '像蝙蝠倒挂在暗处一样，找个安静角落等噪音过去。',
        weights: weights([
          ['stealth', 1],
          ['independence', 0.8],
          ['patience', 0.5],
        ]),
      },
      {
        label: '像雪傀儡主动向敌对生物投雪球一样，站到能看清全局的位置。',
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
        label: '像绵羊吃草后重新长出羊毛一样，稳定照料并等待恢复。',
        weights: weights([
          ['nurture', 1],
          ['patience', 0.9],
          ['order', 0.4],
        ]),
      },
      {
        label: '像嗅探兽寻找古种子一样，想试试不同种法。',
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
        label: '像村民按作息回村一样，立刻回头别把错误滚大。',
        weights: weights([
          ['caution', 0.9],
          ['order', 0.7],
          ['patience', 0.4],
        ]),
      },
      {
        label: '像末影人偶尔搬起方块一样，既然来了就顺便探索。',
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
        label: '像蠹虫藏进受虫蚀方块一样，先把自己藏好再观察。',
        weights: weights([
          ['stealth', 1],
          ['curiosity', 0.8],
          ['caution', 0.4],
        ]),
      },
      {
        label: '像村民进屋前有规矩一样，敲门说明来意。',
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
        label: '像美西螈优先扑向水里的敌对目标一样，先把威胁截住。',
        weights: weights([
          ['protection', 1],
          ['loyalty', 0.8],
          ['resilience', 0.6],
        ]),
      },
      {
        label: '像兔子或猫一样迅速拉开距离，再找机会反制。',
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
    prompt: '如果必须让所有人注意到一件事。',
    options: [
      {
        label: '像苦力怕爆点或恶魂火球一样，做得醒目到无法忽略。',
        weights: weights([
          ['spectacle', 1],
          ['aggression', 0.5],
          ['social', 0.4],
        ]),
      },
      {
        label: '像潜影贝守城一样，把线索摆清楚，让人自然发现。',
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
    prompt: '背包只能带一种路上小补给。',
    options: [
      {
        label: '像鸡定期下蛋、绵羊重新长毛、牛提供牛奶一样，带稳定耐用的补给。',
        weights: weights([
          ['resource', 1],
          ['caution', 0.6],
          ['resilience', 0.4],
        ]),
      },
      {
        label: '像猪跟着胡萝卜一样，带大家都愿意分着吃的。',
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
        label: '像鳕鱼和鲑鱼在水里成群游动，想多待一会儿听水声。',
        weights: weights([
          ['aquatic', 1],
          ['patience', 0.7],
          ['caution', 0.3],
        ]),
      },
      {
        label: '像海豚绕着遗迹领路一样，想沿岸找隐藏线索。',
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
        label: '像村民职业规则一样，先听完再玩才公平。',
        weights: weights([
          ['order', 1],
          ['patience', 0.7],
          ['social', 0.4],
        ]),
      },
      {
        label: '像硫方怪吸收方块后由材质改变弹跳一样，先试再理解规则。',
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
        label: '像猫或末影人一样，按自己的节奏悄悄做完。',
        weights: weights([
          ['independence', 1],
          ['stealth', 0.7],
          ['patience', 0.4],
        ]),
      },
      {
        label: '像狼跟随主人一样，先问清大家期待再行动。',
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
        label: '像铁傀儡守住村庄一样，先修熟悉可靠的东西。',
        weights: weights([
          ['loyalty', 0.8],
          ['patience', 0.8],
          ['resource', 0.7],
        ]),
      },
      {
        label: '像女巫按威胁选择饮用或投掷药水一样，马上换一套办法。',
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
        label: '像村民或猪灵一样，先看交换规则和货物价值。',
        weights: weights([
          ['trade', 1],
          ['resource', 0.8],
          ['social', 0.5],
        ]),
      },
      {
        label: '像豹猫进陌生地方一样，先看出口、人群和动线。',
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
    prompt: '房间乱得像被劫掠兽冲过。',
    options: [
      {
        label: '像盔甲架陈列装备一样，从分类开始把东西归位。',
        weights: weights([
          ['order', 1],
          ['patience', 0.7],
          ['resource', 0.5],
        ]),
      },
      {
        label: '像狐狸叼走目标一样，先找最重要的东西。',
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
    prompt: '新的一天开始，你更喜欢哪种节奏？',
    options: [
      {
        label: '像村民按职业上工一样，先列小计划。',
        weights: weights([
          ['order', 1],
          ['patience', 0.5],
          ['caution', 0.4],
        ]),
      },
      {
        label: '像蝙蝠飞出洞穴一样，先出门看看，计划路上再长出来。',
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
        label: '像沼骸在沼泽里用毒箭压住远处威胁一样，保持距离巡夜。',
        weights: weights([
          ['protection', 0.9],
          ['caution', 0.8],
          ['stealth', 0.6],
        ]),
      },
      {
        label: '像潜影贝守在末地城一样，坐在高处等关键时刻。',
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
        label: '像鹦鹉模仿声音一样，搞个无害小惊喜让大家笑。',
        weights: weights([
          ['mischief', 1],
          ['social', 0.7],
          ['spectacle', 0.5],
        ]),
      },
      {
        label: '像蜜蜂回巢一样，递点吃的水，慢慢照顾回来。',
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
        label: '像溺尸能游泳并投三叉戟、僵尸鹦鹉螺能水下冲刺一样，主动适应深水。',
        weights: weights([
          ['aquatic', 1],
          ['patience', 0.6],
          ['resilience', 0.4],
        ]),
      },
      {
        label: '像兔子过危险地带一样，尽快通过，不在水里拖太久。',
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
        label: '像僵尸猪灵一只受击就会召来同类反击一样，先保护整个群体。',
        weights: weights([
          ['protection', 1],
          ['caution', 0.8],
          ['social', 0.5],
        ]),
      },
      {
        label: '像僵尸疣猪兽会攻击几乎所有生物一样，抓住窗口直接推进。',
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
        label: '像嗅探兽找古种子一样，把字迹和时机都研究一下。',
        weights: weights([
          ['curiosity', 1],
          ['caution', 0.6],
          ['order', 0.4],
        ]),
      },
      {
        label: '像潜影贝关上外壳一样，先藏好不让别人被打扰。',
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
        label: '像羊驼和行商羊驼组成驼队、背箱搬运一样，分批稳稳送到。',
        weights: weights([
          ['resilience', 1],
          ['patience', 0.8],
          ['order', 0.5],
        ]),
      },
      {
        label: '像狐狸找机会一样，先找捷径和工具让搬运变轻。',
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
        label: '像热带鱼颜色鲜明一样，坦然笑笑把场面接住。',
        weights: weights([
          ['spectacle', 0.8],
          ['resilience', 0.7],
          ['social', 0.5],
        ]),
      },
      {
        label: '像鱿鱼喷墨后撤一样，先退一步安静修正。',
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
        label: '像海豚换水路一样，换路顺便看看新风景。',
        weights: weights([
          ['curiosity', 1],
          ['mobility', 0.8],
          ['independence', 0.4],
        ]),
      },
      {
        label: '像铁傀儡修回防线一样，把可靠路线清理回来。',
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
        label: '像豹猫保持距离一样，先礼貌观察，慢慢熟悉。',
        weights: weights([
          ['caution', 0.8],
          ['patience', 0.7],
          ['order', 0.4],
        ]),
      },
      {
        label: '像村民互相交流一样，带点小礼物过去聊聊。',
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
        label: '像恼鬼穿过方块、末影螨突然窜出一样，追上去查清。',
        weights: weights([
          ['mobility', 1],
          ['curiosity', 0.8],
          ['aggression', 0.3],
        ]),
      },
      {
        label: '像监守者听振动一样，先别动，判断是不是诱饵。',
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
        label: '像村庄要照顾每个职业一样，让每个人都有舒服位置。',
        weights: weights([
          ['social', 1],
          ['nurture', 0.8],
          ['order', 0.4],
        ]),
      },
      {
        label: '像哞菇岛那样做成稀有又有记忆点的样子。',
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
        label: '像山羊跳过高处一样，试试但随时准备调整。',
        weights: weights([
          ['mobility', 1],
          ['caution', 0.5],
          ['mischief', 0.4],
        ]),
      },
      {
        label: '像疣猪兽遇到诡异菌会退开一样，宁可绕行也不硬闯。',
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
        label: '像海龟照顾蛋或蜜蜂护巢一样，放慢脚步照看它。',
        weights: weights([
          ['nurture', 1],
          ['loyalty', 0.7],
          ['social', 0.5],
        ]),
      },
      {
        label: '像北极熊护幼崽一样，带它认识周围也保持距离。',
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
        label: '像村民按作息找线索一样，按最后使用顺序回忆。',
        weights: weights([
          ['order', 0.9],
          ['patience', 0.8],
          ['caution', 0.4],
        ]),
      },
      {
        label: '像海豚和同伴寻宝一样，发动大家边找边交换线索。',
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
        label: '像青蛙吃下小型岩浆怪会产出蛙明灯一样，研究光是怎样产生的。',
        weights: weights([
          ['curiosity', 1],
          ['resource', 0.5],
          ['order', 0.4],
        ]),
      },
      {
        label: '像守卫者和远古守卫者守住海底神殿一样，先封住入口。',
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
        label: '像骷髅马陷阱过后仍冷静一样，先稳住自己和别人。',
        weights: weights([
          ['resilience', 1],
          ['protection', 0.7],
          ['patience', 0.5],
        ]),
      },
      {
        label: '像犰狳受惊蜷缩一样，马上找遮蔽物。',
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
        label: '像鹦鹉或热带鱼一样，做个亮眼表演吸引大家。',
        weights: weights([
          ['spectacle', 1],
          ['social', 0.7],
          ['mischief', 0.4],
        ]),
      },
      {
        label: '像村民交易一样，设计交换小礼物的规则。',
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
        label: '像狐狸会叼现成物品一样，就地找替代，别让行程停住。',
        weights: weights([
          ['resource', 1],
          ['mobility', 0.6],
          ['resilience', 0.4],
        ]),
      },
      {
        label: '像驴带箱子前先备齐一样，回去补齐才安心。',
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
        label: '像忠诚的狼一样开心收下，然后继续把事做好。',
        weights: weights([
          ['patience', 0.8],
          ['loyalty', 0.6],
          ['order', 0.4],
        ]),
      },
      {
        label: '像蜜蜂群体协作一样，把功劳也分给帮忙的人。',
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
        label: '像卫道士举斧追击目标一样，直接站出来制止。',
        weights: weights([
          ['protection', 1],
          ['aggression', 0.7],
          ['order', 0.5],
        ]),
      },
      {
        label: '像猫把危险挡在门外一样，先把受委屈的人带离现场。',
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
    prompt: '前路被复杂障碍堵住，你更像怎样突破？',
    options: [
      {
        label: '像旋风人跳跃换位并用风弹改变战场，绕着障碍制造空间。',
        weights: weights([
          ['mobility', 1],
          ['spectacle', 0.7],
          ['aggression', 0.5],
        ]),
      },
      {
        label: '像末影螨体型小又突然出现，贴着缝隙快速钻进去。',
        weights: weights([
          ['stealth', 0.9],
          ['mischief', 0.7],
          ['mobility', 0.5],
        ]),
      },
    ],
  },
  {
    id: 'q46-soft-boundary',
    prompt: '有人一直越过你的边界。',
    options: [
      {
        label: '像河豚靠近威胁就膨胀一样，明确说不。',
        weights: weights([
          ['aggression', 0.8],
          ['order', 0.7],
          ['protection', 0.6],
        ]),
      },
      {
        label: '像豹猫不让人突然靠近一样，先拉开距离减少接触。',
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
        label: '像猪灵看重金锭一样，存起来等关键时候用。',
        weights: weights([
          ['resource', 1],
          ['patience', 0.7],
          ['caution', 0.5],
        ]),
      },
      {
        label: '像硫方怪吸收不同方块会改变物理特性一样，立刻测试材料效果。',
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
        label: '像苦力怕无声靠近一样，贴着阴影走，不惊动任何东西。',
        weights: weights([
          ['stealth', 1],
          ['caution', 0.8],
          ['independence', 0.4],
        ]),
      },
      {
        label: '像烈焰人或恶魂一样举着光，让路线被看见。',
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
        label: '像村民钟声和作息一样，简单固定，大家一听就懂。',
        weights: weights([
          ['order', 1],
          ['social', 0.6],
          ['loyalty', 0.4],
        ]),
      },
      {
        label: '像鹦鹉模仿怪声一样，特别一点才有记忆点。',
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
        label: '像凋灵生成时先蓄满生命再爆发一样，等准备完成再行动。',
        weights: weights([
          ['patience', 1],
          ['resilience', 0.8],
          ['spectacle', 0.5],
        ]),
      },
      {
        label: '像史莱姆和岩浆怪不断跳跃、受击后还能分裂一样，坐不住想找点动作。',
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
        label: '像铁傀儡守路一样，先搭一个稳稳的临时通道。',
        weights: weights([
          ['protection', 0.9],
          ['order', 0.8],
          ['resource', 0.5],
        ]),
      },
      {
        label: '像海豚领路一样，教他找另一条安全路线。',
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
    prompt: '小误会快变成大冲突。',
    options: [
      {
        label: '像村民交易要说清条件一样，立刻把话说开。',
        weights: weights([
          ['social', 0.8],
          ['order', 0.7],
          ['aggression', 0.4],
        ]),
      },
      {
        label: '像熊猫按情绪节奏生活一样，先降温再谈。',
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
        label: '像豹猫看见陌生人一样，不急着碰，先看有没有机关。',
        weights: weights([
          ['caution', 1],
          ['stealth', 0.6],
          ['order', 0.4],
        ]),
      },
      {
        label: '像唤魔者先放出恼鬼试探一样，隔着距离看看会发生什么。',
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
        label: '像铁傀儡守村一样，加固入口提高警觉。',
        weights: weights([
          ['protection', 1],
          ['caution', 0.8],
          ['order', 0.5],
        ]),
      },
      {
        label: '像僵尸会寻找抵达目标的最短路径一样，顺着脚印查来源。',
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
        label: '像猫夜里守门一样，安静做好也有价值。',
        weights: weights([
          ['patience', 1],
          ['loyalty', 0.7],
          ['stealth', 0.5],
        ]),
      },
      {
        label: '像村民工作站记录职业一样，留下记录给后来的人。',
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
        label: '像狼扑上去护主一样，马上伸手先救人。',
        weights: weights([
          ['protection', 1],
          ['mobility', 0.7],
          ['loyalty', 0.5],
        ]),
      },
      {
        label: '像村民敲钟避难一样，先喊停周围动作。',
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
        label: '像村民职业和交易规则一样，清楚执行不能含糊。',
        weights: weights([
          ['order', 1],
          ['protection', 0.5],
          ['patience', 0.4],
        ]),
      },
      {
        label: '像狐狸夜行路线一样，规则要能随情况调整。',
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
    prompt: '远处有一点灯光，像在邀请你过去。',
    options: [
      {
        label: '像发光鱿鱼吸引目光一样，想去看看光从哪来。',
        weights: weights([
          ['curiosity', 1],
          ['mobility', 0.7],
          ['spectacle', 0.3],
        ]),
      },
      {
        label: '像监守者不靠视觉判断一样，先绕一圈观察。',
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
        label: '像村民和猪灵一样，认真算双方是否划算。',
        weights: weights([
          ['trade', 1],
          ['resource', 0.8],
          ['order', 0.4],
        ]),
      },
      {
        label: '像豹猫建立信任一样，先看对方是否可信。',
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
        label: '像热带鱼花纹一样，颜色多一点，进门就开心。',
        weights: weights([
          ['spectacle', 0.9],
          ['social', 0.5],
          ['mischief', 0.4],
        ]),
      },
      {
        label: '像熊猫竹林一样，柔和舒服，待久也不累。',
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
    prompt: '进入一个新地方，你会不会先记出口？',
    options: [
      {
        label: '像犰狳先确认安全一样，会，知道怎么离开才放松。',
        weights: weights([
          ['caution', 1],
          ['order', 0.6],
          ['stealth', 0.4],
        ]),
      },
      {
        label: '像悦灵飞去找物品一样，不一定，更想先看里面有什么。',
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
        label: '像悦灵把物品投回主人或音符盒旁一样，一定送到。',
        weights: weights([
          ['loyalty', 1],
          ['social', 0.6],
          ['order', 0.5],
        ]),
      },
      {
        label: '像海豚带路一样，送的路上顺便找更好路线。',
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
        label: '像骆驼和骆驼尸壳都能蓄力冲刺越障一样，咬咬牙继续。',
        weights: weights([
          ['resilience', 1],
          ['patience', 0.8],
          ['loyalty', 0.4],
        ]),
      },
      {
        label: '像山羊换落脚点一样，换个姿势前进。',
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
        label: '像潜影贝先关壳观察一样，不急着插手。',
        weights: weights([
          ['patience', 1],
          ['caution', 0.6],
          ['stealth', 0.4],
        ]),
      },
      {
        label: '像铁傀儡看见威胁就行动一样，趁早处理。',
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
        label: '像鹦鹉停在肩上热闹一下，被打断也没关系。',
        weights: weights([
          ['social', 1],
          ['mischief', 0.6],
          ['spectacle', 0.4],
        ]),
      },
      {
        label: '像村民先完成工作一样，把手上的事收尾再加入。',
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
        label: '像蝙蝠待在洞顶一样，找个没人注意的小角落回血。',
        weights: weights([
          ['stealth', 1],
          ['independence', 0.8],
          ['patience', 0.4],
        ]),
      },
      {
        label: '像驯服的狼一样，告诉亲近的人我需要一点时间。',
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
        label: '像唤魔者先召出恼鬼和尖牙试探一样，先小规模验证。',
        weights: weights([
          ['mischief', 1],
          ['curiosity', 0.8],
          ['mobility', 0.4],
        ]),
      },
      {
        label: '像嗅探兽慢慢找种子一样，先记下来等条件成熟。',
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
        label: '像监守者站在深暗里一样，判断没错就稳稳站住。',
        weights: weights([
          ['resilience', 1],
          ['independence', 0.7],
          ['order', 0.4],
        ]),
      },
      {
        label: '像蝌蚪会按成长环境变成不同青蛙、僵尸村民也能被治愈一样，有新条件就调整。',
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
        label: '像村民职业交易一样，卖路过的人真用得上的补给。',
        weights: weights([
          ['resource', 1],
          ['trade', 0.8],
          ['nurture', 0.4],
        ]),
      },
      {
        label: '像流浪商人一样，卖稀奇小玩意让人停下来看。',
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
        label: '像狼认定同伴后会跟随一样，能帮就认真帮。',
        weights: weights([
          ['loyalty', 1],
          ['nurture', 0.7],
          ['social', 0.5],
        ]),
      },
      {
        label: '像豹猫慢慢建立信任一样，先问清情况再答应。',
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
        label: '像铁傀儡先挡住危险一样，稳住最危险的部分。',
        weights: weights([
          ['protection', 0.9],
          ['resilience', 0.8],
          ['order', 0.5],
        ]),
      },
      {
        label: '像旋风人跳跃换位一样，快速找新机会。',
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
        label: '像村民回家前整理路线一样，先擦干净再走。',
        weights: weights([
          ['order', 0.8],
          ['patience', 0.7],
          ['caution', 0.4],
        ]),
      },
      {
        label: '像尸壳在沙漠日光下也不会燃烧一样，先赶路，环境问题稍后处理。',
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
    prompt: '你感觉某件事不对劲，但证据还不够。',
    options: [
      {
        label: '像猫驱离危险一样，先提醒亲近的人小心。',
        weights: weights([
          ['protection', 0.8],
          ['caution', 0.8],
          ['loyalty', 0.5],
        ]),
      },
      {
        label: '像监守者等振动更明确一样，继续观察。',
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
        label: '像恶魂火球、凋灵生成或幻翼俯冲一样，利落明确地登场。',
        weights: weights([
          ['spectacle', 1],
          ['aggression', 0.6],
          ['order', 0.3],
        ]),
      },
      {
        label: '像苦力怕接近前那么安静，先融入环境再行动。',
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
        label: '像海龟记得出生海滩一样，熟悉路线让人安心。',
        weights: weights([
          ['loyalty', 0.8],
          ['order', 0.7],
          ['patience', 0.5],
        ]),
      },
      {
        label: '像末影人瞬移一样，想换条路给今天一点新鲜感。',
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
        label: '像悦灵送回物品一样，收一点心意就好。',
        weights: weights([
          ['social', 0.7],
          ['nurture', 0.6],
          ['loyalty', 0.5],
        ]),
      },
      {
        label: '像村民交易一样，换成彼此都需要的东西。',
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
        label: '像马或僵尸马在开阔地奔跑一样，想冲出去看看边界。',
        weights: weights([
          ['mobility', 1],
          ['curiosity', 0.6],
          ['spectacle', 0.3],
        ]),
      },
      {
        label: '像铁傀儡先守村一样，找安全点建立小据点。',
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
        label: '像狼保持跟随一样，哪怕很小也要完成。',
        weights: weights([
          ['loyalty', 1],
          ['order', 0.6],
          ['patience', 0.4],
        ]),
      },
      {
        label: '像海豚顺流领路一样，情况变化就及时解释调整。',
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
        label: '像蜜蜂回巢一样，想把它变成大家能休息的地方。',
        weights: weights([
          ['nurture', 1],
          ['social', 0.7],
          ['protection', 0.4],
        ]),
      },
      {
        label: '像猫窝在一边一样，想自己静静恢复能量。',
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
        label: '像鹦鹉模仿声音一样，配合看看谜底会不会出来。',
        weights: weights([
          ['mischief', 0.8],
          ['curiosity', 0.7],
          ['social', 0.4],
        ]),
      },
      {
        label: '像末影人不喜欢被直视一样，不被带节奏，守住判断。',
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
        label: '像铁傀儡和北极熊护住重要对象一样，用在保护大家。',
        weights: weights([
          ['protection', 0.9],
          ['resource', 0.8],
          ['order', 0.4],
        ]),
      },
      {
        label: '像嗅探兽找到古种子一样，用在最可能打开新局的地方。',
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
        label: '像鳕鱼、鲑鱼和鹦鹉螺一样，慢慢靠近水下答案。',
        weights: weights([
          ['aquatic', 1],
          ['curiosity', 0.6],
          ['patience', 0.4],
        ]),
      },
      {
        label: '像河豚边界清楚一样，不轻易下水，先从岸上判断。',
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
        label: '像海龟回出生海滩一样，陪他回到熟悉地方。',
        weights: weights([
          ['nurture', 1],
          ['protection', 0.8],
          ['social', 0.5],
        ]),
      },
      {
        label: '像村民认路和作息一样，教他看标记和方向。',
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
        label: '像铁傀儡平时沉默但关键可靠一样，不显眼也能扛事。',
        weights: weights([
          ['resilience', 1],
          ['stealth', 0.6],
          ['loyalty', 0.5],
        ]),
      },
      {
        label: '像末影龙或凋灵一样，一出现就改变局势。',
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
        label: '像潜影贝守阵地一样，继续打磨直到完整。',
        weights: weights([
          ['patience', 1],
          ['order', 0.8],
          ['resilience', 0.4],
        ]),
      },
      {
        label: '像铜傀儡逐箱检查分类条件一样，先投入使用再补齐规则。',
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
        label: '像海龟和鹦鹉螺懂水路一样，安排重量慢慢划。',
        weights: weights([
          ['aquatic', 0.8],
          ['order', 0.8],
          ['caution', 0.6],
        ]),
      },
      {
        label: '像海豚结伴游动一样，让大家轻松聊天。',
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
        label: '像悦灵珍惜被给予的物品一样，先好好收着。',
        weights: weights([
          ['loyalty', 0.8],
          ['resource', 0.6],
          ['nurture', 0.4],
        ]),
      },
      {
        label: '像硫方怪吸收方块后显出内部材质一样，马上试它能改变什么。',
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
        label: '像猪灵蛮兵守堡垒遗迹、凋灵骷髅守下界要塞一样，留下守住最后一线。',
        weights: weights([
          ['protection', 1],
          ['resilience', 0.9],
          ['loyalty', 0.5],
        ]),
      },
      {
        label: '像恼鬼能穿过方块一样，从侧面绕进突破口。',
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
    prompt: '你会不会收集别人觉得奇怪的小东西？',
    options: [
      {
        label: '像狐狸叼物、悦灵捡物一样，会，它们总有一天有用。',
        weights: weights([
          ['resource', 1],
          ['curiosity', 0.7],
          ['patience', 0.4],
        ]),
      },
      {
        label: '像马或兔子保持轻快一样，不太会，轻便更重要。',
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
    prompt: '你感觉一场大事快开始了。',
    options: [
      {
        label: '像掠夺者组织袭击、劫掠兽冲阵一样，站到推动攻势的位置。',
        weights: weights([
          ['aggression', 0.9],
          ['spectacle', 0.8],
          ['mobility', 0.4],
        ]),
      },
      {
        label: '像铁傀儡守村一样，先保护重要的人和物。',
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
        label: '像炽足兽在熔岩上坚持一样，鼓励大家一段段往前。',
        weights: weights([
          ['resilience', 0.9],
          ['social', 0.7],
          ['nurture', 0.5],
        ]),
      },
      {
        label: '像海龟慢节奏一样，找安全点休整后再出发。',
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
        label: '像末影螨会从末影珍珠落点突然出现一样，隔远一点按下去试。',
        weights: weights([
          ['mischief', 0.9],
          ['curiosity', 0.8],
          ['caution', 0.4],
        ]),
      },
      {
        label: '像嘎枝与嘎枝之心相连一样，先查清按钮连接到哪里。',
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
        label: '像狼群和铁傀儡一样，确认大家进去后能互相照应。',
        weights: weights([
          ['social', 0.9],
          ['protection', 0.8],
          ['loyalty', 0.5],
        ]),
      },
      {
        label: '像骷髅保持远程、流浪者、沼骸和焦骸用特殊箭控场一样，确认威胁再进门。',
        weights: weights([
          ['order', 0.8],
          ['resource', 0.7],
          ['caution', 0.6],
        ]),
      },
    ],
  },
]

const directTieBreaker = (
  id: string,
  prompt: string,
  firstLabel: string,
  firstWeights: TraitVector,
  secondLabel: string,
  secondWeights: TraitVector,
): QuestionBlueprint => ({
  id,
  prompt,
  options: [
    { label: firstLabel, weights: firstWeights },
    { label: secondLabel, weights: secondWeights },
  ],
})

const adaptiveTieBreakerBlueprints: readonly QuestionBlueprint[] = [
  directTieBreaker(
    'q94-air-control',
    '复杂局面里，你更习惯怎样掌控空间？',
    '像末影龙盘旋俯冲，或凋灵浮空追击一样，从空中持续施压。',
    weights([['mobility', 1], ['aggression', 0.8], ['spectacle', 0.5]]),
    '像烈焰人定点发射火球、岩浆怪跳跃逼近，或劫掠兽正面冲撞一样，守住地面节奏。',
    weights([['aggression', 1], ['resilience', 0.7], ['order', 0.4]]),
  ),
  directTieBreaker(
    'q95-damage-response',
    '计划受挫后，你会用哪种方式重新建立优势？',
    '像岩浆怪分裂后继续行动，或凋灵进入护甲阶段一样，改变形态继续推进。',
    weights([['resilience', 1], ['aggression', 0.7], ['mobility', 0.4]]),
    '像烈焰人重整火球齐射、末影龙回到传送门，或劫掠兽用怒吼反击一样，重置攻击节奏。',
    weights([['order', 0.9], ['spectacle', 0.8], ['aggression', 0.6]]),
  ),
  directTieBreaker(
    'q96-battle-movement',
    '需要持续移动时，哪种路线更像你？',
    '像末影龙在空中绕行，或岩浆怪连续跳跃一样，用大范围移动寻找角度。',
    weights([['mobility', 1], ['independence', 0.6], ['curiosity', 0.4]]),
    '像烈焰人悬浮守位、凋灵贴近目标，或劫掠兽直线冲锋一样，围绕目标施压。',
    weights([['aggression', 0.9], ['patience', 0.7], ['order', 0.5]]),
  ),
  directTieBreaker(
    'q97-break-through',
    '前路被挡住时，你更接近哪种反应？',
    '像劫掠兽冲撞并用怒吼震开周围一样，直接制造突破口。',
    weights([['aggression', 1], ['spectacle', 0.8], ['resilience', 0.6]]),
    '像烈焰人远程齐射、末影龙改变航线、岩浆怪跳过地形或凋灵炸开障碍一样，换手段处理。',
    weights([['mobility', 0.8], ['resource', 0.7], ['curiosity', 0.5]]),
  ),
  directTieBreaker(
    'q98-long-pressure',
    '面对一场拉长的对抗，你更愿意怎样保持压力？',
    '像末影龙循环俯冲、凋灵持续追击，或劫掠兽反复冲撞一样，不断迫使对方应对。',
    weights([['aggression', 0.9], ['resilience', 0.8], ['spectacle', 0.5]]),
    '像烈焰人等待齐射窗口，或岩浆怪按跳跃节奏逼近一样，把爆发留在固定节拍。',
    weights([['patience', 0.9], ['order', 0.8], ['aggression', 0.5]]),
  ),
  directTieBreaker(
    'q99-second-wave',
    '第一轮行动结束后，你更像哪一边？',
    '像岩浆怪分裂、凋灵恢复生命，或劫掠兽怒吼一样，立刻形成第二轮冲击。',
    weights([['resilience', 1], ['aggression', 0.8], ['spectacle', 0.5]]),
    '像烈焰人重新蓄起火球，或末影龙再次盘旋一样，拉开距离准备下一轮。',
    weights([['patience', 0.8], ['mobility', 0.8], ['order', 0.5]]),
  ),
  directTieBreaker(
    'q100-home-arena',
    '如果要选择最能发挥自己的场地，你更偏向哪里？',
    '像末影龙占据末地空域、岩浆怪适应熔岩，或劫掠兽参与袭击一样，在开阔战场制造存在感。',
    weights([['spectacle', 1], ['mobility', 0.7], ['aggression', 0.5]]),
    '像烈焰人守在下界要塞，或凋灵由召唤而来一样，在明确据点等待关键时机。',
    weights([['order', 0.9], ['patience', 0.8], ['resilience', 0.4]]),
  ),
  directTieBreaker(
    'q101-threat-angle',
    '你发现对方只盯着正面时，会怎样利用这一点？',
    '像末影龙从空中换向，或凋灵飞到新的高度一样，改变攻击角度。',
    weights([['mobility', 1], ['curiosity', 0.6], ['aggression', 0.5]]),
    '像烈焰人维持射界、岩浆怪迎面跳近，或劫掠兽继续冲锋一样，把正面压力推到底。',
    weights([['aggression', 1], ['patience', 0.6], ['resilience', 0.5]]),
  ),
  directTieBreaker(
    'q102-form-change',
    '局势要求改变作战形态时，哪种变化更像你？',
    '像岩浆怪由大变小继续行动，或凋灵半血后阻挡远程攻击一样，改变规则继续战斗。',
    weights([['resilience', 1], ['resource', 0.7], ['mischief', 0.4]]),
    '像烈焰人切换齐射、末影龙切换盘旋与栖息，或劫掠兽切换冲撞与怒吼一样，改变动作组合。',
    weights([['order', 0.9], ['mobility', 0.7], ['spectacle', 0.5]]),
  ),
  directTieBreaker(
    'q103-distance-rhythm',
    '你更容易在哪种距离找到节奏？',
    '像末影龙保持巨大飞行半径，或岩浆怪靠连续跳跃拉近距离一样，让距离不断变化。',
    weights([['mobility', 1], ['independence', 0.7], ['mischief', 0.4]]),
    '像烈焰人守中远程、凋灵持续贴近，或劫掠兽正面追赶一样，锁定自己的有效距离。',
    weights([['aggression', 0.9], ['order', 0.7], ['patience', 0.5]]),
  ),
  directTieBreaker(
    'q104-impact-style',
    '团队需要一次决定性的冲击时，你更像谁？',
    '像劫掠兽用冲撞和怒吼打乱阵线一样，承担最直接的突破。',
    weights([['aggression', 1], ['protection', 0.6], ['spectacle', 0.6]]),
    '像烈焰人远程压制、末影龙空中牵制、岩浆怪分散推进或凋灵爆炸开场一样，用特殊机制改变局势。',
    weights([['resource', 0.9], ['mobility', 0.7], ['mischief', 0.5]]),
  ),
  directTieBreaker(
    'q105-pressure-source',
    '你更相信哪种持续威慑？',
    '像末影龙反复掠过、凋灵追击，或劫掠兽逼近一样，让对方始终不能放松。',
    weights([['aggression', 0.9], ['spectacle', 0.8], ['resilience', 0.5]]),
    '像烈焰人蓄势齐射，或岩浆怪踩着固定跳跃节奏一样，让对方预感下一次爆发。',
    weights([['patience', 0.9], ['order', 0.8], ['aggression', 0.4]]),
  ),
  directTieBreaker(
    'q106-recovery-signal',
    '别人如何看出你还没有退出局面？',
    '像岩浆怪分裂、凋灵回血，或劫掠兽怒吼一样，用明显变化宣告还会继续。',
    weights([['resilience', 1], ['spectacle', 0.8], ['aggression', 0.5]]),
    '像烈焰人重新点燃火焰，或末影龙重新升空一样，回到熟悉节奏就是信号。',
    weights([['order', 0.8], ['mobility', 0.7], ['patience', 0.6]]),
  ),
  directTieBreaker(
    'q107-territory-choice',
    '新的冲突地点由你选择时，你偏向哪一类？',
    '像末影龙、岩浆怪或劫掠兽一样，选择能放大飞行、跳跃或冲锋的宽阔空间。',
    weights([['mobility', 0.9], ['spectacle', 0.8], ['aggression', 0.5]]),
    '像烈焰人依托要塞、凋灵由预设结构召唤一样，选择边界和入口明确的位置。',
    weights([['order', 1], ['patience', 0.7], ['resource', 0.5]]),
  ),
  directTieBreaker(
    'q108-wind-or-bite',
    '狭窄空间里出现目标时，你更接近哪种动作？',
    '像旋风人跳开并发射风弹一样，用击退和位移保持距离。',
    weights([['mobility', 1], ['mischief', 0.8], ['independence', 0.5]]),
    '像末影螨贴近目标啃咬一样，利用小体型直接靠近。',
    weights([['stealth', 0.9], ['aggression', 0.8], ['mobility', 0.4]]),
  ),
  directTieBreaker(
    'q109-arrival-method',
    '你更像通过哪种方式突然加入现场？',
    '像旋风人由试炼刷怪笼生成一样，在挑战开始后登场。',
    weights([['spectacle', 0.8], ['aggression', 0.7], ['order', 0.5]]),
    '像末影螨偶尔随末影珍珠出现一样，从一次传送意外里冒出来。',
    weights([['mischief', 1], ['stealth', 0.7], ['curiosity', 0.5]]),
  ),
  directTieBreaker(
    'q110-jump-or-scurry',
    '需要躲开攻击时，你会怎样移动？',
    '像旋风人高高跳到新位置一样，迅速拉开角度。',
    weights([['mobility', 1], ['caution', 0.6], ['mischief', 0.5]]),
    '像末影螨沿地面快速窜动一样，贴着缝隙寻找空当。',
    weights([['stealth', 1], ['mobility', 0.7], ['caution', 0.4]]),
  ),
  directTieBreaker(
    'q111-ranged-or-close',
    '你更愿意用哪种距离处理冲突？',
    '像旋风人发射风弹一样，隔着距离改变对方位置。',
    weights([['mobility', 0.9], ['resource', 0.8], ['mischief', 0.6]]),
    '像末影螨只能近身攻击一样，抓住一次贴近机会。',
    weights([['aggression', 1], ['stealth', 0.6], ['resilience', 0.4]]),
  ),
  directTieBreaker(
    'q112-keep-away',
    '对方不断靠近时，你更像哪一种反应？',
    '像旋风人继续跳跃并用风弹击退一样，主动维持安全距离。',
    weights([['caution', 0.9], ['mobility', 0.9], ['resource', 0.5]]),
    '像末影螨追着目标移动一样，不放弃近身路线。',
    weights([['aggression', 0.9], ['patience', 0.7], ['stealth', 0.5]]),
  ),
  directTieBreaker(
    'q113-stay-or-vanish',
    '如果现场暂时没人理会你，你更接近哪种状态？',
    '像旋风人留在试炼大厅继续等待目标一样，守住现场。',
    weights([['patience', 0.9], ['order', 0.8], ['resilience', 0.5]]),
    '像末影螨在没有持续交互时会自行消失一样，悄悄退出。',
    weights([['stealth', 1], ['independence', 0.8], ['caution', 0.4]]),
  ),
  directTieBreaker(
    'q114-enderman-reaction',
    '遇到末影人时，哪种关系更像你？',
    '像旋风人一样继续按自己的试炼节奏行动，不围绕末影人改变目标。',
    weights([['independence', 0.9], ['order', 0.7], ['patience', 0.5]]),
    '像末影螨会引来附近末影人攻击一样，一出现就触发特殊敌意。',
    weights([['mischief', 1], ['aggression', 0.7], ['spectacle', 0.5]]),
  ),
  directTieBreaker(
    'q115-mountain-or-charge',
    '面对高低差很大的地形，你更像哪一边？',
    '像山羊一次跳上很高的落点一样，先用跳跃越过地形。',
    weights([['mobility', 1], ['curiosity', 0.6], ['independence', 0.5]]),
    '像僵尸疣猪兽锁定附近生物冲过去一样，把路线变成正面追击。',
    weights([['aggression', 1], ['resilience', 0.7], ['spectacle', 0.4]]),
  ),
  directTieBreaker(
    'q116-ram-target',
    '你决定撞向一个目标前，会怎样行动？',
    '像山羊先低头蓄势再冲撞一样，给出短暂但清楚的预兆。',
    weights([['patience', 0.8], ['aggression', 0.7], ['order', 0.6]]),
    '像僵尸疣猪兽持续主动攻击多数生物一样，几乎不等待提醒。',
    weights([['aggression', 1], ['spectacle', 0.6], ['resilience', 0.5]]),
  ),
  directTieBreaker(
    'q117-useful-trace',
    '一次强硬行动之后，你更可能留下什么？',
    '像山羊撞击特定方块后留下羊角一样，留下可被使用的纪念。',
    weights([['resource', 0.9], ['spectacle', 0.7], ['curiosity', 0.5]]),
    '像僵尸疣猪兽只继续寻找下一个攻击目标一样，不停下来整理痕迹。',
    weights([['aggression', 1], ['mobility', 0.6], ['independence', 0.5]]),
  ),
  directTieBreaker(
    'q118-changed-world',
    '环境让你发生变化时，哪种故事更接近你？',
    '像山羊一直适应山地生活一样，保持原有习惯并利用地形。',
    weights([['resilience', 0.8], ['mobility', 0.8], ['patience', 0.5]]),
    '像疣猪兽进入主世界后变成僵尸疣猪兽一样，变化后行为也变得全面敌对。',
    weights([['aggression', 1], ['resilience', 0.7], ['spectacle', 0.5]]),
  ),
  directTieBreaker(
    'q119-arrow-effect',
    '如果你只能用一支特殊箭控制局面，会选哪一种？',
    '像焦骸射出虚弱之箭一样，让对方的攻击失去力量。',
    weights([['caution', 0.9], ['resource', 0.8], ['order', 0.5]]),
    '像流浪者射出缓慢之箭一样，先限制对方移动。',
    weights([['patience', 0.9], ['mobility', 0.7], ['resource', 0.6]]),
  ),
  directTieBreaker(
    'q120-dry-or-frozen',
    '你更能适应哪一种极端环境？',
    '像焦骸出现在炎热干燥地区一样，在高温环境保持远程压制。',
    weights([['resilience', 0.9], ['independence', 0.7], ['aggression', 0.4]]),
    '像流浪者出现在寒冷积雪地区一样，在冰雪中保持耐心。',
    weights([['patience', 1], ['caution', 0.7], ['resilience', 0.5]]),
  ),
  directTieBreaker(
    'q121-weaken-or-slow',
    '队友需要你先削弱一个危险目标，你会优先削弱什么？',
    '像焦骸的虚弱箭一样，先降低对方造成伤害的能力。',
    weights([['protection', 0.9], ['resource', 0.8], ['caution', 0.5]]),
    '像流浪者的缓慢箭一样，先让对方无法快速接近。',
    weights([['order', 0.9], ['patience', 0.7], ['mobility', 0.6]]),
  ),
  directTieBreaker(
    'q122-poison-or-pounce',
    '一次近身攻击中，你更依赖什么？',
    '像洞穴蜘蛛附带中毒效果一样，让一次接触持续产生影响。',
    weights([['mischief', 0.9], ['aggression', 0.8], ['stealth', 0.6]]),
    '像蜘蛛在黑暗中直接扑向目标一样，依靠标准的近身追击。',
    weights([['aggression', 0.9], ['mobility', 0.7], ['patience', 0.4]]),
  ),
  directTieBreaker(
    'q123-tight-passage',
    '前方通道很窄时，你怎样通过？',
    '像洞穴蜘蛛利用更小体型穿过矿井空间一样，贴着狭窄路线前进。',
    weights([['stealth', 1], ['mobility', 0.7], ['caution', 0.5]]),
    '像蜘蛛保持更大的体型寻找正常入口一样，换一条能完整通过的路线。',
    weights([['curiosity', 0.8], ['patience', 0.7], ['mobility', 0.5]]),
  ),
  directTieBreaker(
    'q124-spawn-place',
    '如果要在黑暗处等待机会，你会选哪里？',
    '像洞穴蜘蛛守在废弃矿井刷怪笼附近一样，依托狭窄据点。',
    weights([['stealth', 0.9], ['order', 0.8], ['patience', 0.6]]),
    '像蜘蛛能在许多黑暗区域自然出现一样，选择更广泛的活动范围。',
    weights([['independence', 0.9], ['mobility', 0.7], ['curiosity', 0.5]]),
  ),
  directTieBreaker(
    'q125-pack-bond',
    '同伴遇到威胁时，你为什么加入行动？',
    '像狼因驯服关系和主人并肩作战一样，因为明确的信任与忠诚。',
    weights([['loyalty', 1], ['protection', 0.9], ['social', 0.7]]),
    '像僵尸猪灵因同类受击而集体反击一样，因为群体被触发。',
    weights([['social', 0.9], ['aggression', 0.8], ['resilience', 0.5]]),
  ),
  directTieBreaker(
    'q126-calm-until-hit',
    '没有人主动挑衅时，你更像哪种状态？',
    '像狼可以被驯服、坐下并穿戴狼铠一样，把精力留给陪伴和守护。',
    weights([['loyalty', 1], ['patience', 0.7], ['protection', 0.7]]),
    '像僵尸猪灵保持中立、受击后召集附近同类一样，把反击条件记得很清楚。',
    weights([['caution', 0.9], ['social', 0.7], ['aggression', 0.6]]),
  ),
  directTieBreaker(
    'q127-mining-fatigue',
    '你要阻止别人接近核心区域，会怎样做？',
    '像远古守卫者施加挖掘疲劳并用激光守护海底神殿一样，从远处限制行动。',
    weights([['protection', 1], ['aquatic', 0.8], ['order', 0.7]]),
    '像猪灵蛮兵在堡垒遗迹挥斧追击、不会被金制装备安抚一样，直接守住入口。',
    weights([['aggression', 1], ['loyalty', 0.7], ['resilience', 0.5]]),
  ),
  directTieBreaker(
    'q128-guardian-warning',
    '陌生人闯入你的据点时，你更像哪一种警告？',
    '像远古守卫者隔着距离锁定目标并周期性施加疲劳一样，让入侵者越来越难推进。',
    weights([['patience', 0.9], ['protection', 0.9], ['aquatic', 0.6]]),
    '像猪灵蛮兵无视交易和金甲直接攻击一样，不接受协商。',
    weights([['aggression', 1], ['independence', 0.7], ['order', 0.5]]),
  ),
  directTieBreaker(
    'q129-hunger-or-weakness',
    '荒漠里的对手靠近时，你更倾向怎样削弱他？',
    '像尸壳近身攻击并施加饥饿一样，贴近后消耗对方。',
    weights([['aggression', 0.9], ['resilience', 0.7], ['patience', 0.5]]),
    '像焦骸保持远程并射出虚弱之箭一样，在接触前削弱攻击。',
    weights([['caution', 0.9], ['resource', 0.8], ['order', 0.6]]),
  ),
  directTieBreaker(
    'q130-milk-or-wool',
    '需要长期提供一种日常补给时，你更接近哪种循环？',
    '像牛可以反复用桶收集牛奶一样，准备好容器就稳定交付。',
    weights([['resource', 1], ['patience', 0.8], ['nurture', 0.5]]),
    '像绵羊剪毛后吃草重新长出羊毛一样，恢复之后再提供下一批材料。',
    weights([['resource', 0.9], ['resilience', 0.8], ['patience', 0.6]]),
  ),
  directTieBreaker(
    'q131-steady-or-colorful-supply',
    '同一种资源也能做出个人风格时，你更像哪一边？',
    '像牛持续提供牛奶一样，把可靠和一致放在第一位。',
    weights([['order', 0.9], ['resource', 0.8], ['patience', 0.6]]),
    '像绵羊的羊毛可以染成不同颜色一样，愿意让产出带上明显变化。',
    weights([['spectacle', 0.9], ['resource', 0.7], ['curiosity', 0.6]]),
  ),
  directTieBreaker(
    'q132-wheat-or-grass-reset',
    '完成一轮工作后，你怎样回到可继续投入的状态？',
    '像牛跟随小麦并保持稳定节奏一样，从明确补给中重新集中。',
    weights([['order', 0.8], ['social', 0.6], ['resource', 0.6]]),
    '像绵羊吃草后长回羊毛一样，用一段安静恢复换来新的产出。',
    weights([['nurture', 0.9], ['resilience', 0.8], ['patience', 0.7]]),
  ),
  directTieBreaker(
    'q133-owner-or-crowd-bond',
    '你加入一场冲突时，关系基础更接近哪一种？',
    '像狼因驯服关系跟随主人并协同攻击一样，为具体信任对象行动。',
    weights([['loyalty', 1], ['protection', 0.8], ['social', 0.5]]),
    '像僵尸猪灵在同类受击后共同反击一样，为被触发的群体边界行动。',
    weights([['social', 1], ['aggression', 0.8], ['resilience', 0.5]]),
  ),
  directTieBreaker(
    'q134-care-or-shared-anger',
    '紧张结束后，你更像怎样维持关系？',
    '像狼可以被喂食恢复并穿戴狼铠一样，接受照料后继续陪伴守护。',
    weights([['loyalty', 1], ['nurture', 0.8], ['protection', 0.7]]),
    '像僵尸猪灵会把受击后的敌意传给附近同类一样，让群体记住边界。',
    weights([['social', 0.9], ['caution', 0.8], ['aggression', 0.7]]),
  ),
  directTieBreaker(
    'q135-command-or-trigger',
    '同伴开始行动时，你更常因为什么一起跟上？',
    '像狼响应主人的目标一样，因为清楚知道自己在支持谁。',
    weights([['loyalty', 1], ['order', 0.7], ['protection', 0.6]]),
    '像僵尸猪灵因任何同类被攻击而聚集一样，因为共同条件已经触发。',
    weights([['social', 1], ['aggression', 0.7], ['spectacle', 0.5]]),
  ),
  directTieBreaker(
    'q136-volley-or-crystal-cycle',
    '需要长时间控制战场时，你更依靠什么循环？',
    '像烈焰人悬浮蓄势后连续发射火球一样，用固定齐射窗口压制。',
    weights([['order', 0.9], ['aggression', 0.8], ['patience', 0.6]]),
    '像末影龙绕场飞行并借末地水晶恢复一样，把移动和恢复连成循环。',
    weights([['mobility', 1], ['resilience', 0.8], ['spectacle', 0.6]]),
  ),
  directTieBreaker(
    'q137-summoned-or-returning-boss',
    '一场大行动以什么方式开始，更符合你的风格？',
    '像凋灵由特定结构召唤并在蓄力后爆发一样，由准备好的条件启动。',
    weights([['order', 0.9], ['spectacle', 0.9], ['aggression', 0.7]]),
    '像末影龙守在末地主岛并可通过末地水晶复活一样，回到自己的主场。',
    weights([['resilience', 1], ['mobility', 0.8], ['independence', 0.6]]),
  ),
  directTieBreaker(
    'q138-split-or-charge',
    '正面受阻后，你更可能怎样继续制造压力？',
    '像岩浆怪被击败后分裂成更小个体一样，把一个问题拆成多路继续。',
    weights([['resilience', 1], ['mobility', 0.7], ['mischief', 0.6]]),
    '像劫掠兽在袭击中冲撞并破坏作物一样，保持体量直接推开阻挡。',
    weights([['aggression', 1], ['spectacle', 0.8], ['resilience', 0.5]]),
  ),
  directTieBreaker(
    'q139-fireline-or-lava-leap',
    '在下界环境中推进时，你更接近哪种移动火力？',
    '像烈焰人悬浮守住射界并远程发射火球一样，维持距离和火力线。',
    weights([['aggression', 0.9], ['order', 0.8], ['patience', 0.6]]),
    '像岩浆怪在熔岩环境中不断跳跃逼近一样，用弹跳改变接触距离。',
    weights([['mobility', 1], ['resilience', 0.8], ['aggression', 0.5]]),
  ),
  directTieBreaker(
    'q140-skulls-or-perch',
    '优势出现后，你会怎样进入下一种强势状态？',
    '像凋灵持续发射凋灵之首，并在生命降低后获得远程防护一样，边攻击边改变防线。',
    weights([['aggression', 1], ['resilience', 0.9], ['resource', 0.5]]),
    '像末影龙降落在返回传送门附近并喷吐龙息一样，回到关键位置控制区域。',
    weights([['mobility', 0.9], ['spectacle', 0.8], ['order', 0.6]]),
  ),
  directTieBreaker(
    'q141-ink-or-jungle-distance',
    '突然被靠近时，你更像哪一种撤离方式？',
    '像鱿鱼在水中受击后喷墨游开一样，先制造遮挡再离开。',
    weights([['aquatic', 1], ['stealth', 0.8], ['mobility', 0.5]]),
    '像豹猫在丛林里避开突然靠近的玩家一样，提前拉开陆地距离。',
    weights([['caution', 1], ['independence', 0.8], ['stealth', 0.5]]),
  ),
  directTieBreaker(
    'q142-poison-or-vibration-hunt',
    '看不清目标所在时，你更依靠什么锁定对方？',
    '像沼骸从潮湿地带远程射出毒箭一样，守住视线和距离。',
    weights([['caution', 0.9], ['aggression', 0.8], ['aquatic', 0.5]]),
    '像监守者感知振动和气味并发出声波攻击一样，从环境变化追踪源头。',
    weights([['stealth', 0.9], ['curiosity', 0.8], ['aggression', 0.7]]),
  ),
  directTieBreaker(
    'q143-echo-or-treasure-guide',
    '你给同伴提供线索时，更像哪一种方式？',
    '像鹦鹉模仿附近生物声音并停在肩上一样，用声音提醒身边的人。',
    weights([['social', 0.9], ['mischief', 0.8], ['curiosity', 0.6]]),
    '像海豚给予游泳助力并带人寻找宝藏一样，直接领着同伴前往目标。',
    weights([['aquatic', 0.9], ['mobility', 0.9], ['social', 0.7]]),
  ),
]

export const questions: readonly Question[] = [
  ...questionBlueprints.slice(0, 92).map((question) => buildQuestion(question, 'core')),
  ...questionBlueprints.slice(92).map((question) => buildQuestion(question, 'facet')),
  ...adaptiveTieBreakerBlueprints.map((question) => buildQuestion(question, 'facet')),
]

if (questions.length !== 143) {
  throw new Error(`Expected 143 MCTI questions, received ${questions.length}`)
}

if (
  questions.filter((question) => question.tier === 'core').length !== 92 ||
  questions.filter((question) => question.tier === 'facet').length !== 51
) {
  throw new Error('MCTI question tiers must contain 92 core and 51 facet items.')
}

if (new Set(questions.map((question) => question.id)).size !== questions.length) {
  throw new Error('MCTI question IDs must be unique.')
}
