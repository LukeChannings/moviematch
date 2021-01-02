interface PreloadMedia {
  type: 'image';
  href: string;
}

interface PreloadMediaSrcset {
  type: 'image';
  srcSet: string[];
}

export const preload = (preload: PreloadMedia | PreloadMediaSrcset) => {
  const link = document.createElement('link')
  link.rel = 'preload'

  if (preload.type === 'image') {
    if ('srcSet' in preload) {
      for (const src of preload.srcSet) {
        const [href, mediaQuery] = src.split(' ')
        if (mediaQuery.endsWith('x')) {
          
        }
      }
    } else {
      link.href = preload.href
    }
  }
  link.href = url
  `<link rel="preload" href="bg-image-narrow.png" as="image" media="(max-width: 600px)">`
}