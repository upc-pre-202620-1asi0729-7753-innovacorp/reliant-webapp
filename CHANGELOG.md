# Changelog

All notable changes to the Reliant Web Application are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-11-13
### Added
- Connection to the Reliant Platform REST API (JWT sign-in and sign-up, roles, nested equipment resources, components per customer, recuperation completion, reading ingestion, session completion and abortion); problem details from the platform are shown to the user.
- Reliant brand theme and grouped side navigation.
- Quick start: plant checklist and one-click, idempotent provisioning of the FESA demo plant (HVOF system, subsystems, controller, recipe, customer, component, recuperation order) that starts a spray session.
- Operations dashboard with live KPIs, recent sessions, sessions by status and fault cases by parameter.
- Process Monitoring: Live/Trends tabs, reading and burst simulation, session analysis with statistics per parameter, normalized deviation chart, deviations, fault cases, CSV export.
- Fault Diagnosis: fault case list and detail with acknowledgement and resolution, diagnosis rules administration.
- Reporting: report template builder with live preview, PDF generation (jsPDF) from the session, generated report registry.
- Sign-up preselects the organization type requested by the landing page call-to-actions.

### Changed
- Dashboard chart preferences are kept in the browser instead of the mock API.
- Footer flows below the page content.

### Removed
- Mock API (json-server) endpoints for IAM, equipment parts, process readings and user preferences; Billing is hidden until the platform supports it.

## [1.0.1] - 2026-10-04
### Added
- Azure Static Web Apps SPA fallback rule.

### Changed
- Production environment now points to the deployed mock API.

## [1.0.0] - 2026-10-04
### Added
- Navigation shell, language switcher (EN/ES) and footer.
- Traceability: customers, components and recuperation orders.
- Equipment: HVOF systems, controllers, subsystems, parts and recipes with threshold bands.
- Process Monitoring: spray session start, live readings by band, complete/abort, session history with filters.
- IAM: organization sign-up, sign-in, session, role management and segment-based access.
- Billing: plan selection and subscription status.
