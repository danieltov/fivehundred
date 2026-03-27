// Filter and sort logic for the albums grid page.
// Reads data-* attributes set at build time on each .album-cell.

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('albums-grid')
  const countBadge = document.getElementById('visible-count')
  if (!grid || !countBadge) return

  let activeType = 'all'
  let activeDecade = 'all'
  let activeSort = 'default'

  // --- Pill click handlers ---

  function setActivePill(group: NodeListOf<HTMLButtonElement>, clicked: HTMLButtonElement) {
    group.forEach(p => p.classList.remove('active'))
    clicked.classList.add('active')
  }

  document.querySelectorAll<HTMLButtonElement>('.pill[data-type]').forEach(pill => {
    pill.addEventListener('click', () => {
      activeType = pill.dataset.type ?? 'all'
      setActivePill(document.querySelectorAll<HTMLButtonElement>('.pill[data-type]'), pill)
      applyFilters()
    })
  })

  document.querySelectorAll<HTMLButtonElement>('.pill[data-decade]').forEach(pill => {
    pill.addEventListener('click', () => {
      activeDecade = pill.dataset.decade ?? 'all'
      setActivePill(document.querySelectorAll<HTMLButtonElement>('.pill[data-decade]'), pill)
      applyFilters()
    })
  })

  document.querySelectorAll<HTMLButtonElement>('.pill[data-sort]').forEach(pill => {
    pill.addEventListener('click', () => {
      activeSort = pill.dataset.sort ?? 'default'
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
      const isAplus = cell.dataset.aplus === 'true'
      const isTop50 = cell.dataset.top50 === 'true'
      const decade = cell.dataset.decade ?? ''

      const typePass =
        activeType === 'all' ||
        (activeType === 'a-plus' && isAplus) ||
        (activeType === 'top50' && isTop50)

      const decadePass = activeDecade === 'all' || decade === activeDecade

      if (typePass && decadePass) {
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
      // default: by rank (ranked first, then unranked)
      const rankA = a.dataset.rank ? parseInt(a.dataset.rank) : Infinity
      const rankB = b.dataset.rank ? parseInt(b.dataset.rank) : Infinity
      return rankA - rankB
    })

    cells.forEach(cell => grid!.appendChild(cell))
  }

  // Initialize sort
  applySort()
})
