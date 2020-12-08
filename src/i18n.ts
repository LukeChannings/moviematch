const translations: Map<string, Record<string, string>> = new Map()

export const getTranslationPaths = async () => {
  let translationPaths: string[] = []
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

export const translateHTML = async (
  html: Uint8Array,
  lang: string | false | string[]
): Promise<string> => {
  if (translations.size === 0) {
    try {
      await populateTranslations()
    } catch (err) {
      console.error('Encountered an error reading translation files', err)
    }
  }

  let language = !lang ? 'en' : Array.isArray(lang) ? lang[0] : lang
  let tr: Record<string, string>

  if (translations.has(language)) {
    tr = translations.get(language)!
  } else {
    tr = translations.get('en')!
  }

  const decoder = new TextDecoder()
  const htmlText = decoder.decode(html)

  const interpolatedHtml = interpolate(htmlText, tr)

  return interpolatedHtml
}
