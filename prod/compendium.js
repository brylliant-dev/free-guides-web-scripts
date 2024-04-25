const generateUUID = () => {
    // We're gonna need this for `data-w-id`
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// We'll use this function to wait for certain query selectors before we run a callback
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
}

const truncateString = (str, maxLength) => {
    return str.length <= maxLength ? str : str.slice(0, maxLength - 3) + '...';
}

const runFn = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('new');
    const isNew = idParam && idParam.includes('true')
    // Check if the URL has `new=true` parameter

    const compendium = document.querySelector('code#json-compendium')
    const compendiumText = compendium.textContent

    const ctaDetails = document.querySelector('code#json-cta')
    const ctaDetailsText = ctaDetails.textContent

    const newDesign = document.querySelector('#new-design')
    const allTabs = [1, 2, 3]
        .map(dwt => newDesign
            .querySelector(`[data-w-tab="Tab ${dwt}"]`))

    const [toursTab, recommendationsTab, generalsTab] = allTabs

    // Add hover effect and set tab to active
    allTabs.map(at =>
        Object.entries({ add: 'mouseenter', remove: 'mouseleave' }).forEach(([action, event]) => {
            at.addEventListener(event, () => {
                at.getAttribute('aria-selected') !== 'true' &&
                    at.classList[action]('w--current')
            })
        })
    )

    const removeCtaWrapper = () => {
        newDesign.querySelector('.guide-cta-wrapper').remove()
    }
    toursTab.click()

    const runTabFunctions = () => {
        const tabSection = document.querySelector('.tabs-content.w-tab-content');
        const compendium = JSON.parse(compendiumText)

        const generalDataArray = compendium.general.map(({ iconDetails, active, title, media }) =>
            ({ iconDetails, active, accordionTitle: title, media })
        )

        const recomDataArray = compendium.recommendations.map(({ iconDetails, active, title, media }) =>
        ({
            iconDetails,
            active,
            accordionTitle: title,
            media: media.map(({ current_opening_hours, active, overview, content, name, phoneNumber, website, mapsUrl, cardImg }) =>
                ({ opening_hours: current_opening_hours, active, overview, placeId: content, name, phoneNumber, website, mapsUrl, cardImg })
            )
        })
        )

        const tabsGenericFn = () => {
            const closeToggle = ({ toggleBody, accordionBody, accordionBtn, clone }) => {
                toggleBody.classList.remove('w--open')
                accordionBody.classList.remove('w--open')
                toggleBody.setAttribute('aria-expanded', 'false')
                accordionBtn.style.transform = 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)'
                clone.style.zIndex = ''
                clone.style.height = '30px'
            }

            const switchAccordionBody = ({ toggle, wrapper }) => {
                // This function helps avoid multiple opened accordion body
                const accorBodiesNode = wrapper.querySelectorAll('.accordion-toggle.w-dropdown-toggle')
                const accorBodies = Array.from(accorBodiesNode)

                accorBodies.filter(ab => ab.id !== toggle.id).forEach((toggleBody) => {
                    const accorClone = toggleBody.parentNode
                    const accordionBody = accorClone.querySelector('nav.accordion-body.w-dropdown-list')
                    const accordionBtn = accorClone.querySelector('.accordion-btn')

                    closeToggle({ toggleBody, accordionBody, accordionBtn, clone: accorClone })
                })
            }

            const toggleFn = ({ toggle, accordionBody, accordionBtn, clone, wrapper, idx }) => {
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
                        clone.style.zIndex = '901'
                        clone.style.height = ''

                        switchAccordionBody({ toggle, wrapper })
                    } else {
                        closeToggle({ toggleBody: toggle, accordionBody, accordionBtn, clone })
                    }
                })
            }

            return { toggleFn }
        }

        // Let's scope this in a block so it wouldn't interfere with other tabs
        const runRecommendations = () => {
            // Let's validate if there are any data to be rendered otherwise, let's just remove the tab and not run the function
            const validateRecomData = recomDataArray.filter(rda => rda.active && rda.media.filter(rd => rd.active).length > 0).length > 0
            if (!validateRecomData) {
                recommendationsTab.remove()
                return
            }

            const recomTab = tabSection.querySelector('div#w-tabs-0-data-w-pane-1');
            const recomDropdownWrapper = recomTab.querySelector('.guide-dropdown-list-wrapper.recommendation');
            const recomDropdownTemplate = recomDropdownWrapper.querySelector('.guide-accordion-item.w-dropdown');
            const recomCardWrapperTemplate = recomDropdownTemplate.querySelector('.recommendation-card-wrapper');
            const { toggleFn } = tabsGenericFn()

            recomDropdownTemplate.remove()
            recomCardWrapperTemplate.remove()
            // Iterate over the data array and clone the template for each item
            recomDataArray.filter(rda => rda.active && rda.media.filter(rd => rd.active).length > 1).forEach((data, idx) => {
                // Clone the template
                const recomDropdownClone = recomDropdownTemplate.cloneNode(true);

                const toggle = recomDropdownClone.querySelector('.accordion-toggle.w-dropdown-toggle')
                const accordionBody = recomDropdownClone.querySelector('nav.accordion-body.w-dropdown-list')
                const accordionBtn = recomDropdownClone.querySelector('.accordion-btn')
                const cardLayout = recomDropdownClone.querySelector('.recommendation-card-layout')

                toggleFn({ accordionBody, accordionBtn, clone: recomDropdownClone, toggle, wrapper: recomDropdownWrapper, idx })

                // Update content with data from the array
                recomDropdownTemplate.setAttribute('data-w-id', generateUUID())
                recomDropdownClone.querySelector('[recom-data="accordion-title"]').textContent = data.accordionTitle;
                recomDropdownClone.querySelector(`[recom-data="media-icon"]`).setAttribute('src', data.iconDetails.url)

                data.media.filter(med => med.active).forEach((medData) => {
                    const mediaClone = recomCardWrapperTemplate.cloneNode(true);
                    const writeMedia = (dataAttr, text, attr = 'textContent') => {
                        mediaClone.querySelector(`[recom-data="${dataAttr}"]`)[attr] = text
                    }
                    const openHourList = medData.current_opening_hours?.weekday_text || []
                    const openHourElem = mediaClone.querySelector('.recom-card-text-link ul.recom-opening-sched')
                    const listItem = document.createElement('li')

                    openHourList.forEach(ohl => {
                        const listItemClone = listItem.cloneNode(true)
                        listItemClone.textContent = ohl
                        openHourElem.appendChild(listItemClone)
                    })

                    const { opening_hours } = medData
                    const isOpen = opening_hours?.open_now

                    const day = opening_hours?.periods?.length > 1 ? new Date().getDay() : 0
                    const period = opening_hours?.periods?.filter(x => x?.open?.day === day).find(x => x) || {
                        open: null,
                        close: null
                    }

                    const openingTime = period.open?.time || "0000"
                    const closingTime = period.close?.time || false
                    const chevronToggle = mediaClone.querySelector(`[recom-data="open-hours-chevron"]`)

                    const cardimageWrapper = mediaClone.querySelector('.recom-card-image-wrapper')

                    const detailValue = isOpen && closingTime && openingTime ? `Closed at ${closingTime === "0000"
                        ? "12:00 AM"
                        : closingTime?.slice(0, 2) + ":" + closingTime?.slice(2)
                        }` : `Opens at ${openingTime === "0000"
                            ? "12:00 AM"
                            : openingTime?.slice(0, 2) + ":" + openingTime?.slice(2)
                        }` || ""

                    writeMedia('media-name', medData.name)
                    writeMedia('media-website', truncateString(medData.website, 25))
                    writeMedia('media-website', `https://www.${medData.website}`, 'href')
                    writeMedia('media-maps-url', medData.mapsUrl || '#', 'href')

                    writeMedia('media-open-status', isOpen ? 'Open' : 'Closed')
                    writeMedia('media-close-detail', detailValue)
                    mediaClone.querySelector(`[recom-data="media-open-status"]`).style.color = `#${isOpen ? '60BE83' : 'FF5757'}`

                    chevronToggle.addEventListener('click', () => {
                        const isToggled = chevronToggle.classList.contains('toggled')

                        chevronToggle.classList[isToggled ? 'remove' : 'add']('toggled')
                        chevronToggle.style.transform = `translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(${isToggled ? 0 : 180}deg) skew(0deg, 0deg)`
                        openHourElem.style.display = isToggled ? 'none' : ''
                    })

                    if (typeof medData.cardImg === 'string') {
                        writeMedia('media-card-img-1', medData.cardImg || '', 'src')
                        mediaClone.querySelector(`[recom-data="media-card-img-2"]`).style.opacity = '0'
                        mediaClone.querySelector(`[recom-data="media-card-img-3"]`).style.opacity = '0'
                    } else {
                        const imgs = medData.cardImg

                        imgs.forEach((i, idx) => {
                            writeMedia(`media-card-img-${idx + 1}`, i || '', 'src')
                        })

                        if (imgs.length < 3) {
                            const newLength = 3 - imgs.length

                            if (imgs.length === 0) {
                                cardimageWrapper.remove()
                            } else {
                                for (let i = 0; i < newLength; i++) {
                                    mediaClone.querySelector(`[recom-data="media-card-img-${3 - i}"]`).style.opacity = '0'
                                }
                            }


                        }
                    }

                    cardLayout.append(mediaClone)
                })

                // // Append the cloned element to the wrapper
                recomDropdownWrapper.append(recomDropdownClone);
            });
        }

        // Let's scope this in a block so it wouldn't interfere with other tabs
        const runGeneral = () => {
            // Let's validate if there are any data to be rendered otherwise, let's just remove the tab and not run the function
            const validateGeneralData = generalDataArray.filter(gda => gda.active).length > 0
            if (!validateGeneralData) {
                generalsTab.remove()
                return
            }

            const genTab = tabSection.querySelector('div#w-tabs-0-data-w-pane-2');
            const genDropdownWrapper = genTab.querySelector('.guide-dropdown-list-wrapper.general');
            const genDropdownTemplate = genDropdownWrapper.querySelector('.guide-accordion-item.w-dropdown');
            const { toggleFn } = tabsGenericFn()

            genDropdownTemplate.remove()

            // Iterate over the data array and clone the template for each item
            generalDataArray.filter(rda => rda.active).forEach((data, idx) => {
                // Clone the template
                const genDropdownClone = genDropdownTemplate.cloneNode(true);

                const toggle = genDropdownClone.querySelector('.accordion-toggle.w-dropdown-toggle')
                const accordionBody = genDropdownClone.querySelector('nav.accordion-body.w-dropdown-list')
                const accordionBtn = genDropdownClone.querySelector('.accordion-btn')

                toggleFn({ accordionBody, accordionBtn, toggle, clone: genDropdownClone, wrapper: genDropdownWrapper, idx })

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

                const mediaFn = ({ data, clone }) => {
                    const { content, title } = data
                    return {
                        text: () => {
                            clone.textContent = content
                        },
                        link: () => {
                            const link = clone.querySelector('[gen-data="media-link"]')
                            link.setAttribute('href', content)
                            link.setAttribute('target', '_blank')
                            link.textContent = title || link.textContent
                        },
                        img: () => {
                            const img = clone.querySelector('[gen-data="media-img"]')
                            img.setAttribute('src', content)
                            img.setAttribute('srcset', '')
                        },
                        video: () => {
                            const video = clone.querySelector('[gen-data="media-vid"]')
                            video.querySelector('iframe.embedly-embed').setAttribute('src', content)
                        },
                    }
                }

                data.media.forEach((data) => {
                    if (!Object.keys(elementWithType).includes(data.type)) return // Let's skip first if there are more types than the 4

                    const clone = elementWithType[data.type].cloneNode(true)
                    mediaFn({ data, clone })[data.type]() // Let's run the function based on the `media.type`
                    genDropdownClone
                        .querySelector('.accordion-body-content')
                        .append(clone)
                })

                genDropdownWrapper.append(genDropdownClone); // Append the cloned element to the wrapper
            });
        }

        runRecommendations() // Now we run recommendations script
        runGeneral()
    }

    // Update Profile Section using details from CTA field in Guide Collections
    const runProfileFunctions = () => {
        const ctaLink = newDesign.querySelector('[profile-data="cta-link"]')
        const ctaMobile = newDesign.querySelector('[profile-data="cta-mobile"]')

        const { enabled, link, phoneNum } = JSON.parse(ctaDetailsText)

        if (enabled) {
            ctaLink.textContent = link.title
            ctaLink.href = link.value

            ctaMobile.textContent = phoneNum.title
            ctaMobile.href = `tel:${phoneNum.value}`
        } else {
            removeCtaWrapper()
        }
    }

    if (isNew) {
        const compendiumFn = compendiumText === ''
            ? () => {
                generalsTab.remove()
                recommendationsTab.remove()
            }
            : () => runTabFunctions()

        const ctaFn = ctaDetailsText === ''
            ? removeCtaWrapper
            : () => runProfileFunctions()

        compendiumFn()
        ctaFn()
    }
}

startObservingElements({
    selectors: [
        'div#w-tabs-0-data-w-pane-1',
        'code#json-compendium',
        'code#json-cta'
    ],
    callback: runFn
});
