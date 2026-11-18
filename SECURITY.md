# Security and deployment model

Openform is a single-owner application without a built-in authentication system. Default local development and Docker bindings use localhost. Do not expose administrative routes publicly without authentication at your reverse proxy.

Protect the owner workspace and **all** `/api/forms` routes. Respondents need public form pages, `/api/public/forms/*`, and required static assets. Use HTTPS. Someone who can reach the administrative API can read or delete all forms and responses.

GitHub Pages hosts a browser-local demonstration. Sharing embeds the form definition in its URL; the link is an immutable copy and cannot be remotely revoked. Do not put secrets into questions. Demo answers stay in the respondent's browser and are not sent to a form owner.

Keep database files, backups, environment variables, and credential files out of Git. Use tested SQLite backups and a documented retention policy for real submissions.

For a suspected vulnerability, avoid publishing respondent data or working exploit credentials in an issue. Use GitHub private vulnerability reporting if the repository has enabled it; otherwise contact the owner privately through their published contact channel. Private reporting is not assumed to be enabled automatically.
