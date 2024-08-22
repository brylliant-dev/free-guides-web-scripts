var Webflow = Webflow || [];
Webflow.push(function () {
    window.addEventListener('load', function () {
        const brandColorDiv = document.getElementById('string-brand-color');
        const brandedElement = document.getElementById('string-branded');
        const brandedTextColor = document.getElementById('string-brand-text-color');
        const fontElement = document.getElementById('string-brand-font');
        const brandedValue = brandedElement ? brandedElement.textContent.trim().toLowerCase() : null;

        // Utility function to convert HSLA to RGB
        function hslaToRgb(hsla) {
            const [h, s, l, a] = hsla.match(/[\d.]+/g).map(Number);
            const sPercent = s / 100;
            const lPercent = l / 100;

            const c = (1 - Math.abs(2 * lPercent - 1)) * sPercent;
            const x = c * (1 - Math.abs((h / 60) % 2 - 1));
            const m = lPercent - c / 2;

            let r, g, b;
            if (0 <= h && h < 60) {
                r = c; g = x; b = 0;
            } else if (60 <= h && h < 120) {
                r = x; g = c; b = 0;
            } else if (120 <= h && h < 180) {
                r = 0; g = c; b = x;
            } else if (180 <= h && h < 240) {
                r = 0; g = x; b = c;
            } else if (240 <= h && h < 300) {
                r = x; g = 0; b = c;
            } else if (300 <= h && h < 360) {
                r = c; g = 0; b = x;
            }

            const rRgb = Math.round((r + m) * 255);
            const gRgb = Math.round((g + m) * 255);
            const bRgb = Math.round((b + m) * 255);

            return `rgb(${rRgb}, ${gRgb}, ${bRgb})`;
        }

        // Utility function to get the brand bg color
        function getBrandColor() {
            const defaultColor = '#60be8c';
            if (brandColorDiv && brandColorDiv.textContent.trim() !== '' && brandedValue === 'true') {
                const color = brandColorDiv.textContent.trim();
                // Check if the color is HSLA and convert to RGB
                if (color.startsWith('hsla')) {
                    return hslaToRgb(color);
                }
                return color;
            }
            return defaultColor; // Return default color if brandColorDiv is null or empty
        }

        // Utility function to get the brand Text color
        function getBrandTextColor() {
            const defaultTextColor = 'white';
            if (brandedTextColor && brandedTextColor.textContent.trim() !== '' && brandedValue === 'true') {
                const Textcolor = brandedTextColor.textContent.trim();
                // Check if the color is HSLA and convert to RGB
                if (Textcolor.startsWith('hsla')) {
                    return hslaToRgb(Textcolor);
                }
                return Textcolor;
            }
            return defaultTextColor; // Return default color if brandedTextColor is null or empty
        }

        // Get the brand bg color
        const brandColor = getBrandColor();

        // Get the brand text color
        const brandTextColor = getBrandTextColor();

        // Create and append a style element for Tab Titles
        const styleTabTitles = document.createElement('style');
        styleTabTitles.textContent = `
           .guide-tab-link-toggle.w--current {
           background-color: ${brandColor} !important;
           color:  ${brandTextColor} !important;
           }
           .tour-profile-link.share-button:hover {
           background-color: ${brandColor} !important;
           color:  ${brandTextColor} !important;
           }
           .cta-exp-copied.profiles{
           background-color: ${brandColor} !important;
           color:  ${brandTextColor} !important;
           }
       `;
        document.head.appendChild(styleTabTitles);


        if (brandedValue === "true") {
            // Get the media buttons
            const mediaButtons = document.querySelectorAll('#media-button');

            if (brandColor) {
                // Get the color value from the brand-color div
                const colorValue = brandColor;

                // Get the color value from the brand-color div
                const colorTextValue = brandTextColor;
                //console.log(colorTextValue)

                if (mediaButtons.length > 0) {
                    // Apply background color to all media buttons with !important
                    mediaButtons.forEach(button => {
                        button.style.setProperty('background-color', colorValue, 'important');
                        button.style.setProperty('color', colorTextValue, 'important');
                    });
                }

                // Get other CTA divs if they exist
                const primaryCTA = document.getElementById('primary-cta');
                const secondaryCTA = document.getElementById('secondary-cta');

                // Set the background color for primary-cta with !important if it exists
                if (primaryCTA) {
                    primaryCTA.style.setProperty('background-color', colorValue, 'important');
                    primaryCTA.style.setProperty('color', colorTextValue, 'important');
                } else if (secondaryCTA && !primaryCTA) {
                    secondaryCTA.style.setProperty('background-color', colorValue, 'important');
                    secondaryCTA.style.setProperty('color', colorTextValue, 'important');
                }



                // Create and append a style element for hover effects
                const style = document.createElement('style');
                style.textContent = `
               #primary-cta:hover {
               opacity: 90% !important;
               }
               #media-button:hover {
               opacity: 90% !important;
               }
               #secondary-cta:hover,
               #phone-cta:hover {
               background-color: ${colorValue} !important;
            }
        `;
                document.head.appendChild(style);
            }

            // Function to format the font family
            function formatFontFamily(font) {
                if (!font) return 'Quicksand';
                return font
                    .trim()
                    .toLowerCase()
                    .replace(/\b\w/g, char => char.toUpperCase())
            }

            // Check if the font element exists
            if (fontElement) {
                // Get the text content from the font element
                let fontFamily = formatFontFamily(fontElement.textContent);

                // Create a link element to load the Google Font
                const linkElement = document.createElement('link');
                linkElement.rel = 'stylesheet';
                linkElement.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}&display=swap`;

                // Append the link element to the head
                document.head.appendChild(linkElement);

                // Change the font family for the buttons after the font is loaded
                linkElement.onload = () => {
                    // Get all CTA divs
                    const ctaDivs = {
                        primary: document.getElementById('primary-cta'),
                        secondary: document.getElementById('secondary-cta'),
                        phone: document.getElementById('phone-cta'),
                        mediaButtons: document.querySelectorAll('#media-button') // Changed to querySelectorAll for multiple elements
                    };

                    // Apply the font family with fallbacks to each button
                    Object.values(ctaDivs).forEach(button => {
                        if (button) {
                            if (button.forEach) {
                                // For NodeList elements like mediaButtons
                                button.forEach(el => {
                                    el.style.fontFamily = `${fontFamily}, Quicksand, sans-serif`;
                                });
                            } else {
                                button.style.fontFamily = `${fontFamily}, Quicksand, sans-serif`;
                            }
                        }
                    });
                    // List of class names to apply the font family
                    const classNames = [
                        'heading-20sb',
                        'text-size-16',
                        'text-size-18m',
                        'text-size-18',
                        'text-size-20m',
                        'text-size-15',
                        'text-size-16m',
                        'text-size-20'
                    ];

                    // Apply the font family to each class
                    classNames.forEach(className => {
                        document.querySelectorAll(`.${className}`).forEach(element => {
                            element.style.fontFamily = `${fontFamily}, Quicksand, sans-serif`;
                        });
                    });

                };
            } else {
                console.log('Element with ID "string-brand-font" not found.');
            }
        }

        function decodeHtmlEntities(str) {
            const textarea = document.createElement('textarea');
            textarea.innerHTML = str;
            return textarea.value;
        }

        // Collect SVG data
        const svgIcons = {};
        document.querySelectorAll('.icon-item').forEach(function (item) {
            const name = item.querySelector('.svg-embed').getAttribute('data-name').toLowerCase(); // Convert to lowercase
            const encodedSvgContent = item.querySelector('.svg-embed').getAttribute('data-path');
            const decodedSvgContent = decodeHtmlEntities(encodedSvgContent);
            svgIcons[name] = decodedSvgContent;
        });

        // Function to insert SVGs
        function insertSvg(item, selector, attribute) {
            const titleElement = item.querySelector(selector).getAttribute(attribute);
            if (!titleElement) {
                return;
            }

            const title = titleElement.trim().toLowerCase();
            const svgMarkup = svgIcons[title];

            if (svgMarkup) {
                const svgWithColor = brandColor ? svgMarkup.replace(/currentColor/g, brandColor) : svgMarkup;
                const iconWrapper = item.querySelector(selector);
                if (iconWrapper) {
                    iconWrapper.innerHTML = svgWithColor;
                }
            }
        }

        // Insert SVGs for Recommendation tab
        document.querySelectorAll('.guide-accordion-item.recommendation').forEach(function (item) {
            insertSvg(item, '.icon-recommendation-wrapper', 'icon-recom-data-name');
        });

        // Insert SVGs for General tab
        document.querySelectorAll('.guide-accordion-item.general').forEach(function (item) {
            insertSvg(item, '.general-icon-wrapper', 'icon-gen-data-name');
        });
    });


    //Tab Ordering Function
    // Get the tab order from the <code> element

    const tabOrderElement = document.getElementById('tabOrder');
    const tabOrderText = tabOrderElement.textContent.trim();

    // Parse the tab order text into an array
    const tabOrder = tabOrderText
        .replace(/[';\s]/g, '') // Remove quotes, semicolon, and spaces
        .split(','); // Split by comma

    // Only proceed if tabOrder is not empty
    if (tabOrder.length > 0) {
        // Get all tab buttons and contents
        const tabButtons = Array.from(document.querySelectorAll('.w-tab-link'));
        const tabContents = Array.from(document.querySelectorAll('.w-tab-pane'));

        // Collect all the data-tab-name values from the tab buttons
        const tabContainer = tabButtons.map(button => button.getAttribute('data-tab-name'));

        // Filter the tabOrder to only include tabs that exist in the tabContainer
        const filteredTabOrder = tabOrder.filter(tabName => tabContainer.includes(tabName));

        // Create an array for tabs in tabContainer but not in tabOrder
        const additionalTabs = tabContainer.filter(tabName => !tabOrder.includes(tabName));

        // Combine the filteredTabOrder with the additionalTabs
        const finalTabOrder = filteredTabOrder.concat(additionalTabs);

        // Function to reorder elements
        function reorderTabs(order) {
            const tabMenu = document.querySelector('.tour-guide-heading-wrapper');
            const tabContent = document.querySelector('.tabs-content');

            order.forEach(function (tabName) {
                const button = tabButtons.find(el => el.getAttribute('data-tab-name') === tabName);
                const content = tabContents.find(el => el.getAttribute('data-tab-name') === tabName);

                if (button && content) { // Ensure both button and content exist
                    tabMenu.appendChild(button);
                    tabContent.appendChild(content);
                }
            });

            // Introduce a small delay before clicking the first tab
            setTimeout(function () {
                const firstTabButton = tabButtons.find(el => el.getAttribute('data-tab-name') === finalTabOrder[0]);
                if (firstTabButton) {
                    firstTabButton.click();
                }
            }, 100); // Adjust the delay time (in milliseconds) if necessary
        }

        // Reorder tabs 
        reorderTabs(finalTabOrder);
    }

    // Tab Titles

    // Get the tabtitles from the code element

    //const tabtitles = JSON.parse(tabtitlesElement.textContent.trim());
    const tabtitlesElement = document.getElementById('tabtitles');

    // Check if tabtitlesElement exists and its text content is not empty
    if (tabtitlesElement && tabtitlesElement.textContent.trim()) {
        // Parse the JSON content
        const tabtitles = JSON.parse(tabtitlesElement.textContent.trim());
        // Collect all the tab names from .w-tab-link elements
        const tabTitleContents = new Set();
        document.querySelectorAll('.w-tab-link').forEach(tab => {
            const tabName = tab.getAttribute('data-tab-name');
            if (tabName) {
                const normalizedTabName = tabName.replace('Tab', '').toLowerCase(); // Normalize the tab name
                tabTitleContents.add(normalizedTabName);
            }
        });

        // Remove entries from tabtitles that do not exist in tabTitleContents
        Object.keys(tabtitles).forEach(key => {
            if (!tabTitleContents.has(key)) {
                delete tabtitles[key];
            }
        });

        // Loop through each tab link and set the text content
        document.querySelectorAll('.w-tab-link').forEach(tab => {
            const tabName = tab.getAttribute('data-tab-name');
            if (tabName) {
                const key = tabName.replace('Tab', '').toLowerCase();
                const headingElement = tab.querySelector('.heading-20sb');
                if (headingElement) {
                    const tabText = tabtitles[key] || key; // Use the key as default if no value is found
                    headingElement.textContent = capitalizeFirstLetter(tabText); // Capitalize the first letter
                }
            }
        });

        // Function to capitalize the first letter of a string
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        }

    }
});
