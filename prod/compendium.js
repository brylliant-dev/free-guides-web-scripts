const generateUUID = () => {
  // We're gonna need this for `data-w-id`
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// We'll use this function to wait for certain query selectors before we run a callback
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

const truncateString = (str, maxLength) => {
  return str.length <= maxLength ? str : str.slice(0, maxLength - 3) + '...'
}

const runFooterYear = () => {
  const currentYearInfo = document.querySelector('#current-year-text-info')
  if (currentYearInfo) {
    currentYearInfo.textContent = new Date().getFullYear()
  }
}

const runFn = async () => {
  const compendium = document.querySelector('code#json-compendium')
  const compendiumText = compendium.textContent

  const ctaDetails = document.querySelector('code#json-cta')
  const ctaDetailsText = ctaDetails.textContent

  var highlightsData = document.querySelector('code#highlights')

  const mainWrapper = document.querySelector('.main-wrapper')
  const allTabs = [1, 2, 3, 4].map((dwt) =>
    mainWrapper.querySelector(`[data-w-tab='Tab ${dwt}']`)
  )

  const [toursTab, recommendationsTab, generalsTab, activityTab] = allTabs

  // Add hover effect and set tab to active
  allTabs.map((at) =>
    Object.entries({ add: 'mouseenter', remove: 'mouseleave' }).forEach(
      ([action, event]) => {
        at.addEventListener(event, () => {
          at.getAttribute('aria-selected') !== 'true' &&
            at.classList[action]('w--current')
        })
      }
    )
  )

  const removeCtaWrapper = () => {
    mainWrapper.querySelector('.guide-cta-wrapper').remove()
  }
  toursTab.click()
  runFooterYear()

  const runTabFunctions = () => {
    const tabSection = document.querySelector('.tabs-content.w-tab-content')
    const compendium = JSON.parse(compendiumText)

    const generalDataArray = compendium.general.map(
      ({ iconDetails, active, title, media }) => ({
        iconDetails,
        active,
        accordionTitle: title,
        media,
      })
    )

    const recomDataArray = compendium.recommendations.map(
      ({ iconDetails, active, title, media }) => ({
        iconDetails,
        active,
        accordionTitle: title,
        media: media.map((m) => ({ ...m, placeId: m.content })),

      })
    )

    const tabsGenericFn = () => {
      const closeToggle = ({
        toggleBody,
        accordionBody,
        accordionBtn,
        clone,
      }) => {
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

        accorBodies
          .filter((ab) => ab.id !== toggle.id)
          .forEach((toggleBody) => {
            const accorClone = toggleBody.parentNode
            const accordionBody = accorClone.querySelector('nav.accordion-body.w-dropdown-list')
            const accordionBtn = accorClone.querySelector('.accordion-btn')

            closeToggle({
              toggleBody,
              accordionBody,
              accordionBtn,
              clone: accorClone,
            })
          })
      }

      const toggleFn = ({
        toggle,
        accordionBody,
        accordionBtn,
        clone,
        wrapper,
        idx,
        subId = null,
        callback = () => { },
      }) => {
        const toggleId = `w-dropdown-toggle-${idx + 1}${subId ??''}`
        const dropdownId = `w-dropdown-list-${idx + 1}${subId ?? ''}`

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
            accordionBtn.style.transform =
              'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(180deg) skew(0deg, 0deg)'
            clone.style.zIndex = '901'
            clone.style.height = ''

            if(!subId) {
              switchAccordionBody({ toggle, wrapper })
            }
          } else {
            closeToggle({
              toggleBody: toggle,
              accordionBody,
              accordionBtn,
              clone,
            })
          }

          callback()
        })
      }

      return { toggleFn }
    }

    // Let's scope this in a block so it wouldn't interfere with other tabs
    const runRecommendations = () => {
      // Let's validate if there are any data to be rendered otherwise, let's just remove the tab and not run the function
      const validateRecomData =
        recomDataArray.filter(
          (rda) => rda.active && rda.media.filter((rd) => rd.active).length > 0
        ).length > 0
      if (!validateRecomData || !compendium.recommendEnabled) {
        recommendationsTab.remove()
        return
      }

      const recomTab = tabSection.querySelector("div[data-tab-name='recommendations']")
      const recomDropdownWrapper = recomTab.querySelector('.guide-dropdown-list-wrapper.recommendation')
      const recomDropdownTemplate = recomDropdownWrapper.querySelector('.guide-accordion-item.w-dropdown')
      const recomCardWrapperTemplate = recomDropdownTemplate.querySelector('.recommendation-card-wrapper')
      const { toggleFn } = tabsGenericFn()

      recomDropdownTemplate.remove()
      recomCardWrapperTemplate.remove()
      // Iterate over the data array and clone the template for each item
      recomDataArray
        .filter(
          (rda) => rda.active && rda.media.filter((rd) => rd.active).length > 0
        )
        .forEach((data, idx) => {
          // Clone the template
          const recomDropdownClone = recomDropdownTemplate.cloneNode(true)

          const toggle = recomDropdownClone.querySelector('.accordion-toggle.w-dropdown-toggle')
          const accordionBody = recomDropdownClone.querySelector('nav.accordion-body.w-dropdown-list')
          const accordionBtn = recomDropdownClone.querySelector('.accordion-btn')
          const cardLayout = recomDropdownClone.querySelector('.recommendation-card-layout')

          const iframeClones = []

          const isBranded = document.querySelector('code#string-branded').textContent === 'true'
          var brandedTextColor = document.getElementById('string-brand-text-color').textContent
          var stringBrandColor = document.querySelector('code#string-brand-color').textContent

          brandedTextColor = brandedTextColor.substring(1)
          stringBrandColor = stringBrandColor.substring(1)

          const brandColor = isBranded && stringBrandColor !== '' ? stringBrandColor : '60be8c'
          const textColour = isBranded && brandedTextColor !== '' ? brandedTextColor : "FFFFFF"


          const testUrl = `https://fg-tours-preview--preview-bic7ekwv.web.app/?brandColor=${brandColor}&placeId=`
          const prodUrl = `https://tour.freeguides.com/?brandColor=${brandColor}&textColor=${textColour}&placeId=`


          const feedIframeSrc = () => {
            iframeClones.forEach((ifc) => {
              if (ifc.item.getAttribute('src') === '') {
                var insight = ifc.details?.insight ?? ""
                ifc.item.setAttribute(
                  'src',
                  `${prodUrl + ifc.placeId}&insight=${insight}`
                )
                ifc.item.setAttribute('scrolling','no')
              }
            })
          }

          toggleFn({
            accordionBody,
            accordionBtn,
            clone: recomDropdownClone,
            toggle,
            wrapper: recomDropdownWrapper,
            idx,
            callback: feedIframeSrc,
          })

          // Update content with data from the array
          recomDropdownTemplate.setAttribute('data-w-id', generateUUID())
          recomDropdownClone.querySelector('[recom-data="accordion-title"]').textContent = data.accordionTitle
          recomDropdownClone.querySelector('[recom-data="accordion-title"]').setAttribute('data-title',data.accordionTitle) 
          recomDropdownClone.setAttribute('data-title',data.accordionTitle)
          recomDropdownClone.querySelector(`[icon-recom-data-name='icon-title']`).setAttribute('icon-recom-data-name', data.iconDetails?.name || 'welcome')
          

          data.media
            .filter((med) => med.active)
            .forEach((medData) => {
              const mediaClone = recomCardWrapperTemplate.cloneNode(true)
              const placeId = medData.placeId
              const details = medData.details ?? ''

              mediaClone.innerHTML = `<iframe src='' height='380px' width='100%' loading='lazy' class='iFrame1'></iframe>`

              iframeClones.push({
                item: mediaClone.querySelector('iframe'),
                placeId,
                details
              })
              cardLayout.append(mediaClone)
            })

          recomDropdownWrapper.append(recomDropdownClone)
        })
    }

    // Let's scope this in a block so it wouldn't interfere with other tabs
    const runGeneral = () => {
      // Let's validate if there are any data to be rendered otherwise, let's just remove the tab and not run the function
      const validateGeneralData =
        generalDataArray.filter((gda) => gda.active).length > 0
      if (!validateGeneralData || !compendium.generalEnabled) {
        generalsTab.remove()
        return
      }

      const genTab = tabSection.querySelector("div[data-tab-name='general']")
      const genDropdownWrapper = genTab.querySelector('.guide-dropdown-list-wrapper.general')
      const genDropdownTemplate = genDropdownWrapper.querySelector('.guide-accordion-item.w-dropdown')
      const { toggleFn } = tabsGenericFn()

      genDropdownTemplate.remove()

      // Iterate over the data array and clone the template for each item
      generalDataArray
        .filter((rda) => rda.active && rda.media.length > 0)
        .forEach((data, idx) => {
          // Clone the template
          const genDropdownClone = genDropdownTemplate.cloneNode(true)

          const toggle = genDropdownClone.querySelector('.accordion-toggle.w-dropdown-toggle')
          const accordionBody = genDropdownClone.querySelector('nav.accordion-body.w-dropdown-list')
          const accordionBtn = genDropdownClone.querySelector('.accordion-btn')

          const genMediaAccordionTemplate = genDropdownClone.cloneNode(true)

          toggleFn({
            toggle,
            accordionBody,
            accordionBtn,
            clone: genDropdownClone,
            wrapper: genDropdownWrapper,
            idx,
          })

          // Update content with data from the array
          genDropdownTemplate.setAttribute('data-w-id', generateUUID())
          genDropdownClone.querySelector('[gen-data="accordion-title"]').setAttribute('data-title',data.accordionTitle)
          genDropdownClone.querySelector('[gen-data="accordion-title"]').textContent = data.accordionTitle
          //genDropdownClone.querySelector(`[icon-gen-data-name='icon-title']`).setAttribute('icon-gen-data-name', data.iconDetails.name)
          genDropdownClone.querySelector(`[icon-gen-data-name='icon-title']`).setAttribute('icon-gen-data-name', data.iconDetails?.name || 'welcome');
        

          //genDropdownClone
          // .querySelector(`[gen-data='media-icon']`)
          //.setAttribute('src', data.iconDetails.url)

          const genMediaTextTemplate = genDropdownClone.querySelector('[gen-data="media-text"]')
          const genMediaLinkTemplate = genDropdownClone.querySelector('[gen-data="media-link"]').parentElement
          const genMediaImageTemplate = genDropdownClone.querySelector('[gen-data="media-img"]').parentElement
          const genMediaVideoTemplate = genDropdownClone.querySelector('[gen-data="media-vid"]').parentElement

          genMediaTextTemplate.remove()
          genMediaLinkTemplate.remove()
          genMediaImageTemplate.remove()
          genMediaVideoTemplate.remove()
          //genMediaAccordionTemplate.children[0].firstChild.remove()

          const elementWithType = {
            text: genMediaTextTemplate,
            link: genMediaLinkTemplate,
            img: genMediaImageTemplate,
            video: genMediaVideoTemplate,
            accordion: genMediaAccordionTemplate
          }

          const mediaFn = ({ data, clone }) => {
            const { content, title } = data
            return {
              text: () => {
                clone.innerHTML = content
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
                video
                  .querySelector('iframe.embedly-embed')
                  .setAttribute('src', content)
              },
              accordion: () => {
                clone.querySelector(`[icon-gen-data-name='icon-title']`).style.display = 'none'
                console.log(clone.parent)

                var cloneTitle = clone.querySelector('[gen-data="accordion-title"]')
                cloneTitle.setAttribute('data-title',title)
                cloneTitle.textContent = data.title

                var cloneBody = clone.querySelector('.accordion-body-content')
                cloneBody.style.padding = '0px'
                cloneBody.style.paddingTop = '10px'

                cloneBody.innerHTML = content
              }
            }
          }

          data.media.forEach((data,mid) => {
            if (!Object.keys(elementWithType).includes(data.type)) return // Let's skip first if there are more types than the 4

            const clone = elementWithType[data.type].cloneNode(true)
            if(data.type === 'accordion') {
              var subId = '-' + mid
              var subBody = clone.querySelector('nav.accordion-body')
              var subBtn = clone.querySelector('.accordion-btn')
              var subToggle = clone.querySelector('.accordion-toggle.w-dropdown-toggle')


              toggleFn({
                toggle: subToggle,
                accordionBody: subBody,
                accordionBtn: subBtn,
                clone: clone,
                wrapper: genDropdownWrapper,
                idx,
                subId
              })
              clone.style.paddingBottom = '5%'
              clone.style.marginTop = '3%'
              clone.style.borderBottom = '1px solid lightgray'
            }


            mediaFn({ data, clone })[data.type]() // Let's run the function based on the `media.type`
            genDropdownClone
              .querySelector('.accordion-body-content')
              .append(clone)
          })

          genDropdownWrapper.append(genDropdownClone) // Append the cloned element to the wrapper
        })
    }

    // Add the new Activity tab functionality
    //const runActivity = () => {
    //const activityIframe = document.querySelector('#activity-iframe')
    //if (activityIframe) {
    //activityIframe.src = 'https://your-activity-iframe-url.com'
    //}
    //console.log("activity tab test")
    //}

    runRecommendations() // Now we run recommendations script
    runGeneral()
    //runActivity()
  }

  // Update Profile Section using details from CTA field in Guide Collections
  const runProfileFunctions = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const ctaLink = mainWrapper.querySelector('[profile-data="cta-link"]')
    const ctaMobile = mainWrapper.querySelector('[profile-data="cta-mobile"]')
    const ctaMain = mainWrapper.querySelector('[profile-data="cta-main"]')

    console.log(ctaLink,ctaMobile,ctaMain)

    const { enabled, link, phoneNum, main, primary } = JSON.parse(ctaDetailsText)

    const checkNullData = ({ details, elem, prefix = '', parent = false }) => {
      if (details && details !== '') {
        elem.textContent = details?.title || ''
        elem.href = `${prefix}${details?.value || ''}`
      } else {
        (parent ? elem.parentElement : elem).remove()
      }
    }

    if (enabled) {
      if (!main && !primary) {
        ctaLink.classList.add('profile-cta-order', 'margin-top-9', 'text-white')
      }
      checkNullData({ details: link, elem: ctaLink })
      checkNullData({ details: phoneNum, elem: ctaMobile, prefix: 'tel:' })
      checkNullData({ details: main || primary, elem: ctaMain })
    } else {
      removeCtaWrapper()
    }

    var buttons = document.querySelectorAll('[profile-data]')
    if(isMobile) {
      if(buttons.length === 2) {
        var first = buttons[0]
        var second = buttons[1]

        buttons[0].parentElement.style['grid-template-rows'] = '1fr'
        buttons[0].style['grid-area'] = '1 / 1 / 1 / 1'
        buttons[1].style['grid-area'] = '1 / 2 / 1 / 2'

      } else if (buttons.length === 1) {
        var first = buttons[0]
        buttons[0].parentElement.style['grid-template-rows'] = '1fr'
        buttons[0].style['grid-area'] = '1 / 1 / 1 / 4'
      }
      //console.log(buttons)
    }

  }

  const calculatePreviewColor = (hexColour) => {

    const r = parseInt(hexColour.slice(1, 3), 16)
    const g = parseInt(hexColour.slice(3, 5), 16)
    const b = parseInt(hexColour.slice(5, 7), 16)
    
    const newR = Math.round((r + 255 * 14) / 15)
    const newG = Math.round((g + 255 * 14) / 15)
    const newB = Math.round((b + 255 * 14) / 15)
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }

  const parseTime = (time) => {
    // Check correct time format and split into components
    time = time.match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) { // If time format correct
      time = time.slice(1);  // Remove full string match value
      time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join(''); // return adjusted time or original string
  }

  const runHighlightsFunction = () => {


    var highlights = JSON.parse(highlightsData.innerHTML)
    var blocks = document.getElementsByClassName('highlights-time')
    var timeTextDivs = document.getElementsByClassName('time-text') ?? []

    var stringBrandColor = document.querySelector('code#string-brand-color').textContent
    var bkg = stringBrandColor !== '' ? stringBrandColor : '#60BE8C'
    bkg = calculatePreviewColor(bkg)

    var displayFlag = false 

    for (var i = 0; i < timeTextDivs.length ; i++) {
      var t = timeTextDivs[i]
      var time = ""
      console.log(t)
      if(t.id === 'check-in') {
        if(highlights?.check?.active) {
          time = highlights.check?.value?.in ?? '15:00'
          console.log(time)
          //t.innerHTML = parseTime("15:00")
          displayFlag = true 
          blocks[0].style.backgroundColor = bkg
        } else {
          blocks[0].style = "display: none"
        }
      } else if (t.id === 'check-out') {
        time = highlights.check?.value?.out ?? '11:00'
        console.log(time)
        //t.innerHTML = parseTime("11:00")
      } else if (t.id === 'breakfast-time') { 
        if(highlights?.breakfast?.active) {
          var start = highlights.breakfast?.value?.start ?? '06:30 AM'
          var end = highlights.breakfast?.value?.end ?? '10:30 AM'
          t.innerHTML = parseTime(start) + ' - ' + parseTime(end)
          blocks[1].style.backgroundColor = bkg
          displayFlag = true
        } else {
          blocks[1].style = "display: none"
        }
      }
    }

    var wifiDiv = document.getElementsByClassName('highlights-checkin-text')
    if(highlights?.wifi?.active) {
      /*
      var { content = "", type = "password" } = highlights?.wifi?.value
      if(type === 'password') {
        var parts = content.split('\n')
        var textBlocks = wifiDiv[2].children[0].children

        if(parts.length > 1 ) {
          textBlocks[0].innerHTML = parts[0]
          textBlocks[1].innerHTML = parts[1]
        }
      }
      */

      blocks[2].style.backgroundColor = bkg
      displayFlag = true
    } else {
      blocks[2].style = "display: none"
    }

    var highlightsContainer = document.getElementsByClassName('highlights-container')
    highlightsContainer[0].style.display = displayFlag ? 'block' : 'none'
  }

  const compendiumFn =
    compendiumText === ''
      ? () => {
        generalsTab.remove()
        recommendationsTab.remove()
      }
      : () => runTabFunctions()

  const ctaFn =
    ctaDetailsText === '' ? removeCtaWrapper : () => runProfileFunctions()

  if(highlightsData.innerHTML !== '') runHighlightsFunction()

  compendiumFn()
  ctaFn()

}

console.log('finished running compendium script')

startObservingElements({
  selectors: [
    'div#w-tabs-0-data-w-pane-1',
    'div#w-tabs-0-data-w-pane-3',
    'code#json-compendium',
    'code#json-cta',
  ],
  callback: runFn,
})

