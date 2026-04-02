# Contributing to EchoNet

First off, thank you for considering contributing to EchoNet! It’s people like you that make EchoNet such a great community platform.

This document serves as a set of guidelines for contributing to the EchoNet repository. 

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please ensure that all interactions with other contributors are respectful, constructive, and inclusive.

## How Can I Contribute?

### Reporting Bugs
This section guides you through submitting a bug report for EchoNet. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

1. **Check existing issues**: Use the search feature on GitHub to see if someone has already reported the issue. If it has been reported, feel free to add a comment with your own findings instead of creating a new issue.
2. **Open a new issue**: Clearly describe the issue including:
    - Steps to reproduce the behavior.
    - Expected behavior.
    - Actual behavior.
    - Screenshots or logs (if applicable).
    - Environment details (Browser, OS, Node.js version).

### Suggesting Enhancements
Enhancement suggestions are tracked as GitHub issues. When creating an enhancement issue, please describe:
1. The problem or missing feature.
2. Your proposed solution or how you think the feature should work.
3. Relevant use cases that this feature would support.

### Pull Requests
The process described here has several goals:
- Maintain EchoNet's code quality and architecture.
- Fix problems that are important to users.
- Engage the community in working towards the best possible product.

Please follow these steps to have your contribution considered by the maintainers:
1. Fork the repository and clone it locally.
2. Create a new branch from `main` (`git checkout -b feature/your-feature-name` or `bugfix/issue-description`).
3. Set up the development environment as detailed in the [README.md](README.md).
4. Make your changes in your local branch.
5. Ensure any new features are accompanied by relevant tests (if testing is configured) and that the code passes existing linting rules.
6. Commit your changes with clear and descriptive commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification.
7. Push your branch to your fork (`git push origin feature/your-feature-name`).
8. Open a Pull Request against the `main` branch of the original repository.
9. Provide a comprehensive description of the changes in your Pull Request description.

## Development Setup

To build the project locally, you will need `Node.js` (v18+) and `pnpm`.

1. Clone your fork of the repository: `git clone https://github.com/shakil-ahmed-billal/EchoNet.git`
2. Run `pnpm install` in both `frontend` and `backend` directories.
3. Follow the Local Setup guide in the `README.md` to configure environment variables and database connections.
4. Run the frontend and backend servers concurrently for local development.

## Styleguides

### Git Commit Messages
- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Limit the first line to 72 characters or less.
- Follow the formatting: `type(scope): subject` (e.g., `feat(auth): implement google login`).

### TypeScript / Next.js / Express
- Ensure strict typing where possible. Avoid `any`.
- Keep components modular and reusable.
- Extract complex business logic to dedicated services or helper utilities.

### Pull Request Review Process
- Reviews usually happen within a few days. 
- You may be asked to make structural or stylistic changes.
- Once approved, a maintainer will merge your Pull Request!

Thank you for contributing!
