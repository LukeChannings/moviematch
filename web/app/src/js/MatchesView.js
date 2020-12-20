export class MatchesView {
  constructor(matches = []) {
    this.matches = matches
    this.node = document.querySelector('.js-matches-section')
    this.matchesCountEl = this.node.querySelector('.js-matches-count')
    this.matchesListEl = this.node.querySelector('.js-matches-list')
    this.render()
  }

  add(match) {
    const existingIndex = this.matches.findIndex(
      _ => _.movie.guid === match.movie.guid
    )

    if (existingIndex !== -1) {
      this.matches.splice(existingIndex, 1)
    }

    this.matchesCountEl.animate(
      {
        transform: ['scale(1)', 'scale(1.5)', 'scale(1)'],
      },
      {
        duration: 300,
        easing: 'ease-in-out',
        fill: 'both',
      }
    )

    this.matches.push(match)
    this.render()
  }

  formatList = users => {
    if (users.length < 3) return users.join(' and ')

    const items = [...users]
    const last = items.splice(-1)
    return `${items.join(', ')}, ${
      document.body.dataset.i18nListConjunction
    } ${last}`
  }

  render() {
    this.matchesCountEl.dataset.count = this.matches.length

    this.matches.sort((a, b) => b.users.length - a.users.length)

    this.matchesListEl.innerHTML = this.matches
      .map(
        ({ users, movie }) =>
          `
      <li>
        <a class="card" href="/movie${movie.key}" target="${
            this.node.dataset.targetType
          }">
          <img class="poster" src="${movie.art}" alt="${movie.title} poster" />
          <p>${document.body.dataset.i18nMatchLikersTemplate
            .replace('$USERS', this.formatList(users))
            .replace('$MOVIE', movie.title)}</p>
        </a>
      </li>
    `
      )
      .join('\n')
  }
}
