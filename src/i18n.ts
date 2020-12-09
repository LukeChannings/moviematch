import { Accepts } from 'https://deno.land/x/accepts@2.1.0/mod.ts'
import { LINK_TYPE } from './config.ts'

const translations: Map<string, Record<string, string>> = new Map()

export const getTranslationPaths = async () => {
  const translationPaths: string[] = []
  for await (const entry of await Deno.readDir(Deno.cwd() + '/i18n')) {
    if (entry.isFile && entry.name.endsWith('.json')) {
      translationPaths.push(Deno.cwd() + '/i18n/' + entry.name)
    }
  }
  return translationPaths
}

const populateTranslations = async () => {
  const translationPaths = await getTranslationPaths()
  for (const translationPath of translationPaths) {
    const translation = await Deno.readTextFile(translationPath).then(text =>
      JSON.parse(text)
    )
    if (typeof translation.LANG === 'string') {
      translations.set(translation.LANG, translation)
    }
  }
}

const interpolate = (text: string, context: Record<string, string>) => {
  let interpolatedText = text
  for (const [, match, name] of text.matchAll(/(\$\{([a-z0-9_]+)\})/gi)) {
    interpolatedText = interpolatedText.replace(match, context[name])
  }
  return interpolatedText
}

export const getLinkTypeForRequest = (headers: Headers): 'app' | 'http' => {
  const ua = headers.get('user-agent')!

  // I tried the deep link on Android but it didn't work...
  if (/(iPhone|iPad)/.test(ua) && LINK_TYPE === 'app') {
    return 'app'
  }

  return 'http'
}

export const translateHTML = async (
  html: Uint8Array,
  headers: Headers
): Promise<string> => {
  if (translations.size === 0) {
    try {
      await populateTranslations()
    } catch (err) {
      console.error('Encountered an error reading translation files', err)
    }
  }

  const accept = new Accepts(headers)
  const acceptedLanguage = accept.languages([...translations.keys()])

  const language = !acceptedLanguage
    ? 'en'
    : Array.isArray(acceptedLanguage)
    ? acceptedLanguage[0]
    : acceptedLanguage

  const translationContext: Record<string, string> = translations.has(language)
    ? translations.get(language)!
    : translations.get('en')!

  const decoder = new TextDecoder()
  const htmlText = decoder.decode(html)

  const context = {
    ...translationContext,
    CONFIG_MATCHES_TARGET_TYPE:
      getLinkTypeForRequest(headers) === 'app' ? '_self' : '_blank',
  }

  const interpolatedHtml = interpolate(htmlText, context)

  return interpolatedHtml
}
