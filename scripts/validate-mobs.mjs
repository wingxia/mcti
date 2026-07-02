const SOURCE_REVISION = 1395881
const EXPECTED_CODES = [
  'Allay',
  'Armor Stand',
  'Armadillo',
  'Bat',
  'Camel',
  'Camel Husk',
  'Chicken',
  'Cod',
  'Copper Golem',
  'Cow',
  'Donkey',
  'Glow Squid',
  'Happy Ghast',
  'Horse',
  'Mooshroom',
  'Mule',
  'Parrot',
  'Pig',
  'Rabbit',
  'Salmon',
  'Sheep',
  'Skeleton Horse',
  'Sniffer',
  'Squid',
  'Strider',
  'Tadpole',
  'Tropical Fish',
  'Turtle',
  'Wandering Trader',
  'Zombie Horse',
  'Goat',
  'Pufferfish',
  'Sulfur Cube',
  'Villager',
  'Axolotl',
  'Cat',
  'Frog',
  'Ocelot',
  'Snow Golem',
  'Bee',
  'Dolphin',
  'Fox',
  'Iron Golem',
  'Llama',
  'Nautilus',
  'Panda',
  'Polar Bear',
  'Trader Llama',
  'Wolf',
  'Zombie Nautilus',
  'Blaze',
  'Bogged',
  'Breeze',
  'Creeper',
  'Elder Guardian',
  'Endermite',
  'Evoker',
  'Ghast',
  'Guardian',
  'Hoglin',
  'Husk',
  'Magma Cube',
  'Parched',
  'Phantom',
  'Piglin Brute',
  'Pillager',
  'Ravager',
  'Shulker',
  'Silverfish',
  'Skeleton',
  'Slime',
  'Stray',
  'Vex',
  'Vindicator',
  'Warden',
  'Witch',
  'Wither Skeleton',
  'Zoglin',
  'Zombie',
  'Zombie Villager',
  'Cave Spider',
  'Creaking',
  'Drowned',
  'Enderman',
  'Piglin',
  'Spider',
  'Zombified Piglin',
  'Ender Dragon',
  'Wither',
]

const endpoint = new URL('https://zh.minecraft.wiki/api.php')
endpoint.search = new URLSearchParams({
  action: 'parse',
  oldid: String(SOURCE_REVISION),
  prop: 'wikitext',
  format: 'json',
}).toString()

const response = await fetch(endpoint)
if (!response.ok) {
  throw new Error(`Wiki request failed: ${response.status} ${response.statusText}`)
}

const payload = await response.json()
const wikitext = payload?.parse?.wikitext?.['*']
if (typeof wikitext !== 'string') {
  throw new Error('Wiki response did not include wikitext.')
}

const section = wikitext.match(/^=== 友好生物 ===[\s\S]*?^=== 未使用的生物 ===/m)?.[0]
if (!section) {
  throw new Error('Could not find current friendly/hostile/Boss mob section.')
}

const actualCodes = [...section.matchAll(/\{\{Mob icon\|([^|}\n]+)/g)]
  .map((match) => match[1])
  .filter((code) => code !== 'start' && code !== 'end')

const expected = new Set(EXPECTED_CODES)
const actual = new Set(actualCodes)
const missing = EXPECTED_CODES.filter((code) => !actual.has(code))
const extra = actualCodes.filter((code) => !expected.has(code))
const duplicates = actualCodes.filter((code, index) => actualCodes.indexOf(code) !== index)

if (actualCodes.length !== EXPECTED_CODES.length || missing.length || extra.length || duplicates.length) {
  console.error('Mob list validation failed.')
  console.error({ expected: EXPECTED_CODES.length, actual: actualCodes.length, missing, extra, duplicates })
  process.exit(1)
}

console.log(`Validated ${actualCodes.length} mob codes against zh.minecraft.wiki oldid ${SOURCE_REVISION}.`)
