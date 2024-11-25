$(document).ready(() => {

    const partners = document.querySelector('code#partners').textContent.trim()
    partners = partners.split(';').map(val => JSON.parse(val))

    for(var p of partners) {
      var tabHeader = document.querySelector('.tour-guide-heading-wrapper')
      var l = tabHeader.children.length
      const { category, value, url, enabled } = p 
      var newTab = <a data-w-tab={"Tab " + length} 
          id={category + "-tab-button"} data-tab-name={category} data-id="TwKKMUMRxmfUALna92SMXkn77cH2" 
          class="guide-tab-link-toggle w-inline-block w-tab-link" role="tab" 
          aria-controls={"w-tabs-0-data-w-pane-" + length} aria-selected="false" tabindex="-1">
        <div id="services-tab" data-id="TwKKMUMRxmfUALna92SMXkn77cH2" 
              class="heading-20sb" style="font-family: Roboto, Quicksand, sans-serif;">
          {category}
        </div >
      </a>

      tabHeader.appendChild(newTab)
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
