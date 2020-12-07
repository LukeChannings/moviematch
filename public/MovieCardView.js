const cardList = document.querySelector('.js-card-list')

export class MovieCard {
  constructor(movieData, eventTarget) {
    this.movieData = movieData
    this.eventTarget = eventTarget
    this.render()
  }

  render() {
    const node = document.createElement('div')
    this.node = node
    node.classList.add('card')
    node.addEventListener('pointerdown', e => this.handleSwipe(e))
    node.addEventListener('touchstart', e => e.preventDefault())
    node.addEventListener('rate', e => this.rate(e.data, true))

    const { title, art, year, guid } = this.movieData
    node.dataset.guid = guid
    node.innerHTML = `
      <img src="${art}" alt="${title} poster" />
      <p>${title} (${year})</p>
    `
    cardList.appendChild(node)
  }

  async rate(wantsToWatch, animateOut = false) {
    if (animateOut) {
      await new Promise(resolve => {
        const animation = this.getAnimation(
          wantsToWatch ? 'right' : 'left',
          150
        )
        animation.onfinish = resolve
      })
    }

    this.eventTarget.dispatchEvent(
      new MessageEvent('response', {
        data: {
          guid: this.movieData.guid,
          wantsToWatch,
        },
      })
    )
    this.destroy()
  }

  handleSwipe(startEvent) {
    if (startEvent.target instanceof HTMLButtonElement) {
      return
    }
    startEvent.preventDefault()
    this.node.setPointerCapture(startEvent.pointerId)
    const maxX = window.innerWidth
    const animationDuration = 500

    let animation
    let currentDirection
    let position = 0

    const handleMove = e => {
      const direction = e.x < startEvent.x ? 'left' : 'right'
      const delta = e.x - startEvent.x
      position =
        direction === 'left'
          ? Math.abs(delta) / startEvent.x
          : delta / (maxX - startEvent.x)

      if (currentDirection != direction) {
        currentDirection = direction
        if (animation) {
          animation.cancel()
        }
        animation = this.getAnimation(direction, animationDuration)

        animation.pause()
      }
      animation.currentTime = position * animationDuration
    }
    this.node.addEventListener('pointermove', handleMove, { passive: true })
    this.node.addEventListener(
      'lostpointercapture',
      async () => {
        this.node.removeEventListener('pointermove', handleMove)
        if (animation) {
          if (position >= 0.5) {
            animation.play()
            await this.rate(currentDirection === 'right')
          } else {
            animation.reverse()
          }
        }
      },
      { once: true }
    )
  }

  getAnimation(direction, animationDuration) {
    return this.node.animate(
      {
        transform: [
          'translate(0, 0) rotate(0deg)',
          `translate(${direction === 'left' ? '-50vw' : '50vw'}, 5rem) rotate(${
            direction === 'left' ? '-10deg' : '10deg'
          })`,
        ],
        opacity: ['1', '0'],
      },
      {
        duration: animationDuration,
        easing: 'ease-in-out',
        fill: 'both',
      }
    )
  }

  destroy() {
    this.node.remove()
  }
}
