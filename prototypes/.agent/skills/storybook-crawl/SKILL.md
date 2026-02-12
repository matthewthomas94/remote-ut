---
name: storybook-crawl
description: Discover and reuse existing Storybook components
---

# Storybook Crawl Skill

This skill allows the agent to discover and reuse existing components from a Storybook instance.

## Capabilities

1.  **Detect Storybook**: Check if a Storybook instance is running or configured.
2.  **Crawl Components**: Navigate the Storybook UI to list available components and their stories.
3.  **Match Components**: Compare requested features with existing components.
    *   **Threshold**: Use an >80% match threshold.
    *   **Props Inspection**: Analyze component props to determine suitability.
4.  **Extract Usage**: Get import paths and example usage code.

## Usage

Before building a new component:
1.  Check if Storybook is available.
2.  Search for components that match the user's requirements.
3.  If a match is found (>80%), use the existing component.
4.  If no match is found, proceed to build a custom component.
