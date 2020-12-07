import { MovieCard } from './MovieCard.js'
import { MovieMatchAPI } from './socket.js'
import { login } from './login.js'
import { Matches } from './Matches.js'
;(async () => {
  const CARD_STACK_SIZE = 4
  const user = await login()

  let api = new MovieMatchAPI(user)
  let matches = new Matches()

  api.addEventListener('match', e => matches.add(e.data))

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

    document
      .querySelector('.js-card-list :first-child')
      .dispatchEvent(new MessageEvent('rate', { data: wantsToWatch }))
  })

  const cardStackEventTarget = new EventTarget()

  // here we're iterating an infinite (well, based on the size of your collection)
  // list of movies. The first CARD_STACK_SIZE cards will be rendered directly,
  // but for every card rendered after that we need a card to be dismissed.
  for await (let [movie, i] of api.getMovieListIterable()) {
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
    }

    new MovieCard(movie, cardStackEventTarget)
  }
})()
