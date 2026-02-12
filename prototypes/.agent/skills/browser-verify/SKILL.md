---
name: browser-verify
description: Verify designs in a real browser environment
---

# Browser Verify Skill

This skill allows the agent to verify the functionality and visual appearance of a web application in a real browser.

## Capabilities

1.  **Launch Browser**: Start a browser instance with access to the local development server.
2.  **Viewport Testing**: Test at standard breakpoints:
    *   Mobile: 375px
    *   Tablet: 768px
    *   Desktop: 1280px
3.  **Capture Evidence**: Take screenshots and record sessions (WebP) to document behavior.
4.  **DOM Inspection**: Read the DOM structure and computed styles to verify implementation details.
5.  **Interaction Testing**: Click elements, fill forms, and navigate to test user flows.
6.  **Console Logging**: Capture browser console logs to identify errors.

## Usage

When verifying a prototype:
1.  Ensure the dev server is running.
2.  Launch the browser to the target URL.
3.  Resize to the desired viewport.
4.  Perform interactions as needed.
5.  Capture a screenshot or recording.
6.  Check console logs for errors.
7.  If errors or visual issues are found, attempt to fix them before reporting to the user.
