$(document).ready(() => {

    var partners = document.querySelector('code#partners').textContent.trim()
    partners = partners.split(';').map(val => JSON.parse(val))

    for(var p of partners) {
      var tabHeader = document.querySelector('.tour-guide-heading-wrapper')
      var l = tabHeader.children.length
      const { category, value, url, enabled } = p 
      var newTab = tabHeader.children[0].cloneNode()
      newTab.setAttribute('id',category + '-tab-button')
      newTab.setAttribute('data-w-tab','Tab ' + l)
      newTab.setAttribute('data-tab-name',category)
      newTab.setAttribute('aria-controls','w-tabs-0-data-w-pane-' + l)
      newTab.innerHTML = ""
      console.log(newTab)

      tabHeader.appendChild(newTab)
      console.log(tabHeader.children)
    }

    const runServicesFn = () => {
      console.log('running services function!')
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
