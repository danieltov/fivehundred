// Filter and sort logic for the albums grid page.
// Reads data-* attributes set at build time on each .album-cell.

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('albums-grid')
  const countBadge = document.getElementById('visible-count')
  if (!grid || !countBadge) return

  let activeDecade = 'all'
  let activeSort = 'recent'

  // --- Pill click handlers ---

  function setActivePill(group: NodeListOf<HTMLButtonElement>, clicked: HTMLButtonElement) {
    group.forEach(p => p.classList.remove('active'))
    clicked.classList.add('active')
  }

  document.querySelectorAll<HTMLButtonElement>('.pill[data-decade]').forEach(pill => {
    pill.addEventListener('click', () => {
      activeDecade = pill.dataset.decade ?? 'all'
      setActivePill(document.querySelectorAll<HTMLButtonElement>('.pill[data-decade]'), pill)
      applyFilters()
    })
  })

  document.querySelectorAll<HTMLButtonElement>('.pill[data-sort]').forEach(pill => {
    pill.addEventListener('click', () => {
      activeSort = pill.dataset.sort ?? 'recent'
      setActivePill(document.querySelectorAll<HTMLButtonElement>('.pill[data-sort]'), pill)
      applySort()
      applyFilters()
    })
  })

  // --- Filter logic ---

  function applyFilters() {
    const cells = grid!.querySelectorAll<HTMLElement>('.album-cell')
    let visible = 0

    cells.forEach(cell => {
      const decade = cell.dataset.decade ?? ''
      const decadePass = activeDecade === 'all' || decade === activeDecade

      if (decadePass) {
        cell.removeAttribute('hidden')
        visible++
      } else {
        cell.setAttribute('hidden', '')
      }
    })

    countBadge!.textContent = `${visible} Records`
  }

  // --- Sort logic ---

  function applySort() {
    const cells = Array.from(grid!.querySelectorAll<HTMLElement>('.album-cell'))

    cells.sort((a, b) => {
      if (activeSort === 'artist') {
        return (a.dataset.artist ?? '').localeCompare(b.dataset.artist ?? '')
      }
      if (activeSort === 'title') {
        return (a.dataset.title ?? '').localeCompare(b.dataset.title ?? '')
      }
      if (activeSort === 'year') {
        return parseInt(a.dataset.year ?? '0') - parseInt(b.dataset.year ?? '0')
      }
      // recent: newest createdAt first; missing createdAt sorts to end
      const tsA = a.dataset.created ? new Date(a.dataset.created).getTime() : 0
      const tsB = b.dataset.created ? new Date(b.dataset.created).getTime() : 0
      return tsB - tsA
    })

    cells.forEach(cell => grid!.appendChild(cell))
  }

  // Initialize
  applySort()
  applyFilters()
})
