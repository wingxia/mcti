import type { Question, QuestionOption, QuestionTier, TraitVector } from '../types'
import { mobProfiles } from './mobs'

type ChoiceBlueprint = {
  label: string
  weights: TraitVector
  targetMobCodes: readonly string[]
}

type QuestionBlueprint = {
  id: string
  prompt: string
  tier: QuestionTier
  options: readonly [ChoiceBlueprint, ChoiceBlueprint]
}

const weights = (entries: readonly (readonly [string, number])[]): TraitVector =>
  Object.fromEntries(entries)

const choice = (
  label: string,
  choiceWeights: TraitVector,
  targetMobCodes: readonly string[],
): ChoiceBlueprint => ({ label, weights: choiceWeights, targetMobCodes })

const scenarioQuestion = (
  id: string,
  prompt: string,
  tier: QuestionTier,
  first: ChoiceBlueprint,
  second: ChoiceBlueprint,
): QuestionBlueprint => ({ id, prompt, tier, options: [first, second] })

const directTieBreaker = (
  id: string,
  prompt: string,
  first: ChoiceBlueprint,
  second: ChoiceBlueprint,
): QuestionBlueprint => scenarioQuestion(id, prompt, 'facet', first, second)

const option = (id: 'a' | 'b', blueprint: ChoiceBlueprint): QuestionOption => ({
  id,
  label: blueprint.label,
  weights: blueprint.weights,
  targetMobCodes: blueprint.targetMobCodes,
})

const buildQuestion = (question: QuestionBlueprint): Question => ({
  id: question.id,
  prompt: question.prompt,
  tier: question.tier,
  options: [option('a', question.options[0]), option('b', question.options[1])],
})

const questionBlueprints: readonly QuestionBlueprint[] = [
  scenarioQuestion(
    'q01-lost-spark',
    '你捡到别人掉下的小物件，会先做什么？',
    'core',
    choice(
      '先收好，尽快送回失主手里。',
      weights([
        ['loyalty', 1],
        ['social', 0.8],
        ['nurture', 0.6],
        ['resource', 0.4],
      ]),
      ['Allay'],
    ),
    choice(
      '先查看周围线索，确认是谁落下的。',
      weights([
        ['curiosity', 1],
        ['caution', 0.6],
        ['order', 0.5],
        ['independence', 0.3],
      ]),
      ['Sniffer'],
    ),
  ),
  scenarioQuestion(
    'q02-cave-sound',
    '洞穴深处忽然传来细小声响，你会怎么处理？',
    'core',
    choice(
      '放轻脚步靠近，先看清里面有什么。',
      weights([
        ['curiosity', 1],
        ['stealth', 0.8],
        ['mobility', 0.5],
      ]),
      ['Cave Spider', 'Bat', 'Spider'],
    ),
    choice(
      '先停下动作，确认声音和退路是否安全。',
      weights([
        ['caution', 1],
        ['order', 0.8],
        ['patience', 0.6],
      ]),
      ['Warden'],
    ),
  ),
  scenarioQuestion(
    'q03-slow-friend',
    '同行的人走得很慢，队伍快错过时间了。',
    'core',
    choice(
      '接过一部分负担，陪对方一起跟上队伍。',
      weights([
        ['social', 1],
        ['nurture', 0.9],
        ['loyalty', 0.7],
        ['patience', 0.4],
      ]),
      ['Happy Ghast'],
    ),
    choice(
      '先去前面探路，再回来带大家走安全路线。',
      weights([
        ['mobility', 1],
        ['independence', 0.8],
        ['curiosity', 0.6],
        ['protection', 0.4],
      ]),
      ['Rabbit', 'Horse'],
    ),
  ),
  scenarioQuestion(
    'q04-small-base',
    '新基地只剩一小块地方，你先安排什么？',
    'core',
    choice(
      '先把床、箱子和工具分区归位。',
      weights([
        ['order', 1],
        ['resource', 0.8],
        ['patience', 0.5],
      ]),
      ['Copper Golem'],
    ),
    choice(
      '先保留一块空地，方便以后调整布局。',
      weights([
        ['mobility', 0.9],
        ['curiosity', 0.7],
        ['independence', 0.6],
      ]),
      ['Enderman'],
    ),
  ),
  scenarioQuestion(
    'q05-argument',
    '朋友为了走哪条路线争起来了，你会怎么做？',
    'core',
    choice(
      '先阻止冲突扩大，再推动大家确定方向。',
      weights([
        ['order', 0.8],
        ['aggression', 0.7],
        ['protection', 0.6],
        ['spectacle', 0.4],
      ]),
      ['Piglin Brute'],
    ),
    choice(
      '先听完双方依据，再一起比较路线。',
      weights([
        ['patience', 1],
        ['social', 0.7],
        ['caution', 0.6],
        ['curiosity', 0.4],
      ]),
      ['Dolphin'],
    ),
  ),
  scenarioQuestion(
    'q06-rainy-night',
    '雨夜必须外出，你更愿意怎样赶路？',
    'core',
    choice(
      '放慢节奏，顺着雨声稳稳往前走。',
      weights([
        ['aquatic', 1],
        ['patience', 0.7],
        ['stealth', 0.4],
      ]),
      ['Salmon', 'Squid'],
    ),
    choice(
      '借雨声掩护脚步，尽快把事情办完。',
      weights([
        ['mobility', 0.9],
        ['stealth', 0.8],
        ['resource', 0.4],
      ]),
      ['Fox'],
    ),
  ),
  scenarioQuestion(
    'q07-surprise-guest',
    '有人突然闯进你的节奏里，你会怎么回应？',
    'core',
    choice(
      '先保持距离，判断对方是否值得接近。',
      weights([
        ['caution', 1],
        ['stealth', 0.6],
        ['independence', 0.5],
      ]),
      ['Ocelot'],
    ),
    choice(
      '直接打招呼，看看彼此能否合作。',
      weights([
        ['social', 1],
        ['trade', 0.6],
        ['curiosity', 0.5],
      ]),
      ['Wandering Trader'],
    ),
  ),
  scenarioQuestion(
    'q08-valuable-map',
    '你拿到一张可能通向宝藏的地图，会先做什么？',
    'core',
    choice(
      '先妥善保存并备份重要线索。',
      weights([
        ['resource', 1],
        ['caution', 0.7],
        ['patience', 0.5],
      ]),
      ['Donkey', 'Mule'],
    ),
    choice(
      '立即沿着线索出发，边走边确认方向。',
      weights([
        ['curiosity', 1],
        ['mobility', 0.8],
        ['independence', 0.4],
      ]),
      ['Dolphin', 'Horse'],
    ),
  ),
  scenarioQuestion(
    'q09-thin-bridge',
    '面前是一座很窄的高桥，你会怎样通过？',
    'core',
    choice(
      '一步一步确认落脚点，慢一点也没关系。',
      weights([
        ['caution', 1],
        ['patience', 0.9],
        ['resilience', 0.6],
      ]),
      ['Turtle'],
    ),
    choice(
      '看准路线快速通过，减少停留时间。',
      weights([
        ['mobility', 1],
        ['spectacle', 0.5],
        ['aggression', 0.4],
      ]),
      ['Breeze', 'Goat'],
    ),
  ),
  scenarioQuestion(
    'q10-group-treasure',
    '队伍找到一箱战利品，你先关心什么？',
    'core',
    choice(
      '先说清分配规则，确保每个人都能接受。',
      weights([
        ['order', 1],
        ['social', 0.7],
        ['trade', 0.6],
      ]),
      ['Villager'],
    ),
    choice(
      '先判断哪些物资最稀有、最值得保留。',
      weights([
        ['resource', 1],
        ['curiosity', 0.5],
        ['patience', 0.4],
      ]),
      ['Piglin'],
    ),
  ),
  scenarioQuestion(
    'q11-noisy-crowd',
    '周围人多又嘈杂时，你会待在哪里？',
    'core',
    choice(
      '找个安静角落，等噪音慢慢过去。',
      weights([
        ['stealth', 1],
        ['independence', 0.8],
        ['patience', 0.5],
      ]),
      ['Bat'],
    ),
    choice(
      '站到视野开阔的位置，掌握周围变化。',
      weights([
        ['order', 0.9],
        ['social', 0.7],
        ['protection', 0.6],
      ]),
      ['Snow Golem'],
    ),
  ),
  scenarioQuestion(
    'q12-tiny-garden',
    '你负责照看一小片刚种下的植物。',
    'core',
    choice(
      '按固定节奏照料，耐心等待生长。',
      weights([
        ['nurture', 1],
        ['patience', 0.9],
        ['order', 0.4],
      ]),
      ['Sheep'],
    ),
    choice(
      '尝试不同种法，观察哪一种效果更好。',
      weights([
        ['curiosity', 1],
        ['resource', 0.6],
        ['mischief', 0.4],
      ]),
      ['Sniffer'],
    ),
  ),
  scenarioQuestion(
    'q13-wrong-turn',
    '发现自己走错路后，你通常会怎么做？',
    'core',
    choice(
      '立即原路返回，不让偏差继续扩大。',
      weights([
        ['caution', 0.9],
        ['order', 0.7],
        ['patience', 0.4],
      ]),
      ['Villager'],
    ),
    choice(
      '先看看这条路有什么，再决定是否回头。',
      weights([
        ['curiosity', 1],
        ['independence', 0.7],
        ['mobility', 0.5],
      ]),
      ['Enderman'],
    ),
  ),
  scenarioQuestion(
    'q14-hidden-door',
    '墙上有一扇半掩的小门，你会怎么接近？',
    'core',
    choice(
      '先找隐蔽位置观察里面的动静。',
      weights([
        ['stealth', 1],
        ['curiosity', 0.8],
        ['caution', 0.4],
      ]),
      ['Silverfish'],
    ),
    choice(
      '先敲门说明来意，再决定是否进入。',
      weights([
        ['social', 0.8],
        ['order', 0.6],
        ['nurture', 0.5],
      ]),
      ['Villager'],
    ),
  ),
  scenarioQuestion(
    'q15-sudden-danger',
    '危险突然贴近，只来得及做一个动作。',
    'core',
    choice(
      '先挡住威胁，为身边的人争取时间。',
      weights([
        ['protection', 1],
        ['loyalty', 0.8],
        ['resilience', 0.6],
      ]),
      ['Axolotl'],
    ),
    choice(
      '迅速拉开距离，再寻找反制机会。',
      weights([
        ['mobility', 1],
        ['caution', 0.6],
        ['aggression', 0.5],
      ]),
      ['Rabbit', 'Cat'],
    ),
  ),
  scenarioQuestion(
    'q16-stage-light',
    '必须让所有人注意一件事时，你会怎么做？',
    'core',
    choice(
      '发出强烈明确的信号，让人无法忽略。',
      weights([
        ['spectacle', 1],
        ['aggression', 0.5],
        ['social', 0.4],
      ]),
      ['Creeper', 'Ghast'],
    ),
    choice(
      '把线索整理清楚，引导大家自然发现。',
      weights([
        ['order', 0.9],
        ['patience', 0.7],
        ['curiosity', 0.5],
      ]),
      ['Shulker'],
    ),
  ),
  scenarioQuestion(
    'q17-snack-choice',
    '背包只能带一种路上补给，你会选哪类？',
    'core',
    choice(
      '选择稳定耐用、能持续提供帮助的补给。',
      weights([
        ['resource', 1],
        ['caution', 0.6],
        ['resilience', 0.4],
      ]),
      ['Sheep', 'Chicken', 'Cow', 'Cow'],
    ),
    choice(
      '选择大家都喜欢、方便一起分享的补给。',
      weights([
        ['social', 0.9],
        ['nurture', 0.7],
        ['trade', 0.4],
      ]),
      ['Pig'],
    ),
  ),
  scenarioQuestion(
    'q18-quiet-lake',
    '面前是一片很安静的湖，你想做什么？',
    'core',
    choice(
      '在岸边多待一会儿，感受缓慢的水声。',
      weights([
        ['aquatic', 1],
        ['patience', 0.7],
        ['caution', 0.3],
      ]),
      ['Cod', 'Salmon'],
    ),
    choice(
      '沿着湖岸探索，寻找被忽略的线索。',
      weights([
        ['curiosity', 0.9],
        ['mobility', 0.7],
        ['resource', 0.4],
      ]),
      ['Dolphin'],
    ),
  ),
  scenarioQuestion(
    'q19-rules-or-improv',
    '小游戏开始了，但规则还没有说完。',
    'core',
    choice(
      '先听完全部规则，确保过程公平。',
      weights([
        ['order', 1],
        ['patience', 0.7],
        ['social', 0.4],
      ]),
      ['Villager'],
    ),
    choice(
      '先动手试一轮，在过程中理解规则。',
      weights([
        ['mischief', 1],
        ['curiosity', 0.8],
        ['mobility', 0.5],
      ]),
      ['Sulfur Cube'],
    ),
  ),
  scenarioQuestion(
    'q20-alone-task',
    '有件小事交给你独自处理，你会怎么开始？',
    'core',
    choice(
      '按自己的节奏安静完成，不打扰别人。',
      weights([
        ['independence', 1],
        ['stealth', 0.7],
        ['patience', 0.4],
      ]),
      ['Enderman', 'Cat'],
    ),
    choice(
      '先问清大家的期待，再决定行动方式。',
      weights([
        ['social', 0.8],
        ['order', 0.7],
        ['loyalty', 0.5],
      ]),
      ['Wolf'],
    ),
  ),
  scenarioQuestion(
    'q21-broken-tool',
    '最顺手的工具突然坏了，你会怎么处理？',
    'core',
    choice(
      '先修好熟悉可靠的工具，再继续工作。',
      weights([
        ['loyalty', 0.8],
        ['patience', 0.8],
        ['resource', 0.7],
      ]),
      ['Iron Golem'],
    ),
    choice(
      '立即换一套工具和方法，保持进度。',
      weights([
        ['curiosity', 0.9],
        ['mobility', 0.7],
        ['independence', 0.5],
      ]),
      ['Witch', 'Horse'],
    ),
  ),
  scenarioQuestion(
    'q22-strange-market',
    '你走进一个从没见过的小集市。',
    'core',
    choice(
      '先研究交换规则和各种货物的价值。',
      weights([
        ['trade', 1],
        ['resource', 0.8],
        ['social', 0.5],
      ]),
      ['Villager', 'Piglin'],
    ),
    choice(
      '先观察出口、人群和整体动线。',
      weights([
        ['caution', 0.9],
        ['order', 0.8],
        ['stealth', 0.4],
      ]),
      ['Ocelot'],
    ),
  ),
  scenarioQuestion(
    'q23-messy-room',
    '储物间乱成一团，你会从哪里开始？',
    'core',
    choice(
      '先按用途分类，把物品逐一归位。',
      weights([
        ['order', 1],
        ['patience', 0.7],
        ['resource', 0.5],
      ]),
      ['Armor Stand'],
    ),
    choice(
      '先找到最重要的东西，其他稍后处理。',
      weights([
        ['resource', 0.8],
        ['curiosity', 0.6],
        ['mobility', 0.5],
      ]),
      ['Fox'],
    ),
  ),
  scenarioQuestion(
    'q24-morning-plan',
    '新的一天开始，你更喜欢哪种节奏？',
    'core',
    choice(
      '先列出几个小计划，再按顺序行动。',
      weights([
        ['order', 1],
        ['patience', 0.5],
        ['caution', 0.4],
      ]),
      ['Villager'],
    ),
    choice(
      '先出去看看，让计划在路上逐渐形成。',
      weights([
        ['curiosity', 1],
        ['mobility', 0.8],
        ['mischief', 0.3],
      ]),
      ['Bat'],
    ),
  ),
  scenarioQuestion(
    'q25-guard-duty',
    '今晚轮到你守夜，你会选择哪种方式？',
    'core',
    choice(
      '保持距离来回巡视，尽早发现异常。',
      weights([
        ['protection', 0.9],
        ['caution', 0.8],
        ['stealth', 0.6],
      ]),
      ['Bogged'],
    ),
    choice(
      '守在视野好的位置，等待关键动静。',
      weights([
        ['patience', 0.9],
        ['order', 0.6],
        ['spectacle', 0.4],
      ]),
      ['Shulker'],
    ),
  ),
  scenarioQuestion(
    'q26-prank-energy',
    '队伍有点没精神，你会怎样改善气氛？',
    'core',
    choice(
      '安排一个无害的小惊喜，让大家放松。',
      weights([
        ['mischief', 1],
        ['social', 0.7],
        ['spectacle', 0.5],
      ]),
      ['Parrot'],
    ),
    choice(
      '递上食物和水，慢慢帮大家恢复状态。',
      weights([
        ['nurture', 1],
        ['social', 0.6],
        ['resource', 0.5],
      ]),
      ['Bee'],
    ),
  ),
  scenarioQuestion(
    'q27-deep-water',
    '任务路线要经过一段深水，你会怎么准备？',
    'core',
    choice(
      '调整装备和动作，主动适应水下路线。',
      weights([
        ['aquatic', 1],
        ['patience', 0.6],
        ['resilience', 0.4],
      ]),
      ['Zombie Nautilus', 'Drowned'],
    ),
    choice(
      '规划最短路径，尽快通过这片水域。',
      weights([
        ['mobility', 0.9],
        ['caution', 0.6],
        ['resource', 0.3],
      ]),
      ['Rabbit'],
    ),
  ),
  scenarioQuestion(
    'q28-big-decision',
    '一个决定会影响很多人，你先考虑什么？',
    'core',
    choice(
      '先保护整个群体，避免任何人被落下。',
      weights([
        ['protection', 1],
        ['caution', 0.8],
        ['social', 0.5],
      ]),
      ['Zombified Piglin'],
    ),
    choice(
      '抓住眼前窗口，直接推动事情前进。',
      weights([
        ['aggression', 0.8],
        ['mobility', 0.7],
        ['spectacle', 0.5],
      ]),
      ['Zoglin'],
    ),
  ),
  scenarioQuestion(
    'q29-secret-note',
    '你收到一张没有署名的小纸条。',
    'core',
    choice(
      '研究字迹、内容和出现时机。',
      weights([
        ['curiosity', 1],
        ['caution', 0.6],
        ['order', 0.4],
      ]),
      ['Sniffer'],
    ),
    choice(
      '先把纸条收好，避免它干扰其他人。',
      weights([
        ['stealth', 0.9],
        ['protection', 0.7],
        ['patience', 0.4],
      ]),
      ['Shulker'],
    ),
  ),
  scenarioQuestion(
    'q30-heavy-load',
    '队伍要搬一批很重的材料，你会怎么安排？',
    'core',
    choice(
      '拆成几批分担重量，稳稳运到目的地。',
      weights([
        ['resilience', 1],
        ['patience', 0.8],
        ['order', 0.5],
      ]),
      ['Trader Llama', 'Llama'],
    ),
    choice(
      '先找捷径和工具，尽量减少搬运量。',
      weights([
        ['resource', 0.9],
        ['curiosity', 0.7],
        ['mobility', 0.5],
      ]),
      ['Fox'],
    ),
  ),
  scenarioQuestion(
    'q31-spotlight-mistake',
    '你在大家面前出了一个小错。',
    'core',
    choice(
      '坦然承认并轻松接住现场气氛。',
      weights([
        ['spectacle', 0.8],
        ['resilience', 0.7],
        ['social', 0.5],
      ]),
      ['Tropical Fish'],
    ),
    choice(
      '先退到一边，安静把问题修正好。',
      weights([
        ['caution', 0.8],
        ['stealth', 0.7],
        ['patience', 0.5],
      ]),
      ['Squid'],
    ),
  ),
  scenarioQuestion(
    'q32-old-path',
    '熟悉的小路被堵住了，你会怎么选？',
    'core',
    choice(
      '换一条路线，顺便看看新的地方。',
      weights([
        ['curiosity', 1],
        ['mobility', 0.8],
        ['independence', 0.4],
      ]),
      ['Dolphin'],
    ),
    choice(
      '清理原来的道路，恢复可靠路线。',
      weights([
        ['resilience', 0.8],
        ['loyalty', 0.7],
        ['order', 0.6],
      ]),
      ['Iron Golem'],
    ),
  ),
  scenarioQuestion(
    'q33-new-neighbor',
    '附近搬来一位有点神秘的新邻居。',
    'core',
    choice(
      '先礼貌观察，慢慢建立熟悉感。',
      weights([
        ['caution', 0.8],
        ['patience', 0.7],
        ['order', 0.4],
      ]),
      ['Ocelot'],
    ),
    choice(
      '带点小礼物过去，主动聊聊近况。',
      weights([
        ['social', 1],
        ['trade', 0.6],
        ['nurture', 0.5],
      ]),
      ['Villager'],
    ),
  ),
  scenarioQuestion(
    'q34-fast-shadow',
    '眼角闪过一个很快的影子，你会怎么做？',
    'core',
    choice(
      '追上去查清楚，不让线索消失。',
      weights([
        ['mobility', 1],
        ['curiosity', 0.8],
        ['aggression', 0.3],
      ]),
      ['Endermite', 'Vex'],
    ),
    choice(
      '先保持不动，判断它是不是诱饵。',
      weights([
        ['caution', 1],
        ['stealth', 0.7],
        ['patience', 0.5],
      ]),
      ['Warden'],
    ),
  ),
  scenarioQuestion(
    'q35-shared-home',
    '你和朋友一起布置公共空间。',
    'core',
    choice(
      '照顾每个人的需要，让位置都舒服实用。',
      weights([
        ['social', 1],
        ['nurture', 0.8],
        ['order', 0.4],
      ]),
      [],
    ),
    choice(
      '做出少见又鲜明的设计，让人记得住。',
      weights([
        ['spectacle', 0.9],
        ['curiosity', 0.5],
        ['resource', 0.4],
      ]),
      ['Mooshroom'],
    ),
  ),
  scenarioQuestion(
    'q36-risky-shortcut',
    '有条近路很快，但看起来不太稳。',
    'core',
    choice(
      '谨慎试一小段，随时准备调整。',
      weights([
        ['mobility', 1],
        ['caution', 0.5],
        ['mischief', 0.4],
      ]),
      ['Goat'],
    ),
    choice(
      '宁可绕远一点，也不冒这个风险。',
      weights([
        ['patience', 0.9],
        ['caution', 0.8],
        ['order', 0.5],
      ]),
      ['Hoglin'],
    ),
  ),
  scenarioQuestion(
    'q37-little-one',
    '有个年纪很小的同行者一直跟着你。',
    'core',
    choice(
      '放慢脚步照看对方，优先保证安全。',
      weights([
        ['nurture', 1],
        ['loyalty', 0.7],
        ['social', 0.5],
      ]),
      ['Turtle', 'Bee'],
    ),
    choice(
      '留出安全距离，让对方自己认识周围。',
      weights([
        ['curiosity', 0.7],
        ['caution', 0.7],
        ['protection', 0.5],
      ]),
      ['Polar Bear'],
    ),
  ),
  scenarioQuestion(
    'q38-missing-key',
    '一把重要钥匙不见了，你会怎么找？',
    'core',
    choice(
      '按最后使用的顺序逐步回忆和检查。',
      weights([
        ['order', 0.9],
        ['patience', 0.8],
        ['caution', 0.4],
      ]),
      ['Villager'],
    ),
    choice(
      '请大家一起找，边行动边交换线索。',
      weights([
        ['social', 0.9],
        ['trade', 0.6],
        ['curiosity', 0.5],
      ]),
      ['Dolphin'],
    ),
  ),
  scenarioQuestion(
    'q39-glowing-room',
    '你发现一个会发光的小房间。',
    'core',
    choice(
      '先研究光源和线路是如何工作的。',
      weights([
        ['curiosity', 1],
        ['resource', 0.5],
        ['order', 0.4],
      ]),
      ['Magma Cube', 'Frog'],
    ),
    choice(
      '先封住入口，确认安全后再研究。',
      weights([
        ['protection', 0.9],
        ['caution', 0.8],
        ['social', 0.4],
      ]),
      ['Elder Guardian', 'Guardian'],
    ),
  ),
  scenarioQuestion(
    'q40-loud-thunder',
    '雷声突然很响，大家都被吓了一下。',
    'core',
    choice(
      '先稳住情绪，也帮助身边的人冷静。',
      weights([
        ['resilience', 1],
        ['protection', 0.7],
        ['patience', 0.5],
      ]),
      ['Skeleton Horse'],
    ),
    choice(
      '立即寻找坚固的遮蔽处。',
      weights([
        ['caution', 1],
        ['mobility', 0.6],
        ['order', 0.4],
      ]),
      ['Armadillo', 'Horse'],
    ),
  ),
  scenarioQuestion(
    'q41-festival-booth',
    '节日摊位需要一个主意，你会选哪种？',
    'core',
    choice(
      '设计醒目的表演，吸引大家停下来。',
      weights([
        ['spectacle', 1],
        ['social', 0.7],
        ['mischief', 0.4],
      ]),
      ['Tropical Fish', 'Parrot'],
    ),
    choice(
      '设计交换小礼物的规则，让大家参与。',
      weights([
        ['trade', 1],
        ['order', 0.6],
        ['nurture', 0.5],
      ]),
      ['Villager'],
    ),
  ),
  scenarioQuestion(
    'q42-empty-pocket',
    '出门后发现背包里少带了东西。',
    'core',
    choice(
      '就地寻找替代品，不让行程停住。',
      weights([
        ['resource', 1],
        ['mobility', 0.6],
        ['resilience', 0.4],
      ]),
      ['Fox'],
    ),
    choice(
      '返回基地补齐物资，再安心出发。',
      weights([
        ['caution', 0.9],
        ['order', 0.7],
        ['patience', 0.4],
      ]),
      ['Donkey'],
    ),
  ),
  scenarioQuestion(
    'q43-quiet-compliment',
    '有人悄悄夸你做得很好。',
    'core',
    choice(
      '开心收下肯定，然后继续把事情做好。',
      weights([
        ['patience', 0.8],
        ['loyalty', 0.6],
        ['order', 0.4],
      ]),
      ['Wolf'],
    ),
    choice(
      '感谢对方，也把功劳分给帮忙的人。',
      weights([
        ['social', 0.9],
        ['nurture', 0.6],
        ['trade', 0.4],
      ]),
      ['Bee'],
    ),
  ),
  scenarioQuestion(
    'q44-unfair-moment',
    '你看到有人被不公平地对待。',
    'core',
    choice(
      '直接站出来，明确制止正在发生的事。',
      weights([
        ['protection', 1],
        ['aggression', 0.7],
        ['order', 0.5],
      ]),
      ['Vindicator'],
    ),
    choice(
      '先把受委屈的人带到安全的地方。',
      weights([
        ['nurture', 0.9],
        ['caution', 0.7],
        ['loyalty', 0.5],
      ]),
      ['Cat'],
    ),
  ),
  scenarioQuestion(
    'q45-moving-target',
    '前路被复杂障碍堵住，你会怎样突破？',
    'core',
    choice(
      '不断换角度移动，逐步制造通过空间。',
      weights([
        ['mobility', 1],
        ['spectacle', 0.7],
        ['aggression', 0.5],
      ]),
      ['Breeze'],
    ),
    choice(
      '贴着狭窄缝隙前进，快速找到入口。',
      weights([
        ['stealth', 0.9],
        ['mischief', 0.7],
        ['mobility', 0.5],
      ]),
      ['Endermite'],
    ),
  ),
  scenarioQuestion(
    'q46-soft-boundary',
    '有人反复越过你的边界。',
    'core',
    choice(
      '清楚明确地说不，让对方停止。',
      weights([
        ['aggression', 0.8],
        ['order', 0.7],
        ['protection', 0.6],
      ]),
      ['Pufferfish'],
    ),
    choice(
      '先拉开距离，减少不必要的接触。',
      weights([
        ['independence', 0.9],
        ['stealth', 0.7],
        ['caution', 0.5],
      ]),
      ['Ocelot'],
    ),
  ),
  scenarioQuestion(
    'q47-rare-find',
    '你找到一种很少见的材料。',
    'core',
    choice(
      '先妥善保存，留到关键时候使用。',
      weights([
        ['resource', 1],
        ['patience', 0.7],
        ['caution', 0.5],
      ]),
      ['Piglin'],
    ),
    choice(
      '立即做小规模测试，了解它的效果。',
      weights([
        ['curiosity', 1],
        ['spectacle', 0.5],
        ['mischief', 0.4],
      ]),
      ['Sulfur Cube'],
    ),
  ),
  scenarioQuestion(
    'q48-night-walk',
    '夜里必须穿过一片空地，你会怎么走？',
    'core',
    choice(
      '贴着阴影安静前进，不惊动周围。',
      weights([
        ['stealth', 1],
        ['caution', 0.8],
        ['independence', 0.4],
      ]),
      ['Creeper'],
    ),
    choice(
      '举起光源，让自己和路线都清晰可见。',
      weights([
        ['spectacle', 0.8],
        ['protection', 0.6],
        ['order', 0.5],
      ]),
      ['Blaze', 'Ghast'],
    ),
  ),
  scenarioQuestion(
    'q49-team-signal',
    '队伍需要一个集合信号，你会怎样设计？',
    'core',
    choice(
      '保持简单固定，让所有人一听就懂。',
      weights([
        ['order', 1],
        ['social', 0.6],
        ['loyalty', 0.4],
      ]),
      ['Villager'],
    ),
    choice(
      '做得特别一点，让大家很容易记住。',
      weights([
        ['spectacle', 0.9],
        ['mischief', 0.6],
        ['curiosity', 0.3],
      ]),
      ['Parrot'],
    ),
  ),
  scenarioQuestion(
    'q50-long-wait',
    '等待时间比预想中久很多，你会怎么过？',
    'core',
    choice(
      '保留精力，等准备完成后再行动。',
      weights([
        ['patience', 1],
        ['resilience', 0.8],
        ['spectacle', 0.5],
      ]),
      ['Wither'],
    ),
    choice(
      '找点小事保持活动，不让自己停下来。',
      weights([
        ['mobility', 0.9],
        ['curiosity', 0.7],
        ['mischief', 0.4],
      ]),
      ['Magma Cube', 'Slime'],
    ),
  ),
  scenarioQuestion(
    'q51-broken-bridge-help',
    '有人过不了断桥，正在发愁。',
    'core',
    choice(
      '先搭一条稳固的临时通道。',
      weights([
        ['protection', 0.9],
        ['order', 0.8],
        ['resource', 0.5],
      ]),
      ['Iron Golem'],
    ),
    choice(
      '带对方寻找另一条安全路线。',
      weights([
        ['curiosity', 0.8],
        ['independence', 0.6],
        ['nurture', 0.5],
      ]),
      ['Dolphin'],
    ),
  ),
  scenarioQuestion(
    'q52-small-conflict',
    '一个小误会快要变成大冲突。',
    'core',
    choice(
      '立即把话说清楚，避免继续误解。',
      weights([
        ['social', 0.8],
        ['order', 0.7],
        ['aggression', 0.4],
      ]),
      ['Villager'],
    ),
    choice(
      '先让气氛降温，等平静后再谈。',
      weights([
        ['patience', 0.9],
        ['nurture', 0.7],
        ['caution', 0.5],
      ]),
      ['Panda'],
    ),
  ),
  scenarioQuestion(
    'q53-shiny-trap',
    '一个东西闪闪发光，但位置很可疑。',
    'core',
    choice(
      '先观察周围，确认有没有机关。',
      weights([
        ['caution', 1],
        ['stealth', 0.6],
        ['order', 0.4],
      ]),
      ['Ocelot'],
    ),
    choice(
      '隔着安全距离做一次小测试。',
      weights([
        ['curiosity', 0.9],
        ['mischief', 0.7],
        ['resource', 0.4],
      ]),
      ['Evoker', 'Vex'],
    ),
  ),
  scenarioQuestion(
    'q54-home-defense',
    '基地门口出现了陌生脚印。',
    'core',
    choice(
      '先加固入口，提高整体警觉。',
      weights([
        ['protection', 1],
        ['caution', 0.8],
        ['order', 0.5],
      ]),
      ['Iron Golem'],
    ),
    choice(
      '顺着脚印追查它们从哪里来。',
      weights([
        ['curiosity', 0.9],
        ['stealth', 0.6],
        ['mobility', 0.5],
      ]),
      ['Zombie'],
    ),
  ),
  scenarioQuestion(
    'q55-invisible-work',
    '有些工作没人看见，但仍然很重要。',
    'core',
    choice(
      '安静做好，是否被看见并不重要。',
      weights([
        ['patience', 1],
        ['loyalty', 0.7],
        ['stealth', 0.5],
      ]),
      ['Cat'],
    ),
    choice(
      '留下清楚记录，方便后来的人接手。',
      weights([
        ['order', 0.9],
        ['social', 0.5],
        ['resource', 0.4],
      ]),
      ['Villager'],
    ),
  ),
  scenarioQuestion(
    'q56-quick-rescue',
    '有人差一点掉进坑里，你先做什么？',
    'core',
    choice(
      '立即伸手拉住对方，先脱离危险。',
      weights([
        ['protection', 1],
        ['mobility', 0.7],
        ['loyalty', 0.5],
      ]),
      ['Horse', 'Wolf'],
    ),
    choice(
      '先喊停周围动作，避免情况继续恶化。',
      weights([
        ['order', 0.9],
        ['caution', 0.8],
        ['social', 0.4],
      ]),
      ['Villager'],
    ),
  ),
  scenarioQuestion(
    'q57-new-rule',
    '大家要制定一条新规则。',
    'core',
    choice(
      '写得清楚具体，执行时不能含糊。',
      weights([
        ['order', 1],
        ['protection', 0.5],
        ['patience', 0.4],
      ]),
      ['Villager'],
    ),
    choice(
      '保留调整空间，方便适应不同情况。',
      weights([
        ['curiosity', 0.6],
        ['social', 0.6],
        ['mischief', 0.4],
      ]),
      ['Fox'],
    ),
  ),
  scenarioQuestion(
    'q58-far-light',
    '远处有一点灯光，正在吸引你的注意。',
    'core',
    choice(
      '靠近看看，弄清光从哪里来。',
      weights([
        ['curiosity', 1],
        ['mobility', 0.7],
        ['spectacle', 0.3],
      ]),
      ['Glow Squid'],
    ),
    choice(
      '先绕一圈观察，再决定是否接近。',
      weights([
        ['caution', 0.9],
        ['stealth', 0.7],
        ['patience', 0.4],
      ]),
      ['Warden'],
    ),
  ),
  scenarioQuestion(
    'q59-trade-offer',
    '有人提出一个看起来不错的交换。',
    'core',
    choice(
      '认真计算双方付出和所得是否合适。',
      weights([
        ['trade', 1],
        ['resource', 0.8],
        ['order', 0.4],
      ]),
      ['Villager', 'Piglin'],
    ),
    choice(
      '先判断对方是否可靠，再谈具体条件。',
      weights([
        ['caution', 0.9],
        ['social', 0.5],
        ['patience', 0.4],
      ]),
      ['Ocelot'],
    ),
  ),
  scenarioQuestion(
    'q60-colorful-choice',
    '你要给小屋选择一种装饰风格。',
    'core',
    choice(
      '使用丰富颜色，让人进门就感到开心。',
      weights([
        ['spectacle', 0.9],
        ['social', 0.5],
        ['mischief', 0.4],
      ]),
      ['Tropical Fish'],
    ),
    choice(
      '保持柔和安静，让人待久也不疲惫。',
      weights([
        ['patience', 0.8],
        ['nurture', 0.6],
        ['order', 0.4],
      ]),
      ['Panda'],
    ),
  ),
  scenarioQuestion(
    'q61-escape-route',
    '进入一个陌生遗迹时，你会先记住出口吗？',
    'core',
    choice(
      '会，知道离开路线后才能放心探索。',
      weights([
        ['caution', 1],
        ['order', 0.6],
        ['stealth', 0.4],
      ]),
      ['Armadillo'],
    ),
    choice(
      '不一定，我更想先看看里面有什么。',
      weights([
        ['curiosity', 1],
        ['independence', 0.5],
        ['mobility', 0.4],
      ]),
      ['Allay'],
    ),
  ),
  scenarioQuestion(
    'q62-tiny-mission',
    '有人拜托你送一件小东西。',
    'core',
    choice(
      '按约定直接送到，确保任务完成。',
      weights([
        ['loyalty', 1],
        ['social', 0.6],
        ['order', 0.5],
      ]),
      ['Allay'],
    ),
    choice(
      '在路上顺便寻找更好走的路线。',
      weights([
        ['mobility', 0.8],
        ['curiosity', 0.7],
        ['resource', 0.4],
      ]),
      ['Dolphin'],
    ),
  ),
  scenarioQuestion(
    'q63-bumpy-road',
    '路很颠，事情也不太顺。',
    'core',
    choice(
      '保持方向，一段一段继续往前。',
      weights([
        ['resilience', 1],
        ['patience', 0.8],
        ['loyalty', 0.4],
      ]),
      ['Camel Husk', 'Camel'],
    ),
    choice(
      '换个姿势或落脚点，让前进更顺畅。',
      weights([
        ['mobility', 0.9],
        ['curiosity', 0.5],
        ['caution', 0.4],
      ]),
      ['Goat'],
    ),
  ),
  scenarioQuestion(
    'q64-watch-or-act',
    '一件事刚露出不好的苗头。',
    'core',
    choice(
      '先观察变化，不急着立刻插手。',
      weights([
        ['patience', 1],
        ['caution', 0.6],
        ['stealth', 0.4],
      ]),
      ['Shulker'],
    ),
    choice(
      '趁问题还小，尽早开始处理。',
      weights([
        ['aggression', 0.8],
        ['order', 0.7],
        ['protection', 0.5],
      ]),
      ['Iron Golem'],
    ),
  ),
  scenarioQuestion(
    'q65-friendly-noise',
    '朋友突然来找你玩，声音还很大。',
    'core',
    choice(
      '先放下手头的事，陪大家热闹一会儿。',
      weights([
        ['social', 1],
        ['mischief', 0.6],
        ['spectacle', 0.4],
      ]),
      ['Parrot'],
    ),
    choice(
      '先把手上的事情收尾，再加入大家。',
      weights([
        ['order', 0.8],
        ['patience', 0.7],
        ['independence', 0.4],
      ]),
      ['Villager'],
    ),
  ),
  scenarioQuestion(
    'q66-soft-hiding',
    '你想独自安静一会儿，会怎么安排？',
    'core',
    choice(
      '找个没人注意的小角落恢复精力。',
      weights([
        ['stealth', 1],
        ['independence', 0.8],
        ['patience', 0.4],
      ]),
      ['Bat'],
    ),
    choice(
      '告诉亲近的人，自己需要一点独处时间。',
      weights([
        ['social', 0.7],
        ['loyalty', 0.6],
        ['order', 0.4],
      ]),
      ['Wolf'],
    ),
  ),
  scenarioQuestion(
    'q67-wild-idea',
    '脑袋里冒出一个有点离谱的点子。',
    'core',
    choice(
      '先做一个很小的版本，看看是否可行。',
      weights([
        ['mischief', 1],
        ['curiosity', 0.8],
        ['mobility', 0.4],
      ]),
      ['Evoker', 'Vex'],
    ),
    choice(
      '先记录下来，等条件成熟后再尝试。',
      weights([
        ['patience', 0.8],
        ['order', 0.7],
        ['resource', 0.4],
      ]),
      ['Sniffer'],
    ),
  ),
  scenarioQuestion(
    'q68-stand-ground',
    '有人催你尽快改变立场。',
    'core',
    choice(
      '如果判断没有错，就继续坚持原来的决定。',
      weights([
        ['resilience', 1],
        ['independence', 0.7],
        ['order', 0.4],
      ]),
      ['Warden'],
    ),
    choice(
      '出现新条件时，及时更新自己的判断。',
      weights([
        ['curiosity', 0.8],
        ['social', 0.6],
        ['mobility', 0.4],
      ]),
      ['Zombie Villager', 'Tadpole', 'Frog'],
    ),
  ),
  scenarioQuestion(
    'q69-little-shop',
    '如果开一个小摊，你更想卖什么？',
    'core',
    choice(
      '出售旅途中真正用得上的基础补给。',
      weights([
        ['resource', 1],
        ['trade', 0.8],
        ['nurture', 0.4],
      ]),
      ['Villager'],
    ),
    choice(
      '出售少见的小玩意，吸引路人停下。',
      weights([
        ['spectacle', 0.8],
        ['curiosity', 0.7],
        ['trade', 0.5],
      ]),
      ['Wandering Trader'],
    ),
  ),
  scenarioQuestion(
    'q70-distant-friend',
    '很久没联系的朋友突然需要帮忙。',
    'core',
    choice(
      '只要能做到，就认真提供帮助。',
      weights([
        ['loyalty', 1],
        ['nurture', 0.7],
        ['social', 0.5],
      ]),
      ['Wolf'],
    ),
    choice(
      '先问清具体情况，再决定是否答应。',
      weights([
        ['caution', 0.9],
        ['order', 0.6],
        ['resource', 0.4],
      ]),
      ['Ocelot'],
    ),
  ),
  scenarioQuestion(
    'q71-falling-apart',
    '计划突然散架，队伍里有人开始慌张。',
    'core',
    choice(
      '先稳住最危险的部分，避免继续失控。',
      weights([
        ['protection', 0.9],
        ['resilience', 0.8],
        ['order', 0.5],
      ]),
      ['Iron Golem'],
    ),
    choice(
      '迅速寻找新的机会，重新打开局面。',
      weights([
        ['mobility', 1],
        ['curiosity', 0.7],
        ['aggression', 0.3],
      ]),
      ['Breeze'],
    ),
  ),
  scenarioQuestion(
    'q72-muddy-boots',
    '鞋子踩了一脚泥，但还要继续赶路。',
    'core',
    choice(
      '先清理干净，再继续往前走。',
      weights([
        ['order', 0.8],
        ['patience', 0.7],
        ['caution', 0.4],
      ]),
      ['Villager'],
    ),
    choice(
      '先保证进度，环境问题稍后再处理。',
      weights([
        ['resilience', 0.8],
        ['mobility', 0.7],
        ['independence', 0.4],
      ]),
      ['Husk'],
    ),
  ),
  scenarioQuestion(
    'q73-soft-warning',
    '你感觉事情不对劲，但证据还不够。',
    'core',
    choice(
      '先提醒亲近的人保持小心。',
      weights([
        ['protection', 0.8],
        ['caution', 0.8],
        ['loyalty', 0.5],
      ]),
      ['Cat'],
    ),
    choice(
      '继续观察，等待更明确的信号。',
      weights([
        ['patience', 0.9],
        ['stealth', 0.6],
        ['curiosity', 0.5],
      ]),
      ['Warden'],
    ),
  ),
  scenarioQuestion(
    'q74-bright-entrance',
    '必须进入大家视线时，你希望怎么出现？',
    'core',
    choice(
      '利落明确地出现，让所有人立即注意到。',
      weights([
        ['spectacle', 1],
        ['aggression', 0.6],
        ['order', 0.3],
      ]),
      ['Ghast', 'Phantom', 'Wither'],
    ),
    choice(
      '先融入周围环境，再逐步开始行动。',
      weights([
        ['stealth', 0.9],
        ['caution', 0.5],
        ['social', 0.4],
      ]),
      ['Creeper'],
    ),
  ),
  scenarioQuestion(
    'q75-same-route',
    '同一条路线已经走过很多遍。',
    'core',
    choice(
      '继续走熟悉路线，稳定感更重要。',
      weights([
        ['loyalty', 0.8],
        ['order', 0.7],
        ['patience', 0.5],
      ]),
      ['Turtle'],
    ),
    choice(
      '换一条路，让今天多一点新鲜感。',
      weights([
        ['curiosity', 1],
        ['mobility', 0.7],
        ['mischief', 0.3],
      ]),
      ['Enderman'],
    ),
  ),
  scenarioQuestion(
    'q76-help-reward',
    '帮完忙后，对方想送你一份回礼。',
    'core',
    choice(
      '收下一点心意就好，不必计算价值。',
      weights([
        ['social', 0.7],
        ['nurture', 0.6],
        ['loyalty', 0.5],
      ]),
      ['Allay'],
    ),
    choice(
      '换成彼此都需要的东西，更加公平。',
      weights([
        ['trade', 1],
        ['resource', 0.7],
        ['order', 0.3],
      ]),
      ['Villager'],
    ),
  ),
  scenarioQuestion(
    'q77-open-field',
    '眼前是一大片什么都没有的空地。',
    'core',
    choice(
      '先出去看看，确认这片区域的边界。',
      weights([
        ['mobility', 1],
        ['curiosity', 0.6],
        ['spectacle', 0.3],
      ]),
      ['Zombie Horse', 'Horse'],
    ),
    choice(
      '先找安全位置，建立一个小据点。',
      weights([
        ['caution', 0.9],
        ['protection', 0.6],
        ['order', 0.5],
      ]),
      ['Iron Golem'],
    ),
  ),
  scenarioQuestion(
    'q78-gentle-promise',
    '你答应了一个不算大的承诺。',
    'core',
    choice(
      '无论事情多小，也按原约定完成。',
      weights([
        ['loyalty', 1],
        ['order', 0.6],
        ['patience', 0.4],
      ]),
      ['Wolf'],
    ),
    choice(
      '情况变化时，及时说明并调整安排。',
      weights([
        ['social', 0.7],
        ['mobility', 0.5],
        ['caution', 0.4],
      ]),
      ['Dolphin'],
    ),
  ),
  scenarioQuestion(
    'q79-warm-corner',
    '你发现一个很暖和的小角落。',
    'core',
    choice(
      '把它整理成大家都能休息的地方。',
      weights([
        ['nurture', 1],
        ['social', 0.7],
        ['protection', 0.4],
      ]),
      ['Bee'],
    ),
    choice(
      '留给自己，安静恢复一会儿精力。',
      weights([
        ['independence', 0.9],
        ['patience', 0.6],
        ['stealth', 0.5],
      ]),
      ['Cat'],
    ),
  ),
  scenarioQuestion(
    'q80-suspicious-smile',
    '有人笑得很神秘，似乎知道什么。',
    'core',
    choice(
      '配合对方的节奏，看看谜底何时出现。',
      weights([
        ['mischief', 0.8],
        ['curiosity', 0.7],
        ['social', 0.4],
      ]),
      ['Parrot'],
    ),
    choice(
      '不被对方带着走，继续保持自己的判断。',
      weights([
        ['caution', 0.8],
        ['independence', 0.7],
        ['resilience', 0.4],
      ]),
      ['Enderman'],
    ),
  ),
  scenarioQuestion(
    'q81-last-resource',
    '最后一份资源只够完成一件事。',
    'core',
    choice(
      '用来保护大家，先守住现有成果。',
      weights([
        ['protection', 0.9],
        ['resource', 0.8],
        ['order', 0.4],
      ]),
      ['Iron Golem', 'Polar Bear'],
    ),
    choice(
      '投入最可能打开新局面的方向。',
      weights([
        ['curiosity', 0.8],
        ['aggression', 0.5],
        ['spectacle', 0.4],
      ]),
      ['Sniffer'],
    ),
  ),
  scenarioQuestion(
    'q82-smooth-water',
    '水面很平静，但看不清下面有什么。',
    'core',
    choice(
      '慢慢靠近，逐步寻找水下答案。',
      weights([
        ['aquatic', 1],
        ['curiosity', 0.6],
        ['patience', 0.4],
      ]),
      ['Nautilus', 'Cod', 'Salmon'],
    ),
    choice(
      '留在岸上，先通过周围线索判断。',
      weights([
        ['caution', 0.9],
        ['order', 0.5],
        ['stealth', 0.4],
      ]),
      ['Pufferfish'],
    ),
  ),
  scenarioQuestion(
    'q83-lost-child',
    '有人在陌生地方迷路了。',
    'core',
    choice(
      '陪对方回到熟悉和安全的地方。',
      weights([
        ['nurture', 1],
        ['protection', 0.8],
        ['social', 0.5],
      ]),
      ['Turtle'],
    ),
    choice(
      '教对方识别标记，以后能自己辨认方向。',
      weights([
        ['order', 0.8],
        ['curiosity', 0.5],
        ['independence', 0.5],
      ]),
      ['Villager'],
    ),
  ),
  scenarioQuestion(
    'q84-hidden-strength',
    '你希望自己的优势以哪种方式被看见？',
    'core',
    choice(
      '平时不显眼，但关键时刻能够扛住事情。',
      weights([
        ['resilience', 1],
        ['stealth', 0.6],
        ['loyalty', 0.5],
      ]),
      ['Iron Golem'],
    ),
    choice(
      '一旦出手，就让整个局面发生明显变化。',
      weights([
        ['spectacle', 1],
        ['aggression', 0.7],
        ['mobility', 0.3],
      ]),
      ['Ender Dragon', 'Wither'],
    ),
  ),
  scenarioQuestion(
    'q85-half-finished',
    '一个作品只完成了一半。',
    'core',
    choice(
      '继续仔细打磨，完整以后再使用。',
      weights([
        ['patience', 1],
        ['order', 0.8],
        ['resilience', 0.4],
      ]),
      ['Shulker'],
    ),
    choice(
      '先投入使用，再根据反馈逐步补齐。',
      weights([
        ['curiosity', 0.8],
        ['mobility', 0.6],
        ['mischief', 0.4],
      ]),
      ['Copper Golem'],
    ),
  ),
  scenarioQuestion(
    'q86-crowded-boat',
    '一艘小船坐得满满的，你会做什么？',
    'core',
    choice(
      '安排好重量和位置，稳稳划到对岸。',
      weights([
        ['aquatic', 0.8],
        ['order', 0.8],
        ['caution', 0.6],
      ]),
      ['Nautilus', 'Turtle'],
    ),
    choice(
      '让大家放松聊天，保持愉快气氛。',
      weights([
        ['social', 0.9],
        ['nurture', 0.5],
        ['patience', 0.4],
      ]),
      ['Dolphin'],
    ),
  ),
  scenarioQuestion(
    'q87-unexpected-gift',
    '你收到一个完全没想到的礼物。',
    'core',
    choice(
      '先好好收着，认真珍惜这份心意。',
      weights([
        ['loyalty', 0.8],
        ['resource', 0.6],
        ['nurture', 0.4],
      ]),
      ['Allay'],
    ),
    choice(
      '立即试一试，看看它能带来什么变化。',
      weights([
        ['curiosity', 1],
        ['mischief', 0.5],
        ['spectacle', 0.3],
      ]),
      ['Sulfur Cube', 'Horse'],
    ),
  ),
  scenarioQuestion(
    'q88-last-line',
    '队伍需要有人守住最后一道防线。',
    'core',
    choice(
      '留下来正面守住，不让危险继续推进。',
      weights([
        ['protection', 1],
        ['resilience', 0.9],
        ['loyalty', 0.5],
      ]),
      ['Piglin Brute', 'Wither Skeleton'],
    ),
    choice(
      '从侧面寻找入口，主动打破当前局面。',
      weights([
        ['mobility', 0.8],
        ['stealth', 0.7],
        ['aggression', 0.4],
      ]),
      ['Vex'],
    ),
  ),
  scenarioQuestion(
    'q89-odd-collection',
    '你会收集别人觉得奇怪的小东西吗？',
    'core',
    choice(
      '会，它们以后也许能派上用场。',
      weights([
        ['resource', 1],
        ['curiosity', 0.7],
        ['patience', 0.4],
      ]),
      ['Allay', 'Fox'],
    ),
    choice(
      '不太会，保持背包轻便更加重要。',
      weights([
        ['mobility', 0.8],
        ['order', 0.6],
        ['independence', 0.4],
      ]),
      ['Rabbit', 'Horse'],
    ),
  ),
  scenarioQuestion(
    'q90-spark-before-storm',
    '你感觉一场大事即将开始。',
    'core',
    choice(
      '站到推动行动的位置，主动带起节奏。',
      weights([
        ['aggression', 0.9],
        ['spectacle', 0.8],
        ['mobility', 0.4],
      ]),
      ['Pillager', 'Ravager'],
    ),
    choice(
      '先保护重要的人和物，守住基本盘。',
      weights([
        ['caution', 0.9],
        ['protection', 0.8],
        ['resource', 0.4],
      ]),
      ['Iron Golem'],
    ),
  ),
  scenarioQuestion(
    'q91-tired-team',
    '队伍已经很累了，但还没到终点。',
    'core',
    choice(
      '鼓励大家分成小段，继续向前推进。',
      weights([
        ['resilience', 0.9],
        ['social', 0.7],
        ['nurture', 0.5],
      ]),
      ['Strider'],
    ),
    choice(
      '先找安全地点休整，再重新出发。',
      weights([
        ['caution', 0.8],
        ['patience', 0.8],
        ['protection', 0.4],
      ]),
      ['Turtle'],
    ),
  ),
  scenarioQuestion(
    'q92-unknown-button',
    '墙上有个没有标签的按钮。',
    'core',
    choice(
      '站远一点做一次测试，观察会发生什么。',
      weights([
        ['mischief', 0.9],
        ['curiosity', 0.8],
        ['caution', 0.4],
      ]),
      ['Endermite'],
    ),
    choice(
      '先查清连接线路，再决定是否按下。',
      weights([
        ['order', 0.9],
        ['caution', 0.8],
        ['patience', 0.4],
      ]),
      ['Creaking', 'Creaking'],
    ),
  ),
  scenarioQuestion(
    'q93-final-door',
    '最后一扇门打开前，你最想确认什么？',
    'facet',
    choice(
      '确认大家进去后能够彼此照应。',
      weights([
        ['social', 0.9],
        ['protection', 0.8],
        ['loyalty', 0.5],
      ]),
      ['Iron Golem', 'Wolf'],
    ),
    choice(
      '确认里面的威胁和撤离路线。',
      weights([
        ['order', 0.8],
        ['resource', 0.7],
        ['caution', 0.6],
      ]),
      ['Stray', 'Bogged', 'Parched', 'Skeleton'],
    ),
  ),
]

const adaptiveTieBreakerBlueprints: readonly QuestionBlueprint[] = [
  directTieBreaker(
    'q94-air-control',
    '讨论陷入复杂局面时，你怎样继续推进？',
    choice(
      '不断转换观察角度，让局面重新流动。',
      weights([
        ['mobility', 1],
        ['aggression', 0.8],
        ['spectacle', 0.5],
      ]),
      ['Ender Dragon', 'Wither'],
    ),
    choice(
      '守住核心问题，一层一层把它讲透。',
      weights([
        ['aggression', 1],
        ['resilience', 0.7],
        ['order', 0.4],
      ]),
      ['Blaze', 'Magma Cube', 'Ravager'],
    ),
  ),
  directTieBreaker(
    'q95-damage-response',
    '计划受挫后，你怎样重新建立优势？',
    choice(
      '拆分问题并调整结构，从多个方向继续。',
      weights([
        ['resilience', 1],
        ['aggression', 0.7],
        ['mobility', 0.4],
      ]),
      ['Magma Cube', 'Wither'],
    ),
    choice(
      '重新整理流程，让行动回到稳定节奏。',
      weights([
        ['order', 0.9],
        ['spectacle', 0.8],
        ['aggression', 0.6],
      ]),
      ['Blaze', 'Ravager', 'Ender Dragon'],
    ),
  ),
  directTieBreaker(
    'q96-battle-movement',
    '任务需要持续推进时，你偏向哪种路线？',
    choice(
      '扩大活动范围，不断寻找新的切入角度。',
      weights([
        ['mobility', 1],
        ['independence', 0.6],
        ['curiosity', 0.4],
      ]),
      ['Magma Cube', 'Ender Dragon'],
    ),
    choice(
      '围绕核心目标行动，持续施加影响。',
      weights([
        ['aggression', 0.9],
        ['patience', 0.7],
        ['order', 0.5],
      ]),
      ['Blaze', 'Ravager', 'Wither'],
    ),
  ),
  directTieBreaker(
    'q97-break-through',
    '前路被完全挡住时，你会怎么处理？',
    choice(
      '集中力量直接清出一个突破口。',
      weights([
        ['aggression', 1],
        ['spectacle', 0.8],
        ['resilience', 0.6],
      ]),
      ['Ravager'],
    ),
    choice(
      '更换工具或路线，用其他办法绕过阻挡。',
      weights([
        ['mobility', 0.8],
        ['resource', 0.7],
        ['curiosity', 0.5],
      ]),
      ['Blaze', 'Magma Cube', 'Ender Dragon', 'Wither'],
    ),
  ),
  directTieBreaker(
    'q98-long-pressure',
    '面对一场持续很久的竞争，你怎样保持压力？',
    choice(
      '连续推进小动作，让对方一直需要应对。',
      weights([
        ['aggression', 0.9],
        ['resilience', 0.8],
        ['spectacle', 0.5],
      ]),
      ['Ravager', 'Ender Dragon', 'Wither'],
    ),
    choice(
      '等待固定时机，再集中完成一轮行动。',
      weights([
        ['patience', 0.9],
        ['order', 0.8],
        ['aggression', 0.5],
      ]),
      ['Blaze', 'Magma Cube'],
    ),
  ),
  directTieBreaker(
    'q99-second-wave',
    '第一轮行动结束后，你通常会怎么做？',
    choice(
      '立即组织第二轮行动，延续当前势头。',
      weights([
        ['resilience', 1],
        ['aggression', 0.8],
        ['spectacle', 0.5],
      ]),
      ['Magma Cube', 'Ravager', 'Wither'],
    ),
    choice(
      '先拉开距离，准备充分后再开始下一轮。',
      weights([
        ['patience', 0.8],
        ['mobility', 0.8],
        ['order', 0.5],
      ]),
      ['Blaze', 'Ender Dragon'],
    ),
  ),
  directTieBreaker(
    'q100-home-arena',
    '哪种工作环境最能让你发挥？',
    choice(
      '开放灵活、可以自由移动和调整的空间。',
      weights([
        ['spectacle', 1],
        ['mobility', 0.7],
        ['aggression', 0.5],
      ]),
      ['Magma Cube', 'Ravager', 'Ender Dragon'],
    ),
    choice(
      '边界清楚、入口和位置都明确的空间。',
      weights([
        ['order', 0.9],
        ['patience', 0.8],
        ['resilience', 0.4],
      ]),
      ['Blaze', 'Wither'],
    ),
  ),
  directTieBreaker(
    'q101-threat-angle',
    '对方只盯着正面时，你会怎样利用这一点？',
    choice(
      '主动改变角度，从对方没注意的方向推进。',
      weights([
        ['mobility', 1],
        ['curiosity', 0.6],
        ['aggression', 0.5],
      ]),
      ['Ender Dragon', 'Wither'],
    ),
    choice(
      '继续加强正面压力，把已有优势推到底。',
      weights([
        ['aggression', 1],
        ['patience', 0.6],
        ['resilience', 0.5],
      ]),
      ['Blaze', 'Magma Cube', 'Ravager'],
    ),
  ),
  directTieBreaker(
    'q102-form-change',
    '局势要求改变方法时，你会改变什么？',
    choice(
      '调整规则或拆分方式，让问题以新结构继续。',
      weights([
        ['resilience', 1],
        ['resource', 0.7],
        ['mischief', 0.4],
      ]),
      ['Magma Cube', 'Wither'],
    ),
    choice(
      '调整动作组合，但保持原来的整体目标。',
      weights([
        ['order', 0.9],
        ['mobility', 0.7],
        ['spectacle', 0.5],
      ]),
      ['Blaze', 'Ravager', 'Ender Dragon'],
    ),
  ),
  directTieBreaker(
    'q103-distance-rhythm',
    '处理分歧时，哪种距离更容易找到节奏？',
    choice(
      '不断调整远近，根据反馈改变接触程度。',
      weights([
        ['mobility', 1],
        ['independence', 0.7],
        ['mischief', 0.4],
      ]),
      ['Magma Cube', 'Ender Dragon'],
    ),
    choice(
      '保持最有效的距离，稳定推进沟通。',
      weights([
        ['aggression', 0.9],
        ['order', 0.7],
        ['patience', 0.5],
      ]),
      ['Blaze', 'Ravager', 'Wither'],
    ),
  ),
  directTieBreaker(
    'q104-impact-style',
    '团队需要一次决定性的推动，你会怎么做？',
    choice(
      '承担最直接的突破，快速打通阻碍。',
      weights([
        ['aggression', 1],
        ['protection', 0.6],
        ['spectacle', 0.6],
      ]),
      ['Ravager'],
    ),
    choice(
      '改变周围条件，让局面从其他方向松动。',
      weights([
        ['resource', 0.9],
        ['mobility', 0.7],
        ['mischief', 0.5],
      ]),
      ['Blaze', 'Magma Cube', 'Ender Dragon', 'Wither'],
    ),
  ),
  directTieBreaker(
    'q105-pressure-source',
    '你更相信哪种持续影响方式？',
    choice(
      '不断保持存在感，让事情始终向前移动。',
      weights([
        ['aggression', 0.9],
        ['spectacle', 0.8],
        ['resilience', 0.5],
      ]),
      ['Ravager', 'Ender Dragon', 'Wither'],
    ),
    choice(
      '建立固定节奏，让下一次行动可以被预期。',
      weights([
        ['patience', 0.9],
        ['order', 0.8],
        ['aggression', 0.4],
      ]),
      ['Blaze', 'Magma Cube'],
    ),
  ),
  directTieBreaker(
    'q106-recovery-signal',
    '别人怎样看出你还没有退出这件事？',
    choice(
      '用明显调整和新动作说明自己会继续。',
      weights([
        ['resilience', 1],
        ['spectacle', 0.8],
        ['aggression', 0.5],
      ]),
      ['Magma Cube', 'Ravager', 'Wither'],
    ),
    choice(
      '重新回到熟悉节奏，本身就是继续的信号。',
      weights([
        ['order', 0.8],
        ['mobility', 0.7],
        ['patience', 0.6],
      ]),
      ['Blaze', 'Ender Dragon'],
    ),
  ),
  directTieBreaker(
    'q107-territory-choice',
    '新的讨论地点由你选择时，你偏向哪里？',
    choice(
      '选择宽阔空间，方便移动和转换位置。',
      weights([
        ['mobility', 0.9],
        ['spectacle', 0.8],
        ['aggression', 0.5],
      ]),
      ['Magma Cube', 'Ravager', 'Ender Dragon'],
    ),
    choice(
      '选择边界清楚、入口明确的地方。',
      weights([
        ['order', 1],
        ['patience', 0.7],
        ['resource', 0.5],
      ]),
      ['Blaze', 'Wither'],
    ),
  ),
  directTieBreaker(
    'q108-wind-or-bite',
    '狭窄空间里出现冲突时，你会怎么行动？',
    choice(
      '先制造距离，为自己留出调整空间。',
      weights([
        ['mobility', 1],
        ['mischief', 0.8],
        ['independence', 0.5],
      ]),
      ['Breeze'],
    ),
    choice(
      '主动靠近，从空隙里直接处理问题。',
      weights([
        ['stealth', 0.9],
        ['aggression', 0.8],
        ['mobility', 0.4],
      ]),
      ['Endermite'],
    ),
  ),
  directTieBreaker(
    'q109-arrival-method',
    '一项挑战已经开始，你会怎样加入？',
    choice(
      '等到适合自己的阶段，再正式进入行动。',
      weights([
        ['spectacle', 0.8],
        ['aggression', 0.7],
        ['order', 0.5],
      ]),
      ['Breeze'],
    ),
    choice(
      '抓住意外出现的空当，迅速加入现场。',
      weights([
        ['mischief', 1],
        ['stealth', 0.7],
        ['curiosity', 0.5],
      ]),
      ['Endermite'],
    ),
  ),
  directTieBreaker(
    'q110-jump-or-scurry',
    '需要避开阻挡时，你会选择哪条路线？',
    choice(
      '迅速移动到新的高处，拉开观察角度。',
      weights([
        ['mobility', 1],
        ['caution', 0.6],
        ['mischief', 0.5],
      ]),
      ['Breeze'],
    ),
    choice(
      '贴着低处和缝隙前进，寻找小空当。',
      weights([
        ['stealth', 1],
        ['mobility', 0.7],
        ['caution', 0.4],
      ]),
      ['Endermite'],
    ),
  ),
  directTieBreaker(
    'q111-ranged-or-close',
    '处理冲突时，你更愿意保持哪种距离？',
    choice(
      '隔着一段距离影响局面和对方位置。',
      weights([
        ['mobility', 0.9],
        ['resource', 0.8],
        ['mischief', 0.6],
      ]),
      ['Breeze'],
    ),
    choice(
      '抓住机会靠近，当面把问题解决。',
      weights([
        ['aggression', 1],
        ['stealth', 0.6],
        ['resilience', 0.4],
      ]),
      ['Endermite'],
    ),
  ),
  directTieBreaker(
    'q112-keep-away',
    '对方不断靠近你的边界时，你会怎么做？',
    choice(
      '持续调整位置，主动维持安全距离。',
      weights([
        ['caution', 0.9],
        ['mobility', 0.9],
        ['resource', 0.5],
      ]),
      ['Breeze'],
    ),
    choice(
      '不再后退，靠近对方直接处理问题。',
      weights([
        ['aggression', 0.9],
        ['patience', 0.7],
        ['stealth', 0.5],
      ]),
      ['Endermite'],
    ),
  ),
  directTieBreaker(
    'q113-stay-or-vanish',
    '现场暂时没人回应你，你会怎么选择？',
    choice(
      '留在原地继续等待，守住自己的任务。',
      weights([
        ['patience', 0.9],
        ['order', 0.8],
        ['resilience', 0.5],
      ]),
      ['Breeze'],
    ),
    choice(
      '安静退出，把时间留给其他事情。',
      weights([
        ['stealth', 1],
        ['independence', 0.8],
        ['caution', 0.4],
      ]),
      ['Endermite'],
    ),
  ),
  directTieBreaker(
    'q114-enderman-reaction',
    '加入一个已有矛盾的小组时，你会怎么做？',
    choice(
      '按既定任务行动，不围绕旧矛盾改变节奏。',
      weights([
        ['independence', 0.9],
        ['order', 0.7],
        ['patience', 0.5],
      ]),
      ['Breeze', 'Enderman'],
    ),
    choice(
      '先处理关系张力，因为自己的加入会引发反应。',
      weights([
        ['mischief', 1],
        ['aggression', 0.7],
        ['spectacle', 0.5],
      ]),
      ['Endermite', 'Enderman'],
    ),
  ),
  directTieBreaker(
    'q115-mountain-or-charge',
    '面对高低差很大的地形，你会怎么走？',
    choice(
      '利用高低变化，选择更灵活的跨越路线。',
      weights([
        ['mobility', 1],
        ['curiosity', 0.6],
        ['independence', 0.5],
      ]),
      ['Goat'],
    ),
    choice(
      '锁定目标方向，沿最直接的路线推进。',
      weights([
        ['aggression', 1],
        ['resilience', 0.7],
        ['spectacle', 0.4],
      ]),
      ['Zoglin'],
    ),
  ),
  directTieBreaker(
    'q116-ram-target',
    '准备进行一次强硬推动前，你会怎么做？',
    choice(
      '先发出清楚信号，短暂准备后再行动。',
      weights([
        ['patience', 0.8],
        ['aggression', 0.7],
        ['order', 0.6],
      ]),
      ['Goat'],
    ),
    choice(
      '抓住目标立即推进，不等待额外提醒。',
      weights([
        ['aggression', 1],
        ['spectacle', 0.6],
        ['resilience', 0.5],
      ]),
      ['Zoglin'],
    ),
  ),
  directTieBreaker(
    'q117-useful-trace',
    '完成一次强硬行动后，你会留下什么？',
    choice(
      '整理出可复用的方法，方便以后再次使用。',
      weights([
        ['resource', 0.9],
        ['spectacle', 0.7],
        ['curiosity', 0.5],
      ]),
      ['Goat'],
    ),
    choice(
      '继续寻找下一个目标，不停下来整理痕迹。',
      weights([
        ['aggression', 1],
        ['mobility', 0.6],
        ['independence', 0.5],
      ]),
      ['Zoglin'],
    ),
  ),
  directTieBreaker(
    'q118-changed-world',
    '环境发生巨大变化时，你会如何适应？',
    choice(
      '保持原有习惯，同时利用新环境的优势。',
      weights([
        ['resilience', 0.8],
        ['mobility', 0.8],
        ['patience', 0.5],
      ]),
      ['Goat'],
    ),
    choice(
      '彻底改变策略，用新的方式面对周围。',
      weights([
        ['aggression', 1],
        ['resilience', 0.7],
        ['spectacle', 0.5],
      ]),
      ['Zoglin', 'Hoglin'],
    ),
  ),
  directTieBreaker(
    'q119-arrow-effect',
    '需要控制危险局面时，你会先限制什么？',
    choice(
      '先降低对方造成影响的能力。',
      weights([
        ['caution', 0.9],
        ['resource', 0.8],
        ['order', 0.5],
      ]),
      ['Parched'],
    ),
    choice(
      '先限制对方移动和接近的速度。',
      weights([
        ['patience', 0.9],
        ['mobility', 0.7],
        ['resource', 0.6],
      ]),
      ['Stray'],
    ),
  ),
  directTieBreaker(
    'q120-dry-or-frozen',
    '必须长期适应一种极端环境，你会选哪种？',
    choice(
      '选择干燥炎热的地方，保持主动行动。',
      weights([
        ['resilience', 0.9],
        ['independence', 0.7],
        ['aggression', 0.4],
      ]),
      ['Parched'],
    ),
    choice(
      '选择寒冷安静的地方，耐心等待机会。',
      weights([
        ['patience', 1],
        ['caution', 0.7],
        ['resilience', 0.5],
      ]),
      ['Stray'],
    ),
  ),
  directTieBreaker(
    'q121-weaken-or-slow',
    '队友需要你先削弱一个危险目标。',
    choice(
      '优先降低对方能造成的影响。',
      weights([
        ['protection', 0.9],
        ['resource', 0.8],
        ['caution', 0.5],
      ]),
      ['Parched'],
    ),
    choice(
      '优先阻止对方快速接近。',
      weights([
        ['order', 0.9],
        ['patience', 0.7],
        ['mobility', 0.6],
      ]),
      ['Stray'],
    ),
  ),
  directTieBreaker(
    'q122-poison-or-pounce',
    '一次近距离交锋中，你更依赖什么？',
    choice(
      '让一次接触持续产生后续影响。',
      weights([
        ['mischief', 0.9],
        ['aggression', 0.8],
        ['stealth', 0.6],
      ]),
      ['Cave Spider'],
    ),
    choice(
      '集中在当下，直接完成这次行动。',
      weights([
        ['aggression', 0.9],
        ['mobility', 0.7],
        ['patience', 0.4],
      ]),
      ['Spider'],
    ),
  ),
  directTieBreaker(
    'q123-tight-passage',
    '前方通道很窄，你会怎样通过？',
    choice(
      '贴着狭窄路线前进，利用每一处空隙。',
      weights([
        ['stealth', 1],
        ['mobility', 0.7],
        ['caution', 0.5],
      ]),
      ['Cave Spider'],
    ),
    choice(
      '寻找正常入口，选择更完整的通行路线。',
      weights([
        ['curiosity', 0.8],
        ['patience', 0.7],
        ['mobility', 0.5],
      ]),
      ['Spider'],
    ),
  ),
  directTieBreaker(
    'q124-spawn-place',
    '需要在黑暗处等待机会，你会选哪里？',
    choice(
      '选择狭窄而明确的据点，集中注意力。',
      weights([
        ['stealth', 0.9],
        ['order', 0.8],
        ['patience', 0.6],
      ]),
      ['Cave Spider'],
    ),
    choice(
      '选择活动范围更大的区域，保持多种可能。',
      weights([
        ['independence', 0.9],
        ['mobility', 0.7],
        ['curiosity', 0.5],
      ]),
      ['Spider'],
    ),
  ),
  directTieBreaker(
    'q125-pack-bond',
    '同伴遇到威胁时，你为什么加入行动？',
    choice(
      '因为信任某个具体的人，愿意与对方并肩。',
      weights([
        ['loyalty', 1],
        ['protection', 0.9],
        ['social', 0.7],
      ]),
      ['Wolf'],
    ),
    choice(
      '因为整个群体的边界被触发，需要共同回应。',
      weights([
        ['social', 0.9],
        ['aggression', 0.8],
        ['resilience', 0.5],
      ]),
      ['Zombified Piglin'],
    ),
  ),
  directTieBreaker(
    'q126-calm-until-hit',
    '没有人主动冒犯时，你会保持什么状态？',
    choice(
      '把精力留给陪伴和守护，维持亲近关系。',
      weights([
        ['loyalty', 1],
        ['patience', 0.7],
        ['protection', 0.7],
      ]),
      ['Wolf', 'Wolf'],
    ),
    choice(
      '保持中立，但把反击条件记得非常清楚。',
      weights([
        ['caution', 0.9],
        ['social', 0.7],
        ['aggression', 0.6],
      ]),
      ['Zombified Piglin'],
    ),
  ),
  directTieBreaker(
    'q127-mining-fatigue',
    '你要阻止别人接近核心区域，会怎么做？',
    choice(
      '从远处逐步增加限制，让对方越来越难推进。',
      weights([
        ['protection', 1],
        ['aquatic', 0.8],
        ['order', 0.7],
      ]),
      ['Elder Guardian'],
    ),
    choice(
      '直接守住入口，不接受进一步协商。',
      weights([
        ['aggression', 1],
        ['loyalty', 0.7],
        ['resilience', 0.5],
      ]),
      ['Piglin Brute'],
    ),
  ),
  directTieBreaker(
    'q128-guardian-warning',
    '陌生人闯入你的据点时，你怎样警告？',
    choice(
      '持续增加阻力，让对方自行停止前进。',
      weights([
        ['patience', 0.9],
        ['protection', 0.9],
        ['aquatic', 0.6],
      ]),
      ['Elder Guardian'],
    ),
    choice(
      '立即表明底线，不给对方协商空间。',
      weights([
        ['aggression', 1],
        ['independence', 0.7],
        ['order', 0.5],
      ]),
      ['Piglin Brute'],
    ),
  ),
  directTieBreaker(
    'q129-hunger-or-weakness',
    '荒漠中的对手正在靠近，你怎样削弱对方？',
    choice(
      '靠近后持续消耗，让对方越来越难坚持。',
      weights([
        ['aggression', 0.9],
        ['resilience', 0.7],
        ['patience', 0.5],
      ]),
      ['Husk'],
    ),
    choice(
      '保持距离，在接触前降低对方的影响力。',
      weights([
        ['caution', 0.9],
        ['resource', 0.8],
        ['order', 0.6],
      ]),
      ['Parched'],
    ),
  ),
  directTieBreaker(
    'q130-milk-or-wool',
    '需要长期提供日常补给时，你偏向哪种循环？',
    choice(
      '准备好容器和流程，持续稳定交付。',
      weights([
        ['resource', 1],
        ['patience', 0.8],
        ['nurture', 0.5],
      ]),
      ['Cow', 'Cow'],
    ),
    choice(
      '完成一批后充分恢复，再准备下一批。',
      weights([
        ['resource', 0.9],
        ['resilience', 0.8],
        ['patience', 0.6],
      ]),
      ['Sheep'],
    ),
  ),
  directTieBreaker(
    'q131-steady-or-colorful-supply',
    '同一种资源也能体现风格，你更看重什么？',
    choice(
      '把可靠和一致放在第一位。',
      weights([
        ['order', 0.9],
        ['resource', 0.8],
        ['patience', 0.6],
      ]),
      ['Cow', 'Cow'],
    ),
    choice(
      '愿意加入明显变化，让每次产出有所不同。',
      weights([
        ['spectacle', 0.9],
        ['resource', 0.7],
        ['curiosity', 0.6],
      ]),
      ['Sheep'],
    ),
  ),
  directTieBreaker(
    'q132-wheat-or-grass-reset',
    '完成一轮工作后，你怎样恢复投入状态？',
    choice(
      '通过明确补给和固定流程重新集中。',
      weights([
        ['order', 0.8],
        ['social', 0.6],
        ['resource', 0.6],
      ]),
      ['Cow'],
    ),
    choice(
      '留出一段安静时间，恢复后再继续产出。',
      weights([
        ['nurture', 0.9],
        ['resilience', 0.8],
        ['patience', 0.7],
      ]),
      ['Sheep'],
    ),
  ),
  directTieBreaker(
    'q133-owner-or-crowd-bond',
    '你加入一场冲突时，关系基础是什么？',
    choice(
      '为了某个具体信任的人采取行动。',
      weights([
        ['loyalty', 1],
        ['protection', 0.8],
        ['social', 0.5],
      ]),
      ['Wolf'],
    ),
    choice(
      '因为整个群体的共同边界被触发。',
      weights([
        ['social', 1],
        ['aggression', 0.8],
        ['resilience', 0.5],
      ]),
      ['Zombified Piglin'],
    ),
  ),
  directTieBreaker(
    'q134-care-or-shared-anger',
    '紧张结束后，你怎样维持关系？',
    choice(
      '接受照料和支持，继续陪伴对方。',
      weights([
        ['loyalty', 1],
        ['nurture', 0.8],
        ['protection', 0.7],
      ]),
      ['Wolf', 'Wolf'],
    ),
    choice(
      '让群体记住边界，避免同样的事再次发生。',
      weights([
        ['social', 0.9],
        ['caution', 0.8],
        ['aggression', 0.7],
      ]),
      ['Zombified Piglin'],
    ),
  ),
  directTieBreaker(
    'q135-command-or-trigger',
    '同伴开始行动时，你为什么一起跟上？',
    choice(
      '清楚知道自己正在支持谁。',
      weights([
        ['loyalty', 1],
        ['order', 0.7],
        ['protection', 0.6],
      ]),
      ['Wolf'],
    ),
    choice(
      '共同条件已经出现，整个群体需要响应。',
      weights([
        ['social', 1],
        ['aggression', 0.7],
        ['spectacle', 0.5],
      ]),
      ['Zombified Piglin'],
    ),
  ),
  directTieBreaker(
    'q136-volley-or-crystal-cycle',
    '需要长时间控制局面时，你依靠什么循环？',
    choice(
      '按固定窗口集中行动，稳定控制节奏。',
      weights([
        ['order', 0.9],
        ['aggression', 0.8],
        ['patience', 0.6],
      ]),
      ['Blaze'],
    ),
    choice(
      '把移动、调整和恢复连接成持续循环。',
      weights([
        ['mobility', 1],
        ['resilience', 0.8],
        ['spectacle', 0.6],
      ]),
      ['Ender Dragon'],
    ),
  ),
  directTieBreaker(
    'q137-summoned-or-returning-boss',
    '一项大行动以什么方式开始更适合你？',
    choice(
      '先准备完整条件，到位后集中启动。',
      weights([
        ['order', 0.9],
        ['spectacle', 0.9],
        ['aggression', 0.7],
      ]),
      ['Wither'],
    ),
    choice(
      '回到熟悉主场，利用已有优势重新开始。',
      weights([
        ['resilience', 1],
        ['mobility', 0.8],
        ['independence', 0.6],
      ]),
      ['Ender Dragon'],
    ),
  ),
  directTieBreaker(
    'q138-split-or-charge',
    '正面受阻后，你怎样继续施加影响？',
    choice(
      '把一个问题拆成多路，同时继续推进。',
      weights([
        ['resilience', 1],
        ['mobility', 0.7],
        ['mischief', 0.6],
      ]),
      ['Magma Cube'],
    ),
    choice(
      '集中现有力量，直接推开面前阻挡。',
      weights([
        ['aggression', 1],
        ['spectacle', 0.8],
        ['resilience', 0.5],
      ]),
      ['Ravager'],
    ),
  ),
  directTieBreaker(
    'q139-fireline-or-lava-leap',
    '在困难环境中推进时，你偏向哪种节奏？',
    choice(
      '守住合适距离，维持稳定的行动线。',
      weights([
        ['aggression', 0.9],
        ['order', 0.8],
        ['patience', 0.6],
      ]),
      ['Blaze'],
    ),
    choice(
      '持续改变位置，逐步拉近接触距离。',
      weights([
        ['mobility', 1],
        ['resilience', 0.8],
        ['aggression', 0.5],
      ]),
      ['Magma Cube'],
    ),
  ),
  directTieBreaker(
    'q140-skulls-or-perch',
    '取得优势后，你会怎样进入下一阶段？',
    choice(
      '边推进边调整防线，应对新的压力。',
      weights([
        ['aggression', 1],
        ['resilience', 0.9],
        ['resource', 0.5],
      ]),
      ['Wither', 'Wither'],
    ),
    choice(
      '回到关键位置，重新控制周围区域。',
      weights([
        ['mobility', 0.9],
        ['spectacle', 0.8],
        ['order', 0.6],
      ]),
      ['Ender Dragon'],
    ),
  ),
  directTieBreaker(
    'q141-ink-or-jungle-distance',
    '有人突然靠近时，你会怎样撤离？',
    choice(
      '先制造遮挡，再从现场安静离开。',
      weights([
        ['aquatic', 1],
        ['stealth', 0.8],
        ['mobility', 0.5],
      ]),
      ['Squid'],
    ),
    choice(
      '提前拉开距离，不让对方继续靠近。',
      weights([
        ['caution', 1],
        ['independence', 0.8],
        ['stealth', 0.5],
      ]),
      ['Ocelot'],
    ),
  ),
  directTieBreaker(
    'q142-poison-or-vibration-hunt',
    '看不清目标所在时，你依靠什么寻找？',
    choice(
      '守住视线和距离，等待目标暴露位置。',
      weights([
        ['caution', 0.9],
        ['aggression', 0.8],
        ['aquatic', 0.5],
      ]),
      ['Bogged'],
    ),
    choice(
      '追踪环境中的细小变化，判断来源。',
      weights([
        ['stealth', 0.9],
        ['curiosity', 0.8],
        ['aggression', 0.7],
      ]),
      ['Warden'],
    ),
  ),
  directTieBreaker(
    'q143-echo-or-treasure-guide',
    '你给同伴提供线索时，会选择哪种方式？',
    choice(
      '用简短声音或信号提醒身边的人。',
      weights([
        ['social', 0.9],
        ['mischief', 0.8],
        ['curiosity', 0.6],
      ]),
      ['Parrot'],
    ),
    choice(
      '直接带着同伴前往目标位置。',
      weights([
        ['aquatic', 0.9],
        ['mobility', 0.9],
        ['social', 0.7],
      ]),
      ['Dolphin'],
    ),
  ),
]

export const questions: readonly Question[] = [
  ...questionBlueprints.map(buildQuestion),
  ...adaptiveTieBreakerBlueprints.map(buildQuestion),
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

const mobCodes = new Set(mobProfiles.map((profile) => profile.code))
for (const question of questions) {
  for (const candidate of question.options) {
    const unknownTargets = candidate.targetMobCodes.filter((code) => !mobCodes.has(code))
    if (unknownTargets.length > 0) {
      throw new Error(`Unknown targets for ${question.id}/${candidate.id}: ${unknownTargets.join(', ')}`)
    }
  }
}
