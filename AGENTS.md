# AGENTS.md             

This file provides guidelines for AI agents and coding assistants when working with code in this repository

## Scope

- These guidelines applies to the entire `tijaratk-api` project.

## Tech stack and tooling

- This is a TypeScript Node.js API (NestJS-style layout under `src/`).
- Use `yarn` as the package manager (a `yarn.lock` file is present).
- When adding or updating scripts, keep them consistent with existing entries in `package.json`.

## Code style and structure

- Follow the existing patterns in `src/` for module structure, dependency injection, and file naming.
- Always add swagger docs to new routes.
- Prefer descriptive variable and function names over abbreviations.
- Keep functions and classes focused; avoid unnecessary complexity or over-engineering.
- On defining entities with relations, always use `Relation<Post[]>` instead of `Post[]`. 

## Editing and files

- Keep changes minimal and targeted to the user’s request.
- Do not rename or move files unless explicitly required to satisfy the request.
- Avoid making cross-cutting refactors without clear user direction.

## Testing and verification

- When possible, run existing tests relevant to the changes (for NestJS projects this is often `yarn test` or `yarn test:e2e`).
- If you cannot run tests, reason carefully about correctness and highlight any assumptions in your final message.

## Dependencies and tooling changes

- Do not add new dependencies unless they are necessary to satisfy the request.
- If a new dependency is required, prefer small, well-maintained libraries and explain why they are needed in your final message.

## Communication with the user

- Be concise and direct; avoid long explanations unless the user asks for more detail.
- When making non-trivial changes, briefly summarize what you changed and where (file paths and key symbols).
- If you encounter unclear requirements, ask for clarification instead of guessing behavior that could affect production logic.

## Ask Before 

- package installs and dependencies updates
- git push, pull, merge
- deleting files, chmod
- running full build

**Always read & summarize before proposing a clear plan and write your plan in a markdown file and then ask before implementation / committing.**
**Write your plan in a markdown file in `.docs/plans` directory in this format `resource_name-action-description.md` and then ask before implementation / committing.**