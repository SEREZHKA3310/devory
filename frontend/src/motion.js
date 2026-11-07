;(() => {
  'use strict'
  const scene = document.querySelector('.scene')
  const rig = document.querySelector('.d-rig')
  const hero = document.querySelector('.hero')
  const replay = document.querySelector('.replay')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const pointer = matchMedia('(hover: hover) and (pointer: fine)')
  let frame = 0,
    x = 0,
    y = 0,
    inView = true
  const reset = () => {
    ;['--dx', '--dy', '--rx', '--ry'].forEach((name) => rig.style.removeProperty(name))
  }
  const draw = () => {
    frame = 0
    if (reduced.matches || !inView || document.hidden || document.body.classList.contains('paused'))
      return
    rig.style.setProperty('--dx', `${x * 8}px`)
    rig.style.setProperty('--dy', `${y * 5 - Math.min(scrollY * 0.035, 16)}px`)
    rig.style.setProperty('--rx', `${-y * 1.3}deg`)
    rig.style.setProperty('--ry', `${x * 2.2}deg`)
  }
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(draw)
  }
  hero.addEventListener(
    'pointermove',
    (e) => {
      if (!pointer.matches || e.pointerType === 'touch' || reduced.matches) return
      const rect = hero.getBoundingClientRect()
      x = (e.clientX - rect.left) / rect.width - 0.5
      y = (e.clientY - rect.top) / rect.height - 0.5
      schedule()
    },
    { passive: true }
  )
  hero.addEventListener('pointerleave', () => {
    x = y = 0
    schedule()
  })
  addEventListener('scroll', schedule, { passive: true })
  function visibility() {
    document.body.classList.toggle('motion-hidden', document.hidden || !inView)
    if (document.hidden || !inView) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }
  document.addEventListener('visibilitychange', visibility)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        inView = entries[0].isIntersecting
        visibility()
      },
      { threshold: 0 }
    ).observe(hero)
  }
  reduced.addEventListener('change', reset)
  replay.addEventListener('click', () => {
    if (reduced.matches) return
    document.body.classList.remove('paused')
    const toggle = document.querySelector('.motion-toggle')
    toggle.setAttribute('aria-pressed', 'false')
    toggle.textContent = 'Остановить анимацию'
    toggle.dispatchEvent(new Event('motion-resume'))
    reset()
    scene.getAnimations({ subtree: true }).forEach((animation) => {
      animation.currentTime = 0
      animation.play()
    })
  })
})()
