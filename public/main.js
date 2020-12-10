import { MovieMatchAPI } from './MovieMatchAPI.js'
import { CardView } from './CardView.js'
import { MatchesView } from './MatchesView.js'

const main = async () => {
  const CARD_STACK_SIZE = 4

  let api = new MovieMatchAPI()

  const { matches } = await login(api)

  let matchesView = new MatchesView(matches)
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

export const login = async api => {
  const loginSection = document.querySelector('.login-section')
  const loginForm = document.querySelector('.js-login-form')
  const generateRoomCodeButton = document.querySelector(
    '.js-generate-room-code'
  )
  const roomCodeLine = document.querySelector('.js-room-code-line')

  let user = localStorage.getItem('user')
  let roomCode = localStorage.getItem('roomCode')

  if (user) {
    loginForm.elements.name.value = user
  }

  if (roomCode) {
    loginForm.elements.roomCode.value = roomCode
  }

  generateRoomCodeButton.addEventListener('click', () => {
    const charMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const roomCode = Array.from({ length: 4 })
      .map(_ => charMap[Math.floor(Math.random() * charMap.length)])
      .join('')
    loginForm.elements.roomCode.value = roomCode
  })

  return new Promise(resolve => {
    const handleSubmit = async e => {
      e.preventDefault()
      const formData = new FormData(loginForm)
      const name = formData.get('name')
      const roomCode = formData.get('roomCode')
      if (name && roomCode) {
        try {
          const data = await api.login(name, roomCode)
          loginForm.removeEventListener('submit', handleSubmit)

          await loginSection.animate(
            {
              opacity: ['1', '0'],
            },
            {
              duration: 250,
              easing: 'ease-in-out',
              fill: 'both',
            }
          ).finished

          loginSection.hidden = true
          localStorage.setItem('user', name)
          localStorage.setItem('roomCode', roomCode)

          roomCodeLine.dataset.roomCode = roomCode

          document.body.scrollIntoView()

          await Promise.all(
            [
              ...document.querySelectorAll('.rate-section, .matches-section'),
            ].map(node => {
              node.hidden = false
              return node.animate(
                {
                  opacity: ['0', '1'],
                },
                {
                  duration: 250,
                  easing: 'ease-in-out',
                  fill: 'both',
                }
              ).finished
            })
          )

          resolve({ ...data, user: name })
        } catch (err) {
          alert(err.message)
        }
      }
    }

    loginForm.addEventListener('submit', handleSubmit)
  })
}

main().catch(err => console.error(err))
