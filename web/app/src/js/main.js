import { MovieMatchAPI } from './MovieMatchAPI.js'
import { CardView } from './CardView.js'
import { MatchesView } from './MatchesView.js'
import { LoginView } from './LoginView.js'

const main = async () => {
  const CARD_STACK_SIZE = 4

  const api = new MovieMatchAPI()
  const loginView = new LoginView(api)

  const { matches } = await loginView.waitForLogin()

  const matchesView = new MatchesView(matches)
  let topCardEl

  api.addEventListener('match', e => matchesView.add(e.data))

  const rateControls = document.querySelector('.rate-controls')

  rateControls.addEventListener('click', e => {
    let wantsToWatch
    if (e.target.classList.contains('rate-thumbs-down')) {
      wantsToWatch = false
    } else if (e.target.classList.contains('rate-thumbs-up')) {
      wantsToWatch = true
    } else {
      return
    }

    if (topCardEl) {
      topCardEl.dispatchEvent(new MessageEvent('rate', { data: wantsToWatch }))
    }
  })

  document.addEventListener('keydown', e => {
    const wantsToWatch =
      e.key === 'ArrowLeft' ? false : e.key === 'ArrowRight' ? true : null
    if (wantsToWatch === null) {
      return
    }
    if (topCardEl) {
      topCardEl.dispatchEvent(new MessageEvent('rate', { data: wantsToWatch }))
    }
  })

  const cardStackEventTarget = new EventTarget()

  cardStackEventTarget.addEventListener('newTopCard', () => {
    topCardEl = topCardEl.nextSibling

    if (!topCardEl) {
      document
        .querySelector('.js-card-stack')
        ?.style.setProperty('--empty-text', `var(--i18n-exhausted-cards)`)

      rateControls.setAttribute('disabled', '')
    }
  })

  for await (let [movie, i] of api) {
    if (i > CARD_STACK_SIZE) {
      const response = await new Promise(resolve => {
        cardStackEventTarget.addEventListener(
          'response',
          e => {
            resolve(e.data)
          },
          {
            once: true,
          }
        )
      })
      api.respond(response)
    } else if (i === CARD_STACK_SIZE) {
      topCardEl = document.querySelector('.js-card-stack > :first-child')
    }

    new CardView(movie, cardStackEventTarget)
  }
}

main().catch(err => console.error(err))
