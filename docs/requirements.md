# Requirements — Wheel of Meeting

> **Note on provenance:** reverse-engineered from the running application and
> its Gherkin acceptance scenarios (`tests/features/`), not written ahead of
> implementation. Status columns reflect the AI Unified Process documentation
> workflow (every linked use case currently starts as **Draft** — see
> `docs/use_cases/`), not the live deployment state: the application is in
> production today. See [glossary.md](glossary.md) for term definitions.

## Functional Requirements

| ID     | Title                          | User Story                                                                                                                                                                    | Priority | Status |
| ------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| FR-001 | Switch Dataset                 | As a user, I want to switch between the Partners and Lead Developers datasets so that I can run independent wheels for each dataset.                                          | High     | Open   |
| FR-002 | Spin for a Fair Selection      | As a user, I want the wheel to select an invitee at random while avoiding invitees I have met recently so that meetings are spread evenly across the dataset.                 | High     | Open   |
| FR-003 | Schedule the Meeting           | As a user, I want to be offered meeting-slot proposals and download an invite for the winner so that I can schedule the 1:1 without leaving the app.                          | High     | Open   |
| FR-004 | Review Meeting History         | As a user, I want to see a "Recently Met" list ordered by recency so that I know who I have met without checking my calendar.                                                 | Medium   | Open   |
| FR-005 | Clear Meeting History          | As a user, I want to clear a dataset's meeting history so that I can start fresh without affecting the other dataset.                                                         | Medium   | Open   |
| FR-006 | Exclude Invitees From a Domain | As a user, I want invitees from an excluded domain to never appear or be selected so that I do not accidentally schedule 1:1s outside the intended audience.                  | High     | Open   |
| FR-007 | Show Readable Display Names    | As a user, I want the app to show a display name instead of a raw email address so that the wheel and lists are easy to read, while the invite still uses the real email.     | Medium   | Open   |
| FR-008 | Keep Datasets Disjoint         | As a user, I want a Partner never to appear among the Lead Developers and a Lead Developer never among the Partners so that each wheel only offers the right kind of invitee. | High     | Open   |

## Non-Functional Requirements

| ID      | Title                      | Requirement                                                                                                                                                                    | Category        | Priority | Status |
| ------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | -------- | ------ |
| NFR-001 | Zero-Dependency Runtime    | The production application must ship as exactly one HTML file, one CSS file, and one JavaScript file, with zero runtime npm dependencies.                                      | Maintainability | High     | Open   |
| NFR-002 | Data-Fetch Resilience      | When a dataset's invitee data cannot be loaded at startup, the application must still finish loading and must retain 100% of that dataset's previously stored meeting history. | Availability    | High     | Open   |
| NFR-003 | Spin Lockout Timing        | The Spin button must stay disabled for the full 4500 ms spin animation and re-enable immediately once it completes, so overlapping spins are impossible.                       | Usability       | Medium   | Open   |
| NFR-004 | Single-User Access Control | Exactly one authorized user identity may invoke the deployed service; every other caller must be denied by the platform's access control.                                      | Security        | High     | Open   |
| NFR-005 | State Persistence Fidelity | The active dataset selection and meeting history must survive a full page reload with 100% fidelity under the current schema version.                                          | Availability    | Medium   | Open   |

## Constraints

| ID    | Title                  | Constraint                                                                                                                                                                                                 | Category    | Source | Priority | Status |
| ----- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------ | -------- | ------ |
| C-001 | No Build Step          | The production application must run as plain HTML/CSS/JS loaded directly by the browser, with no bundler, transpiler, or TypeScript compiler.                                                              | Technical   |        | High     | Open   |
| C-002 | No Frontend Framework  | The UI must be implemented in vanilla JavaScript and the DOM, with no frontend framework (React, Vue, Svelte, or similar).                                                                                 | Technical   |        | High     | Open   |
| C-003 | Deployment Platform    | The application must be deployed as a static site served by nginx on Google Cloud Run, built via the existing Dockerfile and GitHub Actions pipeline.                                                      | Technical   |        | High     | Open   |
| C-004 | Invitee Data Storage   | Each dataset's invitee data file must never be committed to the repository or baked into the container image; it must be stored in GCP Secret Manager and mounted into the container at runtime.           | Operational |        | High     | Open   |
| C-005 | Single Authorized User | Only the user's configured account may invoke the deployed service; access is enforced by the platform's identity and access management, outside the application.                                          | Operational |        | High     | Open   |
| C-006 | Browser Support        | The application targets modern evergreen browsers only; no polyfills or legacy browser support are provided.                                                                                               | Technical   |        | Medium   | Open   |
| C-007 | Testing Toolchain      | Automated tests must drive a real browser with Playwright; Gherkin feature files describe the scenarios but are not executed by a Cucumber runner — each is manually paired with one Playwright spec file. | Technical   |        | Medium   | Open   |

> **FR-008 is not implemented yet.** The current code loads each dataset file
> independently and does not detect an email address that appears in both.
> Implementing it needs a decision on what the system does when it finds an
> overlap (see UC-001 BR-005).
