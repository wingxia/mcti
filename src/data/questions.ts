import type { Question, QuestionOption, TraitVector } from '../types'
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

const buildQuestion = (question: QuestionBlueprint): Question => ({
  id: question.id,
  prompt: question.prompt,
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

export const questions: readonly Question[] = questionBlueprints.map(buildQuestion)

if (questions.length !== 93) {
  throw new Error(`Expected 93 MCTI questions, received ${questions.length}`)
}
