export class URLParams {
  public static stringify(json: Record<string, any>) {
    try {
      const search = new URLSearchParams()
      Object.entries(json).forEach(([key, value]) => {
        if (!value) return
        if (typeof value === 'object' && value !== null) {
          search.set(key, JSON.stringify(value))
        } else {
          search.set(key, value)
        }
      })

      return search.toString()
    } catch (e) {
      return ''
    }
  }

  public static parse(search: string) {
    const _search = new URLSearchParams(search)
    try {
      return Array.from(_search.entries()).reduce(
        (map: Record<string, any>, [key, value]) => {
          return {
            ...map,
            [key]: parseValue(value),
          }
        },
        Object.create(null),
      )
    } catch (e) {
      return {}
    }
  }
}

function parseValue(value: string) {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

export const toUrlString = (json: object | Array<any>) =>
  encodeURIComponent(JSON.stringify(json))
export const fromUrlString = (urlString: string) => {
  try {
    return JSON.parse(decodeURIComponent(urlString))
  } catch (e) {
    return {}
  }
}
export const toSearch = (json: object) =>
  Object.entries(json)
    .reduce((arr: string[], [key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return [...arr, [key, toUrlString(value)].join('=')]
      }
      return [...arr, [key, value].join('=')]
    }, [])
    .join('&')

export function ensureUrlDecoded(url: string) {
  const raw_url = url
  // 解码后不变，说明没有编码
  if (decodeURIComponent(url) === raw_url) return encodeURIComponent(raw_url)
  return raw_url
}
