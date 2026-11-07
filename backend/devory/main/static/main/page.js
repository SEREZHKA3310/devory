;(() => {
  'use strict'
  const services = {
    product: {
      category: 'Разработка продуктов',
      name: 'От первого сценария\nдо рабочего сервиса.',
      description:
        'Проектируем и разрабатываем сайты, личные кабинеты, веб-сервисы и мобильные приложения.',
      tags: ['Веб-продукты', 'Мобильные приложения', 'UX/UI'],
    },
    connect: {
      category: 'Автоматизация и интеграции',
      name: 'Передача данных\nпо правилам процесса.',
      description:
        'Организуем обмен данными между CRM, учётными системами и другими сервисами. Автоматизируем повторяющиеся действия.',
      tags: ['Интеграции', 'CRM', 'Бизнес-процессы'],
    },
    grow: {
      category: 'Продвижение и рост',
      name: 'Помогаем продукту\nнаходить клиентов.',
      description:
        'Готовим посадочные страницы, аналитику и пользовательские сценарии для привлечения клиентов и работы с заявками.',
      tags: ['Посадочные страницы', 'Аналитика', 'Конверсия'],
    },
    support: {
      category: 'Поддержка и инфраструктура',
      name: 'Запуск — это\nначало работы.',
      description:
        'Согласуем мониторинг, обновления и обработку обращений. Развиваем продукт вместе с задачами бизнеса.',
      tags: ['Мониторинг', 'Обновления', 'Развитие'],
    },
  }
  const write = (id, value) => {
    document.getElementById(id).textContent = value
  }
  function setupTabs(selector, change, orientation) {
    const tabs = Array.from(document.querySelectorAll(selector))
    function activate(tab) {
      tabs.forEach((item) => {
        item.setAttribute('aria-selected', String(item === tab))
        item.tabIndex = item === tab ? 0 : -1
      })
      change(tab)
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab))
      tab.addEventListener('keydown', (event) => {
        let next = index
        if (event.key === (orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'))
          next = (index + 1) % tabs.length
        else if (event.key === (orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'))
          next = (index + tabs.length - 1) % tabs.length
        else if (event.key === 'Home') next = 0
        else if (event.key === 'End') next = tabs.length - 1
        else return
        event.preventDefault()
        activate(tabs[next])
        tabs[next].focus()
      })
    })
  }
  setupTabs(
    '[data-service]',
    (tab) => {
      const key = tab.dataset.service,
        data = services[key]
      write('service-category', data.category)
      write('service-name', data.name)
      write('service-description', data.description)
      const tags = document.getElementById('service-tags')
      tags.replaceChildren(
        ...data.tags.map((text) => {
          const span = document.createElement('span')
          span.textContent = text
          return span
        })
      )
      document.querySelector('.desk-view').dataset.activeService = key
      document.getElementById('service-panel').setAttribute('aria-labelledby', tab.id)
      const details = document.getElementById('service-details')
      if (details)
        details.href =
          '/' +
          {
            product: 'development',
            connect: 'automation',
            grow: 'growth',
            support: 'support',
          }[key] +
          '/'
    },
    'vertical'
  )
})()
