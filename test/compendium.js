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

const runFooterYear = () => {
    const currentYearInfo = $('#current-year-text-info');
    if (currentYearInfo.length) {
        currentYearInfo.text(new Date().getFullYear());
    }
}

const runFn = async () => {
    const compendium = $('code#json-compendium')
    const compendiumText = compendium.text()

    const ctaDetails = $('code#json-cta')
    const ctaDetailsText = ctaDetails.text()

    const mainWrapper = $('.main-wrapper')
    const allTabs = [1, 2, 3]
        .map(dwt => mainWrapper
            .find(`[data-w-tab="Tab ${dwt}"]`))

    const [toursTab, recommendationsTab, generalsTab] = allTabs

    // Add hover effect and set tab to active
    allTabs.map(at =>
        Object.entries({ addClass: 'mouseenter', removeClass: 'mouseleave' }).forEach(([action, event]) => {
            at.on(event, () => {
                at.attr('aria-selected') !== 'true' &&
                    at[action]('w--current')
            })
        })
    )

    const removeCtaWrapper = () => {
        mainWrapper.find('.guide-cta-wrapper').remove()
    }
    toursTab.click()
    runFooterYear()

    const runTabFunctions = () => {
        const tabSection = $('.tabs-content.w-tab-content');
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
                toggleBody.removeClass('w--open')
                accordionBody.removeClass('w--open')
                toggleBody.attr('aria-expanded', 'false')
                accordionBtn.css('transform', 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)')
                clone.css({
                    'zIndex': '',   // Clearing the zIndex
                    'height': '30px'  // Setting the height to 30px
                });
            }

            const switchAccordionBody = ({ toggle, wrapper }) => {
                // This function helps avoid multiple opened accordion body
                const accorBodiesNode = wrapper.find('.accordion-toggle.w-dropdown-toggle')
                const accorBodies = Object.values(accorBodiesNode)


                console.log('--this is accorBodies[0]', accorBodies[0])

                accorBodies.filter(ab => ab.id !== toggle.id).forEach((toggleBody) => {

                    console.log('--this is toggleBody', toggleBody.parent())
                    const accorClone = toggleBody.parent()
                    const accordionBody = accorClone.find('nav.accordion-body.w-dropdown-list');
                    const accordionBtn = accorClone.find('.accordion-btn');

                    closeToggle({ toggleBody, accordionBody, accordionBtn, clone: accorClone })
                })
            }

            const toggleFn = ({ toggle, accordionBody, accordionBtn, clone, wrapper, idx }) => {
                const toggleId = `w-dropdown-toggle-${idx + 1}`
                const dropdownId = `w-dropdown-list-${idx + 1}`

                toggle.attr('id', toggleId)
                toggle.attr('aria-controls', dropdownId)
                accordionBody.attr('id', dropdownId)
                accordionBody.attr('aria-labelledby', toggleId)
                accordionBtn.css('transition', '0.5s');

                toggle.on('click', () => {
                    if (!toggle.hasClass('w--open')) {
                        toggle.addClass('w--open');
                        accordionBody.addClass('w--open');
                        toggle.attr('aria-expanded', 'true')
                        accordionBtn.css('transform', 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(180deg) skew(0deg, 0deg)')
                        clone.css({
                            'zIndex': '901',   // Clearing the zIndex
                            'height': ''  // Setting the height to 30px
                        });

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
            // Validate if there are any data to be rendered otherwise, let's just remove the tab and not run the function
            const validateRecomData = recomDataArray.filter(rda => rda.active && rda.media.filter(rd => rd.active).length > 0).length > 0;
            if (!validateRecomData) {
                recommendationsTab.remove();
                return;
            }

            const recomTab = tabSection.find('div#w-tabs-0-data-w-pane-1');
            const recomDropdownWrapper = recomTab.find('.guide-dropdown-list-wrapper.recommendation');
            const recomDropdownTemplate = recomDropdownWrapper.find('.guide-accordion-item.w-dropdown').remove();
            const recomCardWrapperTemplate = recomDropdownTemplate.find('.recommendation-card-wrapper').remove();
            const { toggleFn } = tabsGenericFn();

            // Iterate over the data array and clone the template for each item
            recomDataArray.filter(rda => rda.active && rda.media.filter(rd => rd.active).length > 1).forEach((data, idx) => {
                // Clone the template
                const recomDropdownClone = recomDropdownTemplate.clone();

                const toggle = recomDropdownClone.find('.accordion-toggle.w-dropdown-toggle');
                const accordionBody = recomDropdownClone.find('nav.accordion-body.w-dropdown-list');
                const accordionBtn = recomDropdownClone.find('.accordion-btn');
                const cardLayout = recomDropdownClone.find('.recommendation-card-layout');

                // Initialize the toggle functionality
                toggleFn({ accordionBody, accordionBtn, clone: recomDropdownClone, toggle, wrapper: recomDropdownWrapper, idx });

                // Update content with data from the array
                recomDropdownClone.attr('data-w-id', generateUUID());
                recomDropdownClone.find('[recom-data="accordion-title"]').text(data.accordionTitle);
                recomDropdownClone.find(`[recom-data="media-icon"]`).attr('src', data.iconDetails.url);

                data.media.filter(med => med.active).forEach((medData) => {
                    const mediaClone = recomCardWrapperTemplate.clone(true); // Cloning with events in jQuery
                    const writeMedia = (dataAttr, text, attr = 'text') => {
                        const element = mediaClone.find(`[recom-data="${dataAttr}"]`);
                        if (element.length) {
                            if (attr === 'text') {
                                element.text(text);
                            } else {
                                element.attr(attr, text);
                            }
                        }
                    };

                    const openHourList = medData.opening_hours?.weekday_text || [];
                    const openHourElem = mediaClone.find('.recom-card-text-link ul.recom-opening-sched');
                    openHourElem.empty(); // Clear existing list items

                    openHourList.forEach(ohl => {
                        const listItemClone = $('<li>').text(ohl); // Create and append list item
                        openHourElem.append(listItemClone);
                    });

                    const { opening_hours } = medData;
                    const isOpen = opening_hours?.open_now;
                    const day = opening_hours?.periods?.length > 1 ? new Date().getDay() : 0;
                    const period = opening_hours?.periods?.filter(x => x?.open?.day === day).find(x => x) || {
                        open: null,
                        close: null
                    };

                    const openingTime = period.open?.time || "0000";
                    const closingTime = period.close?.time || false;
                    const chevronToggle = mediaClone.find(`[recom-data="open-hours-chevron"]`);

                    if (openHourList.length === 0) {
                        chevronToggle.remove();
                    }

                    const cardimageWrapper = mediaClone.find('.recom-card-image-wrapper');

                    const detailValue = isOpen && closingTime && openingTime ? `Closed at ${closingTime === "0000" ? "12:00 AM" : closingTime.slice(0, 2) + ":" + closingTime.slice(2)}` : `Opens at ${openingTime === "0000" ? "12:00 AM" : openingTime.slice(0, 2) + ":" + openingTime.slice(2)}` || "";

                    writeMedia('media-name', medData.name);
                    writeMedia('media-website', truncateString(medData.website, 25));
                    writeMedia('media-website', `https://www.${medData.website}`, 'href');
                    writeMedia('media-maps-url', medData.mapsUrl || '#', 'href');

                    writeMedia('media-open-status', isOpen ? 'Open' : 'Closed');
                    writeMedia('media-close-detail', detailValue);
                    mediaClone.find(`[recom-data="media-open-status"]`).css('color', `#${isOpen ? '60BE83' : 'FF5757'}`);

                    chevronToggle.on('click', function () {
                        $(this).toggleClass('toggled');
                        $(this).css('transform', `translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(${chevronToggle.hasClass('toggled') ? 180 : 0}deg) skew(0deg, 0deg)`);
                        openHourElem.toggle();
                    });

                    if (typeof medData.cardImg === 'string') {
                        writeMedia('media-card-img-1', medData.cardImg || '', 'src');
                        mediaClone.find(`[recom-data="media-card-img-2"]`).css('opacity', '0');
                        mediaClone.find(`[recom-data="media-card-img-3"]`).css('opacity', '0');
                    } else {
                        const imgs = medData.cardImg;

                        imgs.forEach((img, idx) => {
                            writeMedia(`media-card-img-${idx + 1}`, img || '', 'src');
                        });

                        if (imgs.length < 3) {
                            const newLength = 3 - imgs.length;

                            for (let i = 0; i < newLength; i++) {
                                mediaClone.find(`[recom-data="media-card-img-${3 - i}"]`).css('opacity', '0');
                            }
                        }
                    }

                    cardLayout.append(mediaClone);
                });


                // Append the cloned dropdown to the wrapper
                recomDropdownWrapper.append(recomDropdownClone);
            });
        };


        // Let's scope this in a block so it wouldn't interfere with other tabs
        const runGeneral = () => {
            // Let's validate if there are any data to be rendered otherwise, let's just remove the tab and not run the function
            const validateGeneralData = generalDataArray.filter(gda => gda.active).length > 0;
            if (!validateGeneralData) {
                generalsTab.remove();
                return;
            }

            const genTab = tabSection.find('div#w-tabs-0-data-w-pane-2');
            const genDropdownWrapper = genTab.find('.guide-dropdown-list-wrapper.general');
            const genDropdownTemplate = genDropdownWrapper.find('.guide-accordion-item.w-dropdown').remove();
            const { toggleFn } = tabsGenericFn();

            // Iterate over the data array and clone the template for each item
            generalDataArray.filter(gda => gda.active && gda.media.length > 0).forEach((data, idx) => {
                // Clone the template
                const genDropdownClone = genDropdownTemplate.clone();

                const toggle = genDropdownClone.find('.accordion-toggle.w-dropdown-toggle');
                const accordionBody = genDropdownClone.find('nav.accordion-body.w-dropdown-list');
                const accordionBtn = genDropdownClone.find('.accordion-btn');

                toggleFn({ accordionBody, accordionBtn, toggle, clone: genDropdownClone, wrapper: genDropdownWrapper, idx });

                // Update content with data from the array
                genDropdownClone.attr('data-w-id', generateUUID());
                genDropdownClone.find('[gen-data="accordion-title"]').text(data.accordionTitle);
                genDropdownClone.find(`[gen-data="media-icon"]`).attr('src', data.iconDetails.url);

                // Handling media types
                data.media.forEach(mediaItem => {
                    const mediaType = mediaItem.type;
                    const content = mediaItem.content;
                    const title = mediaItem.title;
                    let mediaElement = genDropdownClone.find(`[gen-data="media-${mediaType}"]`).clone();

                    switch (mediaType) {
                        case 'text':
                            mediaElement.text(content);
                            break;
                        case 'link':
                            mediaElement.attr('href', content).text(title || content);
                            break;
                        case 'img':
                            mediaElement.attr('src', content).attr('srcset', '');
                            break;
                        case 'video':
                            mediaElement.find('iframe').attr('src', content);
                            break;
                    }

                    genDropdownClone.find('.accordion-body-content').append(mediaElement);
                });

                genDropdownWrapper.append(genDropdownClone); // Append the cloned element to the wrapper
            });
        };


        runRecommendations() // Now we run recommendations script
        runGeneral()
    }

    // Update Profile Section using details from CTA field in Guide Collections
    const runProfileFunctions = () => {
        const ctaLink = mainWrapper.find('[profile-data="cta-link"]');
        const ctaMobile = mainWrapper.find('[profile-data="cta-mobile"]');

        const { enabled, link, phoneNum } = JSON.parse(ctaDetailsText);

        if (enabled) {
            if (link && link !== '') {
                ctaLink.text(link.title);  // Correct setting of text
                ctaLink.attr('href', link.value);  // Correct setting of href attribute
            } else {
                ctaLink.remove();
            }

            if (phoneNum && phoneNum !== '') {
                ctaMobile.text(phoneNum.title);  // Correct setting of text
                ctaMobile.attr('href', `tel:${phoneNum.value}`);  // Correct setting of href attribute
            } else {
                ctaMobile.remove();
            }
        } else {
            removeCtaWrapper();
        }
    }

    const compendiumFn = () => {
        if (compendiumText === '') {
            generalsTab.remove();
            recommendationsTab.remove();
        } else {
            runTabFunctions();
        }
    };

    const ctaFn = () => {
        if (ctaDetailsText === '') {
            removeCtaWrapper();
        } else {
            runProfileFunctions();
        }
    };


    compendiumFn()
    ctaFn()
}

startObservingElements({
    selectors: [
        'div#w-tabs-0-data-w-pane-1',
        'code#json-compendium',
        'code#json-cta'
    ],
    callback: runFn
});
