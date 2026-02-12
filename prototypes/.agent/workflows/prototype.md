---
description: Rapid UI prototyping with browser verification
---

1.  **Clarify Scope**: Ask the user to describe what they want to build (e.g., "signup flow with email validation"). Keep it brief (< 30 seconds).
2.  **Check Storybook**: Use `storybook-crawl` to check for existing components that match the requirements. If matches are found (>80%), reuse them.
3.  **Build Prototype**:
    *   **Layout**: Create the structure using semantic HTML and CSS.
    *   **Interaction**: Add interactivity with React state and event handlers.
    *   **Polish**: Refine visuals using `frontend-design` principles (if active). Use `realistic-content` for data.
4.  **Verify**: use `browser-verify` to launch a browser, test at mobile/tablet/desktop viewports, and capture screenshots/recordings.
5.  **Present**: Show the user the results (screenshots/recordings) and a summary of what was built.
