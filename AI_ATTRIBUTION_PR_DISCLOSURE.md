# AI Attribution in Pull Request Descriptions

**Date:** 2025-10-18  
**Maintainer:** thisis-romar

## Purpose

Document actionable findings and recommendations for embedding explicit AI attribution into pull request (PR) descriptions so reviewers gain transparent context around AI-assisted work.

## Research Synthesis

- Community guidance now treats AI disclosure as a baseline courtesy. DigitalOcean recommends contributors "disclose how AI contributed to your pull request and link process context" and even provides a reusable disclosure block for PRs ([DigitalOcean, 2025](https://www.digitalocean.com/community/tutorials/ai-coding-tools-open-source)).
- GitHub’s AI Skills Series highlights concrete examples of “good AI disclosure” in PR messages, underscoring that maintainers expect specifics (tool, scope, human review) rather than vague statements ([GitHub Community, 2025](https://github.com/orgs/community/discussions/168984)).
- Ghostty (a high-visibility OSS project) merged policy PR #8289 requiring contributors to disclose AI tooling so maintainers can triage reviews efficiently and avoid "AI slop"; trivial tab completion is explicitly exempted ([Ghostty PR #8289, 2025](https://github.com/ghostty-org/ghostty/pull/8289)).
- Red Hat’s governance guidance stresses keeping records of AI-generated code, aligning with licensing/compliance policy, and establishing internal attribution norms—evidence that enterprise-grade workflows already treat disclosure as part of secure SDLC ([Red Hat Blog, 2025](https://www.redhat.com/en/blog/when-bots-commit-ai-generated-code-open-source-projects)).

## Why PR-Level AI Attribution Matters

1. **Reviewer Efficiency:** Disclosure signals when human reviewers should scrutinize logic more deeply (Ghostty precedent cited above).
2. **Traceability:** Linking session IDs or chat exports gives auditors a trail from commit history to the collaborative AI process (DigitalOcean and Red Hat sources).
3. **Community Norms:** GitHub community examples show shared expectations: precise, honest descriptions foster trust and faster approvals.
4. **Policy Alignment:** Explicit statements mitigate legal/licensing risk and demonstrate responsible AI practices for downstream users (Red Hat guidance).

## Implementation Recommendations

1. **Add PR Attribution Section:** Place an "AI Attribution" header near the top of every PR description. Include:
   - Model, provider, and session identifier
   - Scope of AI assistance (code, docs, debugging, planning)
   - Verification statement confirming human review and testing
   - Optional link to sanitized chat export or summary
2. **Update PR Template:** Embed the block shown below and require contributors to complete it or mark `N/A` when AI was not meaningfully involved.
3. **Define Thresholds:** Document that trivial, single-token completions do not require disclosure, mirroring Ghostty’s policy.
4. **Cross-Reference Commits:** Note that commit messages already carry AI attribution (per GIT-ATT-001); the PR block summarizes it for reviewers.
5. **Archive Evidence:** Store chat transcripts or summaries in the repository’s documentation area (or linked secure storage) to satisfy Red Hat’s governance guidance.

## Proposed PR Template Block

```markdown
## AI Attribution
- Tools: GitHub Copilot (copilot/claude-sonnet-4.5), Sequential Thinking MCP
- Session: c812e609-19bc-465a-bf17-c6136c8fd820 (chat summary: internal link)
- Scope: AI drafted initial implementation for outputFile/preview; human refactored, added tests, authored docs
- Verification: Manual review + `npx ts-node test-mcp-tools.ts` (7/7 passing)
- Notes: Trivial completions excluded per policy; chat export sanitized before sharing
```

## Risk Considerations and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Oversharing sensitive logs | Leaks internal links or secrets | Provide short summaries; host sanitized exports in controlled repo |
| Attribution fatigue (too verbose) | Reviewers ignore block | Keep to 5 bullet lines max; link to extended detail separately |
| Ambiguous disclosure threshold | Inconsistent reporting | Mirror Ghostty guidance: disclose any non-trivial generation or AI-authored text |
| Compliance gaps | Legal/licensing exposure | Maintain archive of AI-assisted artifacts and tie to commit attribution (Red Hat guidance) |

## Next Steps

1. Update `.github/PULL_REQUEST_TEMPLATE.md` with the AI Attribution block and checkbox enforcement.
2. Amend `CONTRIBUTING.md` with disclosure expectations and trivial-completion exemption examples.
3. Add CI or pre-PR lint (optional) that warns when the AI Attribution section is missing.
4. Backfill AI attribution on any open PRs lacking the block.
5. Schedule quarterly reviews of stored chat exports to ensure continued compliance.

## References

- DigitalOcean Community, "How to Be an Open Source Hero: Contributing AI-Generated Code with Care," Oct 10, 2025. <https://www.digitalocean.com/community/tutorials/ai-coding-tools-open-source>
- GitHub Community, "Perfect your pull request and disclose you’ve used AI (AI Skills Series - Week Two)," Aug 6, 2025. <https://github.com/orgs/community/discussions/168984>
- Mitchell Hashimoto, "AI tooling must be disclosed for contributions," Ghostty Pull Request #8289, Aug 19, 2025. <https://github.com/ghostty-org/ghostty/pull/8289>
- Huzaifa Sidhpurwala, "When bots commit: AI-generated code in open source projects," Red Hat Blog, Apr 1, 2025. <https://www.redhat.com/en/blog/when-bots-commit-ai-generated-code-open-source-projects>
