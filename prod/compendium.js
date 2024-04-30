// Generate UUID for use with `data-w-id`
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Function to wait for certain query selectors before running a callback
const startObservingElements = ({ selectors, callback }) => {
    const observer = new MutationObserver((_mutations, obs) => {
        let foundSelectors = [];

        selectors.forEach((selector) => {
            const element = $(selector);  // Using jQuery to select the element
            if (element.length > 0 && !foundSelectors.includes(selector)) {
                foundSelectors.push(selector);
                if (foundSelectors.length === selectors.length) {
                    callback();
                    obs.disconnect();  // Disconnect the observer after the callback is triggered
                }
            }
        });
    });

    observer.observe($('body')[0], {
        childList: true,
        subtree: true,
    });
};

const truncateString = (str, maxLength) => {
    return str.length <= maxLength ? str : str.slice(0, maxLength - 3) + '...';
};

const runFooterYear = () => {
    const currentYearInfo = $('#current-year-text-info');  // jQuery for DOM selection
    if (currentYearInfo.length) {
        currentYearInfo.text(new Date().getFullYear());
    }
};

const runFn = async () => {
    const compendium = $('code#json-compendium').text();  // jQuery for getting text
    const ctaDetails = $('code#json-cta').text();
    const mainWrapper = $('.main-wrapper');
    const allTabs = [1, 2, 3].map(dwt => mainWrapper.find(`[data-w-tab="Tab ${dwt}"]`));

    const [toursTab, recommendationsTab, generalsTab] = allTabs;

    allTabs.forEach(at => {
        Object.entries({ add: 'mouseenter', remove: 'mouseleave' }).forEach(([action, event]) => {
            at.on(event, function () {  // jQuery event binding
                if ($(this).attr('aria-selected') !== 'true') {
                    $(this).toggleClass('w--current', action === 'add');
                }
            });
        });
    });

    toursTab.click();
    runFooterYear();

    // Assuming additional functionality follows similar conversions to jQuery.
    // Implement additional functionality as needed.

    // Use JSON.parse safely
    const parseJson = (jsonString) => {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return null;  // return null or handle as needed
        }
    };

    const compendiumData = parseJson(compendium);
    const ctaData = parseJson(ctaDetails);

    // Use compendiumData and ctaData as needed for further operations
};

startObservingElements({
    selectors: [
        'div#w-tabs-0-data-w-pane-1',
        'code#json-compendium',
        'code#json-cta'
    ],
    callback: runFn
});
