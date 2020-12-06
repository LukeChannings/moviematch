export class Matches {
  constructor() {
    this.matches = []
    this.node = document.querySelector('.js-matches-section')
    this.matchesCountEl = this.node.querySelector('.js-matches-count')
    this.matchesListEl = this.node.querySelector('.js-matches-list')
  }

  add(match) {
    const existingIndex = this.matches.findIndex(
      _ => _.movie.guid === match.movie.guid
    )

    if (existingIndex) {
      this.matches.splice(existingIndex, 1)
    }

    this.matches.push(match)
    this.matches.sort((a, b) => {
      a.users.length - b.users.length
    })
    this.render()
  }

  formatList = users => {
    if (users.length < 3) return users.join(' and ')

    const items = [...users]
    const last = items.splice(-1)
    return `${items.join(', ')}, and ${last}`
  }

  render() {
    this.matchesCountEl.dataset.count = this.matches.length
    this.matchesListEl.innerHTML = this.matches
      .map(
        ({ users, movie }) => `
      <li>
        <div class="card">
          <img src="${movie.art}" alt="${movie.title} poster" />
          <p>${this.formatList(users)} want to watch ${movie.title}</p>
        </div>
      </li>
    `
      )
      .join('\n')
  }
}
