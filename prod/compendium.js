const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const startObservingElements = ({ selectors, callback }) => {
    const observer = new MutationObserver((_mutations, obs) => {
        let foundSelectors = [];

        selectors.forEach((selector) => {
            // Use jQuery to select the element
            const element = $(selector);
            if (element.length > 0 && !foundSelectors.includes(selector)) {
                // Element exists and is not already in the found list, mark as found
                foundSelectors.push(selector);

                // Check if all selectors have been found
                if (foundSelectors.length === selectors.length) {
                    // All elements are found, run the callback
                    callback();

                    // Disconnect the observer as its job is done
                    obs.disconnect();
                }
            }
        });
    });

    observer.observe($('body')[0], {
        childList: true,
        subtree: true,
    });
};

const runFn = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('new');

    const compendium = document.querySelector('code#json-compendium')
    const compendiumText = compendium.textContent
    const generalsTab = document.querySelector('#new-design [data-w-tab="Tab 3"]')
    const recommendationsTab = document.querySelector('#new-design [data-w-tab="Tab 2"]')
    const toursTab = document.querySelector('#new-design [data-w-tab="Tab 1"]')
    toursTab.click()

    const truncateString = (str, maxLength) => {
        return str.length <= maxLength ? str : str.slice(0, maxLength - 3) + '...';
    }

    if (compendiumText === '') {
        generalsTab.remove()
        recommendationsTab.remove()
    }

    if (idParam && idParam.includes('true') && compendiumText !== '') {
        const tabSection = document.querySelector('.tabs-content.w-tab-content');

        const compendium = JSON.parse(compendiumText)

        const generalDataArray = compendium.general.map(gen => {
            return {
                iconDetails: gen.iconDetails,
                active: gen.active,
                accordionTitle: gen.title,
                media: gen.media
            }
        })


        const recomDataArray = compendium.recommendations.map((rec) => {
            return {
                iconDetails: rec.iconDetails,
                active: rec.active,
                accordionTitle: rec.title,
                media: rec.media.map(({ active, overview, content, name, phoneNumber, website, mapsUrl, cardImg }) =>
                    ({ active, overview, placeId: content, name, phoneNumber, website, mapsUrl, cardImg })
                )
            }
        })

        // Let's scope this in a block so it wouldn't interfere with other tabs
        const runRecommendations = () => {
            const recomTab = tabSection.querySelector('div#w-tabs-0-data-w-pane-1');
            const recomDropdownWrapper = recomTab.querySelector('.guide-dropdown-list-wrapper.recommendation');
            const recomDropdownTemplate = recomDropdownWrapper.querySelector('.guide-accordion-item.w-dropdown');
            const recomCardWrapperTemplate = recomDropdownTemplate.querySelector('.recommendation-card-wrapper');

            const closeToggle = ({ toggleBody, accordionBody, accordionBtn, clone }) => {
                toggleBody.classList.remove('w--open')
                accordionBody.classList.remove('w--open')
                toggleBody.setAttribute('aria-expanded', 'false')
                accordionBtn.style.transform = 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)'
                clone.style.zIndex = ''
                clone.style.height = '30px'
            }

            const switchAccordionBody = (toggle) => {
                // This function helps avoid multiple opened accordion body
                const accorBodiesNode = recomDropdownWrapper.querySelectorAll('.accordion-toggle.w-dropdown-toggle')
                const accorBodies = Array.from(accorBodiesNode)

                accorBodies.filter(ab => ab.id !== toggle.id).forEach((toggleBody) => {
                    const accorClone = toggleBody.parentNode
                    const accordionBody = accorClone.querySelector('nav.accordion-body.w-dropdown-list')
                    const accordionBtn = accorClone.querySelector('.accordion-btn')

                    closeToggle({ toggleBody, accordionBody, accordionBtn, clone: accorClone })
                })
            }


            recomDropdownTemplate.remove()
            recomCardWrapperTemplate.remove()
            // Iterate over the data array and clone the template for each item
            recomDataArray.filter(rda => rda.active).forEach((data, idx) => {
                // Clone the template
                const recomDropdownClone = recomDropdownTemplate.cloneNode(true);

                const toggle = recomDropdownClone.querySelector('.accordion-toggle.w-dropdown-toggle')
                const accordionBody = recomDropdownClone.querySelector('nav.accordion-body.w-dropdown-list')
                const accordionBtn = recomDropdownClone.querySelector('.accordion-btn')
                // const recomCardWrapperTemplate = recomDropdownClone.querySelector('.recommendation-card-wrapper')
                const cardLayout = recomDropdownClone.querySelector('.recommendation-card-layout')

                const toggleId = `w-dropdown-toggle-${idx + 1}`
                const dropdownId = `w-dropdown-list-${idx + 1}`

                toggle.setAttribute('id', toggleId)
                toggle.setAttribute('aria-controls', dropdownId)
                accordionBody.setAttribute('id', dropdownId)
                accordionBody.setAttribute('aria-labelledby', toggleId)
                accordionBtn.style.transition = '0.5s'

                toggle.addEventListener('click', () => {
                    if (!toggle.classList.contains('w--open')) {
                        toggle.classList.add('w--open')
                        accordionBody.classList.add('w--open')
                        toggle.setAttribute('aria-expanded', 'true')
                        accordionBtn.style.transform = 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(180deg) skew(0deg, 0deg)'
                        recomDropdownClone.style.zIndex = '901'
                        recomDropdownClone.style.height = ''

                        switchAccordionBody(toggle)
                    } else {
                        closeToggle({ toggleBody: toggle, accordionBody, accordionBtn, clone: recomDropdownClone })
                    }


                })

                // Update content with data from the array
                recomDropdownTemplate.setAttribute('data-w-id', generateUUID())
                recomDropdownClone.querySelector('[recom-data="accordion-title"]').textContent = data.accordionTitle;
                recomDropdownClone.querySelector(`[recom-data="media-icon"]`).setAttribute('src', data.iconDetails.url)

                data.media.filter(med => med.active).forEach((medData, medIdx) => {
                    const mediaClone = recomCardWrapperTemplate.cloneNode(true);
                    const writeMedia = (dataAttr, text, attr = 'textContent') => {
                        mediaClone.querySelector(`[recom-data="${dataAttr}"]`)[attr] = text
                    }

                    writeMedia('media-name', medData.name)
                    writeMedia('media-overview', truncateString(medData.overview, 25))
                    writeMedia('media-website', truncateString(medData.website, 25))
                    writeMedia('media-phone-number', medData.phoneNumber)
                    writeMedia('media-maps-url', medData.mapsUrl || '#', 'href')
                    writeMedia('media-maps-url', '_blank', 'target')
                    writeMedia('media-card-img', medData.cardImg || '', 'src')

                    cardLayout.append(mediaClone)
                })

                // // Append the cloned element to the wrapper
                recomDropdownWrapper.append(recomDropdownClone);
            });
        }

        // Let's scope this in a block so it wouldn't interfere with other tabs
        const runGeneral = () => {
            const genTab = tabSection.querySelector('div#w-tabs-0-data-w-pane-2');
            const genDropdownWrapper = genTab.querySelector('.guide-dropdown-list-wrapper.general');
            const genDropdownTemplate = genDropdownWrapper.querySelector('.guide-accordion-item.w-dropdown');

            const closeToggle = ({ toggleBody, accordionBody, accordionBtn, clone }) => {
                toggleBody.classList.remove('w--open')
                accordionBody.classList.remove('w--open')
                toggleBody.setAttribute('aria-expanded', 'false')
                accordionBtn.style.transform = 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)'
                clone.style.zIndex = ''
                clone.style.height = '30px'
            }

            const switchAccordionBody = (toggle) => {
                // This function helps avoid multiple opened accordion body
                const accorBodiesNode = genDropdownWrapper.querySelectorAll('.accordion-toggle.w-dropdown-toggle')
                const accorBodies = Array.from(accorBodiesNode)

                accorBodies.filter(ab => ab.id !== toggle.id).forEach((toggleBody) => {
                    const accorClone = toggleBody.parentNode
                    const accordionBody = accorClone.querySelector('nav.accordion-body.w-dropdown-list')
                    const accordionBtn = accorClone.querySelector('.accordion-btn')

                    closeToggle({ toggleBody, accordionBody, accordionBtn, clone: accorClone })
                })
            }

            genDropdownTemplate.remove()

            // Iterate over the data array and clone the template for each item
            generalDataArray.filter(rda => rda.active).forEach((data, idx) => {
                // Clone the template
                const genDropdownClone = genDropdownTemplate.cloneNode(true);

                const toggle = genDropdownClone.querySelector('.accordion-toggle.w-dropdown-toggle')
                const accordionBody = genDropdownClone.querySelector('nav.accordion-body.w-dropdown-list')
                const accordionBtn = genDropdownClone.querySelector('.accordion-btn')

                const toggleId = `w-dropdown-toggle-${idx + 1}`
                const dropdownId = `w-dropdown-list-${idx + 1}`

                toggle.setAttribute('id', toggleId)
                toggle.setAttribute('aria-controls', dropdownId)
                accordionBody.setAttribute('id', dropdownId)
                accordionBody.setAttribute('aria-labelledby', toggleId)
                accordionBtn.style.transition = '0.5s'

                toggle.addEventListener('click', () => {
                    if (!toggle.classList.contains('w--open')) {
                        toggle.classList.add('w--open')
                        accordionBody.classList.add('w--open')
                        toggle.setAttribute('aria-expanded', 'true')
                        accordionBtn.style.transform = 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(180deg) skew(0deg, 0deg)'
                        genDropdownClone.style.zIndex = '901'
                        genDropdownClone.style.height = ''

                        switchAccordionBody(toggle)
                    } else {
                        closeToggle({ toggleBody: toggle, accordionBody, accordionBtn, clone: genDropdownClone })
                    }


                })

                // Update content with data from the array
                genDropdownTemplate.setAttribute('data-w-id', generateUUID())
                genDropdownClone.querySelector('[gen-data="accordion-title"]').textContent = data.accordionTitle;
                genDropdownClone.querySelector(`[gen-data="media-icon"]`).setAttribute('src', data.iconDetails.url)

                const genMediaTextTemplate = genDropdownClone.querySelector('[gen-data="media-text"]')
                const genMediaLinkTemplate = genDropdownClone.querySelector('[gen-data="media-link"]').parentElement
                const genMediaImageTemplate = genDropdownClone.querySelector('[gen-data="media-img"]').parentElement
                const genMediaVideoTemplate = genDropdownClone.querySelector('[gen-data="media-vid"]').parentElement

                genMediaTextTemplate.remove()
                genMediaLinkTemplate.remove()
                genMediaImageTemplate.remove()
                genMediaVideoTemplate.remove()

                const elementWithType = {
                    text: genMediaTextTemplate,
                    link: genMediaLinkTemplate,
                    img: genMediaImageTemplate,
                    video: genMediaVideoTemplate
                }

                data.media.forEach((medData, medIdx) => {
                    if (!['text', 'link', 'img'].includes(medData.type)) {
                        return // Let's skip first if there are more types than the 3
                    }

                    const mediaClone = elementWithType[medData.type].cloneNode(true);

                    if (medData.type === 'text') {
                        mediaClone.textContent = medData.content
                    }
                    else if (medData.type === 'link') {
                        const link = mediaClone.querySelector('[gen-data="media-link"]')
                        link.setAttribute('href', medData.content)
                        link.setAttribute('target', '_blank')
                    }
                    else if (medData.type === 'img') {
                        const img = mediaClone.querySelector('[gen-data="media-img"]')
                        img.setAttribute('src', medData.content)
                        img.setAttribute('srcset', '')
                    }

                    genDropdownClone.querySelector('.accordion-body-content').append(mediaClone)
                })

                // // Append the cloned element to the wrapper
                genDropdownWrapper.append(genDropdownClone);
            });
        }

        runRecommendations() // Now we run recommendations script
        runGeneral()
    }
}

startObservingElements({
    selectors: [
        'div#w-tabs-0-data-w-pane-1',
        'code#json-compendium'
    ],
    callback: runFn
});
