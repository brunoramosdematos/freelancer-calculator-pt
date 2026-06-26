# Security Policy

## Supported Version

Security maintenance targets the `main` branch and the production deployment at
https://freelancerpt.brunomatos.dev/.

## Reporting A Vulnerability

Please report suspected vulnerabilities privately through GitHub security
advisories when available, or by contacting the repository maintainer through a
private channel listed on the GitHub profile. Do not disclose exploitable
details publicly until the issue has been triaged.

Include:

- affected URL or package when known;
- reproduction steps;
- browser and device when relevant;
- impact assessment;
- any safe proof of concept that does not expose private user data.

Do not send private tax documents, bank records or personal financial data.

## Dependency Audit Policy

The project has a production dependency audit gate:

```bash
npm run audit:prod
```

It must remain clean for production dependencies. CI also runs:

```bash
npm run audit:critical
```

This blocks critical findings while allowing known development-tooling findings
to be remediated in focused executions.

Historical dependency audit and remediation reports live under
`docs/security/`.

## Known Residual Risk

The complete development dependency tree can contain moderate or high findings
from build, test or lint tooling. Those findings are tracked separately from
the production dependency gate and should be remediated without changing fiscal
behavior.

## Triage Process

Reports are reviewed for reproducibility, affected surface, dependency path and
production impact. Fixes should include validation commands and should not
weaken audit gates, tests or production verification.
