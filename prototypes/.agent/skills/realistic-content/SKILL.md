---
name: realistic-content
description: Generate domain-appropriate realistic content
---

# Realistic Content Skill

this skill ensures that prototypes use realistic data instead of placeholders like "Lorem Ipsum".

## Guidelines

1.  **Domain Specificity**: Generate content that matches the specific industry or domain of the application (e.g., Fintech, Healthcare, E-commerce).
2.  **No Placeholders**: Strictly ban "Lorem Ipsum", "John Doe", "Jane Doe", "$XX.XX", etc.
3.  **Content Variety**:
    *   **Length**: specific short and long variations to test layout resilience.
    *   **Data Types**: Use realistic names, dates, currency formats, and addresses.
4.  **Images**: Use high-quality, relevant images from sources like Unsplash. Do not use grey placeholder boxes.

## Usage

When populating components:
1.  Identify the domain of the application.
2.  Generate a JSON dataset with realistic values.
3.  Use this dataset to populate props or state in the prototype.
