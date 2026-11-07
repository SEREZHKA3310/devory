;(() => {
  const chart = document.querySelector('.revenue-chart')
  const tip = chart.querySelector('.revenue-chart__tip')
  const rows = [...document.querySelectorAll('.revenue-table__row')].map((r) => [
    r.cells[0].textContent,
    +r.cells[1].textContent.replace(/\D/g, ''),
  ])
  const step = 20000
  const max = Math.max(...rows.map((r) => r[1]))
  const scaleMax = Math.ceil(max / step) * step

  const plot = document.createElement('div')
  plot.className = 'revenue-chart__plot'
  for (let v = 0; v <= scaleMax; v += step) {
    plot.insertAdjacentHTML(
      'beforeend',
      `<div class="revenue-chart__line" style="bottom:${(v / scaleMax) * 100}%">
         <span class="revenue-chart__tick">${v / 1000}к</span>
       </div>`
    )
  }
  const cols = document.createElement('div')
  cols.className = 'revenue-chart__cols'
  plot.append(cols)
  chart.prepend(plot)

  const bars = rows.map(([date, sum], i) => {
    const col = document.createElement('div')
    col.className = 'revenue-chart__col' + (sum === max ? ' revenue-chart__col--top' : '')
    col.innerHTML = `
      <i class="revenue-chart__bar"><b class="revenue-chart__value">${sum / 1000}к</b></i>
      <span class="revenue-chart__label">${date.slice(0, 3)}</span>`
    const bar = col.querySelector('.revenue-chart__bar')
    bar.style.transitionDelay = i * 90 + 'ms'
    col.onmouseenter = () => {
      tip.textContent = `${date}: ${sum.toLocaleString('ru')} ₽`
      tip.style.left = plot.offsetLeft + col.offsetLeft + col.offsetWidth / 2 + 'px'
      tip.hidden = false
    }
    col.onmouseleave = () => (tip.hidden = true)
    cols.append(col)
    return [bar, (sum / scaleMax) * 100]
  })

  const grow = () => {
    chart.classList.add('is-visible')
    bars.forEach(([bar, pct]) => (bar.style.height = pct + '%'))
  }
  new IntersectionObserver(
    ([entry], observer) => {
      if (entry.isIntersecting) {
        grow()
        observer.disconnect()
      }
    },
    { threshold: 0.4 }
  ).observe(chart)
})()
