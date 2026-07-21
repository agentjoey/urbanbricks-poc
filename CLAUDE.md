@AGENTS.md

<!-- pact:begin (managed by pactify — edit outside this block) -->
# pact protocol — seat `lead`

This repo uses the **pact protocol** (v1). You are seat `lead`, roles: orchestrator.

**Primary — MCP:** the `pact` MCP server is wired into your config. Use its tools
(projects / status / join / assign / checkpoint / accept / changes / merge / validate) and
resources (`pact://state`, `pact://log`). Cold start: call `status`, then `join`
(registers your seat and checks out your feature branch). Every action tool takes an
optional `project` (a name from `projects`) to act on another registered repo without
restarting — default is this repo.

**Fallback — shell** (if MCP is unavailable):
```bash
export PACT_AGENT_ID=lead
pactify join lead --roles orchestrator
```
then `pactify help` for the verbs.

**The two rules:** a worker cannot self-accept (only the task's reviewer accepts); a
feature cannot merge until all its tasks are accepted.
<!-- pact:end -->
