# Deployment Runbook

This repository can prepare the static site artifact, but GitHub account
verification, repository Pages settings, DNS changes and HTTPS activation remain
manual operator actions.

## Required Manual Order

1. Purchase and control `brunomatos.dev`.

2. In the personal GitHub account settings, under Pages, verify the apex domain
   `brunomatos.dev`.

3. Follow GitHub's generated instructions to add the TXT verification record.
   Do not hard-code a fake TXT value in this documentation.

4. Keep the TXT verification record permanently.

5. In the `freelancer-calculator-pt` repository, open
   Settings -> Pages -> Build and deployment -> Source -> GitHub Actions.

6. In that repository's Pages settings, set the custom domain to
   `freelancerpt.brunomatos.dev`.

7. Only after the GitHub custom domain has been assigned, configure this DNS
   record with the domain provider:

   ```text
   Type:   CNAME
   Name:   freelancerpt
   Target: brunoramosdematos.github.io
   ```

   The target must not contain the repository name.

8. Do not create a wildcard DNS record.

9. Do not point `freelancerpt.brunomatos.dev` to `brunomatos.dev`.

10. Do not alter apex-domain DNS records for the calculator. The apex domain is
    reserved for the future personal website.

11. Wait for DNS validation and TLS certificate provisioning.

12. Enable "Enforce HTTPS" in the repository Pages settings when GitHub makes
    that option available.

13. Trigger the workflow through `workflow_dispatch` or re-run the latest
    workflow.

## Verification Examples

Windows:

```powershell
Resolve-DnsName -Type CNAME freelancerpt.brunomatos.dev
```

Unix-like systems:

```bash
dig freelancerpt.brunomatos.dev CNAME +short
```

HTTPS:

```bash
curl -I https://freelancerpt.brunomatos.dev/
```

The expected CNAME target is `brunoramosdematos.github.io`. A successful HTTPS
response should return an HTTP 200-class status with a valid TLS certificate
after GitHub Pages finishes provisioning the custom domain.
