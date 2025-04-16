# FreeGuides Web Platform

FreeGuides is a web platform that helps hotels and accommodations extend their relationship with guests beyond the lobby and into the real world. This repository contains the core JavaScript functionality that powers the FreeGuides profile pages.

![image](https://github.com/user-attachments/assets/26f4a885-1287-4985-8a87-62985c9ffbf1)

## Overview

The platform provides an interactive, responsive interface for hotels to showcase:
- Tours and activities
- Local recommendations
- General information
- Partner services
- Interactive guides

## Project Structure

```
freeguides-web/
├── prod/
│   ├── compendium.js    # Core functionality and UI interactions
│   ├── services.js      # Partner services integration
│   ├── activity.js      # Activity-related features
│   └── branding.js      # Branding and styling utilities
```

## Key Features

### Core Functionality (compendium.js)
- Tab management system
- Accordion functionality
- Dynamic content loading
- Mobile responsiveness
- Footer updates
- UUID generation for unique identifiers

### Services Integration (services.js)
- Dynamic partner service tabs
- Service content management
- Tab attribute handling
- Mutation observer implementation

### Activity Management (activity.js)
- Activity tracking
- User interaction handling
- Content organization

### Branding (branding.js)
- Style management
- Theme customization
- Visual consistency

## Technical Implementation

### Data Flow
1. JSON data embedded in HTML
2. Scripts parse and process data
3. Dynamic UI element creation
4. Content organization into tabs/accordions
5. Partner service integration

### Mobile Responsiveness
- Adaptive CTA buttons
- Responsive tab behavior
- Mobile-optimized layouts
- Touch-friendly interactions

### Event Handling
- Tab click events
- Accordion interactions
- Window resize events
- Dynamic content loading
- Mutation observers

## Usage

### Basic Implementation
```html
<!-- Required HTML Structure -->
<div class="main-wrapper">
    <!-- Tab Navigation -->
    <div class="tabs-content w-tab-content">
        <!-- Tab Content -->
    </div>
    
    <!-- Data Elements -->
    <code id="json-compendium">
        <!-- JSON data -->
    </code>
    <code id="json-cta">
        <!-- CTA data -->
    </code>
    <code id="highlights">
        <!-- Highlights data -->
    </code>
</div>

<!-- Script Includes -->
<script src="prod/compendium.js"></script>
<script src="prod/services.js"></script>
<script src="prod/activity.js"></script>
<script src="prod/branding.js"></script>
```

### Required Data Structure
```json
{
    "general": [
        {
            "icon": "icon-name",
            "active": true,
            "title": "Section Title",
            "media": {}
        }
    ],
    "recommendations": [
        {
            "icon": "icon-name",
            "active": true,
            "title": "Recommendation Title",
            "media": [
                {
                    "active": true,
                    "content": "content-id"
                }
            ]
        }
    ],
    "recommendEnabled": true
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Dependencies

- jQuery (for DOM manipulation)
- Webflow (for base styling and interactions)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

Copyright © FreeGuides. All rights reserved.
