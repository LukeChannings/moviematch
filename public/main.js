import { MovieCard } from './MovieCard.js'
import { MovieMatchAPI } from './socket.js'
import { login } from './login.js'
import { Matches } from './Matches.js'
;(async () => {
  const user = await login()

  let api = new MovieMatchAPI(user)
  let matches = new Matches()

  api.addEventListener('match', e => matches.add(e.data))

  let currentMovieCard
  let nextMovieCard
  const rateControls = document.querySelector('.rate-controls')

  rateControls.addEventListener('click', e => {
    if (e.target.classList.contains('rate-thumbs-down')) {
      currentMovieCard.rate(false)
    } else if (e.target.classList.contains('rate-thumbs-up')) {
      currentMovieCard.rate(true)
    }
  })

  for await (let [movie, nextMovie] of api.getMovieListIterable()) {
    if (!currentMovieCard && !nextMovieCard) {
      currentMovieCard = new MovieCard(movie)
      nextMovieCard = new MovieCard(nextMovie)
    } else {
      currentMovieCard = nextMovieCard
      nextMovieCard = new MovieCard(movie)
    }

    const wantsToWatch = await new Promise(resolve => {
      currentMovieCard.addEventListener('response', e => resolve(e.data), {
        once: true,
      })
    })

    api.respond(movie, wantsToWatch)
  }
})()
