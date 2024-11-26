$(document).ready(() => {

    const setAttributes = (el, attrs) => {  
      Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value))
    }

    var partners = document.querySelector('code#partners').textContent.trim()
    partners = partners.split(';').map(val => JSON.parse(val))

    for(var p of partners) {
      var tabHeader = document.querySelector('.tour-guide-heading-wrapper')
      var l = tabHeader.children.length
      const { category, value, url, enabled } = p 
      var oldTab = tabHeader.children[0]
      var newTab = document.createElement('a')  
      var tabTitle = document.createElement('div')

      setAttributes(newTab, {
        id: category + '-tab-button', 'data-w-tab': 'Tab ' + (l + 1), 'aria-controls': 'w-tabs-0-data-w-pane-' + l,
        class: 'guide-tab-link-toggle w-inline-block w-tab-link',
        'data-id': oldTab['data-id'], role: 'tab', 'aria-selected': false, tabIndex: -1, href: '#w-tabs-0-data-w-pane-' + l
      })

      setAttributes(tabTitle, {
        id: category + '-tab', 'data-id': oldTab['data-id'],
        class: 'heading-20sb', style: 'font-family: Roboto, Quicksand, sans-serif;'
      })

      tabTitle.innerHTML = category

      newTab.appendChild(tabTitle)
      tabHeader.appendChild(newTab)
      
      console.log(tabHeader.children)
    }

    const runServicesFn = () => {
      const tabContent = document.querySelector('.tabs-content')
      var l = tabContent.children.length

      var tabInner = `
        <div data-w-tab=${'Tab ' + (l + 1)} data-tab-name="services" class="guide-tab-pane-wrapper w-tab-pane" 
        id=${"w-tabs-0-data-w-pane-" + l} role="tabpanel" aria-labelledby="services-tab-button" 
        style="transition: all, opacity 300ms; opacity: 1;">
          <div class="guide-experiences-wrapper>

          </div>
        </div>
      `

      tabContent.innerHTML = tabContent.innerHTML + tabInner

    }

    const startObservingElements = ({ selectors, callback }) => {
        const observer = new MutationObserver((_mutations, obs) => {
            let foundSelectors = []

            selectors.forEach((selector) => {
                // Use jQuery to select the element
                const element = $(selector)
                if (element.length > 0 && !foundSelectors.includes(selector)) {
                    // Element exists and is not already in the found list, mark as found
                    foundSelectors.push(selector)

                    // Check if all selectors have been found
                    if (foundSelectors.length === selectors.length) {
                        // All elements are found, run the callback
                        callback()

                        // Disconnect the observer as its job is done
                        obs.disconnect()
                    }
                }
            })
        })

        observer.observe($('body')[0], {
            childList: true,
            subtree: true,
        })
    }

    startObservingElements({
        selectors: [
            'code#partners',
        ],
        callback: runServicesFn,
    })
})
