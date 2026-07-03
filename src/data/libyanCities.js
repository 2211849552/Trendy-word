export const LIBYA_FLAG = '🇱🇾'

export const LIBYAN_CITIES = [
  { id: 'tripoli', name: 'طرابلس', aliases: ['tripoli', 'طرابلس', 'trablous'] },
  { id: 'benghazi', name: 'بنغازي', aliases: ['benghazi', 'بنغازي', 'bingazi'] },
  { id: 'misrata', name: 'مصراتة', aliases: ['misrata', 'مصراتة', 'misurata'] },
  { id: 'sabha', name: 'سبها', aliases: ['sabha', 'سبها'] },
  { id: 'zawiya', name: 'الزاوية', aliases: ['zawiya', 'الزاوية', 'zawia', 'az zawiyah'] },
  { id: 'bayda', name: 'البيضاء', aliases: ['bayda', 'البيضاء', 'al bayda'] },
  { id: 'tobruk', name: 'طبرق', aliases: ['tobruk', 'طبرق'] },
  { id: 'derna', name: 'درنة', aliases: ['derna', 'درنة'] },
  { id: 'sirte', name: 'سرت', aliases: ['sirte', 'سرت', 'sirt'] },
  { id: 'gharyan', name: 'غريان', aliases: ['gharyan', 'غريان'] },
]

const aliasToCity = new Map()
LIBYAN_CITIES.forEach((city) => {
  aliasToCity.set(city.name.toLowerCase(), city.name)
  city.aliases.forEach((alias) => aliasToCity.set(alias.toLowerCase(), city.name))
})

export function normalizeCityName(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return ''
  return aliasToCity.get(trimmed.toLowerCase()) ?? trimmed
}

export function formatCityWithFlag(city) {
  const normalized = normalizeCityName(city)
  if (!normalized) return ''
  return `${LIBYA_FLAG} ${normalized}`
}
