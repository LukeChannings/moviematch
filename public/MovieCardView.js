const cardList = document.querySelector('.js-card-list')

export class MovieCardView {
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
      <img class="poster" src="${art}" alt="${title} poster" />
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
    if (
      (startEvent.pointerType === 'button' && startEvent.button !== 1) ||
      startEvent.target instanceof HTMLButtonElement
    ) {
      return
    }

    startEvent.preventDefault()
    this.node.setPointerCapture(startEvent.pointerId)
    const maxX = window.innerWidth
    const animationDuration = 500

    let currentDirection
    let position = 0
    this.animationFrameRequestId = requestAnimationFrame(() =>
      this.animationLoop()
    )

    const handleMove = e => {
      const direction = e.x < startEvent.x ? 'left' : 'right'
      const delta = e.x - startEvent.x
      position =
        direction === 'left'
          ? Math.abs(delta) / startEvent.x
          : delta / (maxX - startEvent.x)

      if (this.currentDirection != direction) {
        this.currentDirection = direction
        if (this.animation) {
          this.animation.cancel()
        }
        this.animation = this.getAnimation(direction, animationDuration)

        this.animation.pause()
      }
      this.currentTime = position * animationDuration
    }
    this.node.addEventListener('pointermove', handleMove, { passive: true })
    this.node.addEventListener(
      'lostpointercapture',
      async () => {
        this.node.removeEventListener('pointermove', handleMove)
        cancelAnimationFrame(this.animationFrameRequestId)
        if (this.animation) {
          if (position >= 0.5) {
            this.animation.play()
            await this.rate(currentDirection === 'right')
          } else {
            this.animation.reverse()
          }
        }
      },
      { once: true }
    )
  }

  animationLoop() {
    if (this.animation) {
      this.animation.currentTime = this.currentTime
    }
    this.animationFrameRequestId = requestAnimationFrame(() =>
      this.animationLoop()
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
