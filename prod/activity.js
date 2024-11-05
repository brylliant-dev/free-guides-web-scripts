$(document).ready(() => {
    const runActFn = () => {
        /**
     * Sample data:
     *    {
        *    "region":"REGION",
        *    "enabled":false,
        *    "campaign":"CAMPAIGN",
        *    "url":"https://www.getyourguide.com/-xxxxx"
     *    }
    */
        const activityEnabled = document.querySelector('code#activityenabled')
        const activityRegion = document.querySelector('code#activityregion')
        const activityCampaign = document.querySelector('code#activitycampaign')
        const activityUrl = document.querySelector('code#activityurl')

        const actDetailsJson = {
            region: activityRegion.textContent.trim(),
            enabled: activityEnabled.textContent.trim() === 'true',
            campaign: activityCampaign.textContent.trim(),
            url: activityUrl.textContent.trim()
        }

        const urlKeywords = ["experienceoz", "getyourguide"];

        if (!actDetailsJson.enabled || actDetailsJson.url === '') {
            return
        }

        const containsKeyword = (url) => {
            const foundUrl = urlKeywords.find(keyword => url.includes(keyword));

            return foundUrl ?? "experienceoz"
        }

        const activitiesBtn = document.querySelector('.tour-guide-heading-wrapper #activity-tab').parentElement;

        const activityKeyword = containsKeyword(actDetailsJson.url)

        const runGyg = () => {
            const activityTab = document.querySelector('div#w-tabs-0-data-w-pane-3')
            const tabBodyWrapper = activityTab.querySelector('.guide-experiences-wrapper')
            const widgetFrame = 'https://widget.getyourguide.com/default/activities.frame'

            const widgetSnippet = `<div data-gyg-href="${widgetFrame}" href="${actDetailsJson.url}" data-gyg-locale-code="en-US" data-gyg-widget="activities" style="width: 100%;" data-gyg-number-of-items="12" data-gyg-cmp="${actDetailsJson.campaign}" data-gyg-partner-id="KSIQTMD" data-gyg-q="${actDetailsJson.region}">
                <span>
                    Powered by <a target="_blank" rel="sponsored" href="${actDetailsJson.url}" ">GetYourGuide</a>
                </span>
            </div>`

            tabBodyWrapper.style.height = 'auto'
            tabBodyWrapper.innerHTML = widgetSnippet
        }

        const runExpOz = () => {
            if (window.innerWidth >= 992) {
                // Desktop logic
                activitiesBtn.addEventListener('mouseover', () => {
                    setTimeout(() => {
                        activitiesBtn.href = '';
                        activitiesBtn.setAttribute('data-w-tab', '');
                    }, 100);
                });

                activitiesBtn.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent the default behavior
                    window.open(actDetailsJson.url, '_blank'); // Replace with actual dynamic URL from Webflow
                });

            } else {
                // Mobile logic
                activitiesBtn.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent the default behavior
                    activitiesBtn.href = '';
                    activitiesBtn.setAttribute('data-w-tab', '');
                    setTimeout(() => {
                        window.open(actDetailsJson.url, '_blank');
                    }, 100);
                });
            }
        }

        if (activityKeyword) {
            const functionItems = {
                experienceoz: runExpOz,
                getyourguide: runGyg
            }

            if (activitiesBtn && urlKeywords.includes(activityKeyword) && actDetailsJson.url !== '') {
                functionItems[activityKeyword]()
            }
        } else {
            if(activitiesBtn && actDetailsJson.url !== "") {
                runExpOz()
            }
        }
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
            'div#w-tabs-0-data-w-pane-3',
            'code#activityenabled',
            'code#activitycampaign',
            'code#activityregion',
            'code#activityurl',
        ],
        callback: runActFn,
    })
})
