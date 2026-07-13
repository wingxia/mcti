const API_ENDPOINT = 'https://zh.minecraft.wiki/api.php'
const MOB_LIST_PAGE = '生物'
const EXPECTED_MOB_COUNT = 89
const CONCURRENCY = 8

const argumentValue = (name) =>
  process.argv.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3)

const startIndex = Number.parseInt(argumentValue('start') ?? '0', 10)
const requestedCount = Number.parseInt(argumentValue('count') ?? String(EXPECTED_MOB_COUNT), 10)
const summaryOnly = process.argv.includes('--summary')
const compact = process.argv.includes('--compact')
const maxChars = Number.parseInt(argumentValue('max-chars') ?? '0', 10)

if (!Number.isInteger(startIndex) || startIndex < 0) {
  throw new Error('--start must be a non-negative integer.')
}
if (!Number.isInteger(requestedCount) || requestedCount < 1) {
  throw new Error('--count must be a positive integer.')
}
if (!Number.isInteger(maxChars) || maxChars < 0) {
  throw new Error('--max-chars must be a non-negative integer.')
}

const truncate = (value) =>
  maxChars > 0 && value.length > maxChars ? `${value.slice(0, maxChars).trimEnd()}...` : value

const fetchParse = async (page) => {
  const endpoint = new URL(API_ENDPOINT)
  endpoint.search = new URLSearchParams({
    action: 'parse',
    page,
    prop: 'wikitext|revid',
    redirects: '1',
    format: 'json',
    formatversion: '2',
  }).toString()

  const response = await fetch(endpoint)
  if (!response.ok) {
    throw new Error(`Wiki request failed for ${page}: ${response.status} ${response.statusText}`)
  }

  const payload = await response.json()
  if (!payload?.parse?.wikitext) {
    throw new Error(`Wiki response did not include wikitext for ${page}.`)
  }
  return payload.parse
}

const cleanWikitext = (value) => {
  let text = value
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<ref\b[^>]*\/>/gi, ' ')
    .replace(/<ref\b[^>]*>[\s\S]*?<\/ref>/gi, ' ')
    .replace(/\[\[(?:File|文件):[\s\S]*?\]\]/gi, ' ')

  for (let pass = 0; pass < 12; pass += 1) {
    const next = text.replace(/\{\{[^{}]*\}\}/g, ' ')
    if (next === text) break
    text = next
  }

  return text
    .replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/'{2,}/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^=+.*?=+$/gm, ' ')
    .replace(/[{}|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const section = (wikitext, heading) => {
  const marker = `== ${heading} ==`
  const start = wikitext.indexOf(marker)
  if (start === -1) return ''

  const contentStart = start + marker.length
  const remainder = wikitext.slice(contentStart)
  const nextSection = remainder.search(/^==[^=]/m)
  return nextSection === -1 ? remainder : remainder.slice(0, nextSection)
}

const mapConcurrent = async (items, mapper) => {
  const results = new Array(items.length)
  let nextIndex = 0

  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await mapper(items[index], index)
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker))
  return results
}

const listPage = await fetchParse(MOB_LIST_PAGE)
const listText = listPage.wikitext
const friendlyStart = listText.indexOf('=== 友好生物 ===')
const unusedStart = listText.indexOf('=== 未使用的生物 ===')

if (friendlyStart === -1 || unusedStart === -1 || unusedStart <= friendlyStart) {
  throw new Error('Could not locate the current friendly-to-unused mob list section.')
}

const mobSection = listText.slice(friendlyStart, unusedStart)
const mobCodes = [...mobSection.matchAll(/\{\{Mob icon\|([^|}\n]+)/g)]
  .map((match) => match[1].trim())
  .filter((code) => code !== 'start' && code !== 'end')

if (mobCodes.length !== EXPECTED_MOB_COUNT) {
  throw new Error(`Expected ${EXPECTED_MOB_COUNT} mobs, received ${mobCodes.length}.`)
}

const selectedCodes = mobCodes.slice(startIndex, startIndex + requestedCount)
const details = await mapConcurrent(selectedCodes, async (code) => {
  const page = await fetchParse(code)
  const behavior = cleanWikitext(section(page.wikitext, '行为'))
  const spawning = cleanWikitext(section(page.wikitext, '生成'))
  const introduction = cleanWikitext(page.wikitext.split(/^==[^=]/m)[0])

  return {
    code,
    title: page.title,
    pageId: page.pageid,
    revisionId: page.revid,
    introduction,
    spawning,
    behavior,
  }
})

console.log(
  JSON.stringify(
    {
      source: {
        pageId: listPage.pageid,
        revisionId: listPage.revid,
        mobCount: mobCodes.length,
        auditedCount: details.length,
        startIndex,
      },
      mobs: summaryOnly
        ? details.map(({ code, title, pageId, revisionId, behavior }) => ({
            code,
            title,
            pageId,
            revisionId,
            hasBehaviorSection: behavior.length > 0,
          }))
        : compact
          ? details.map(({ code, title, revisionId, introduction, behavior }) => ({
              code,
              title,
              revisionId,
              introduction: truncate(introduction),
              behavior: truncate(behavior),
            }))
          : details,
    },
    null,
    2,
  ),
)
