# Isaac Suttell

Software and infrastructure engineer building open-source AI-agent systems at [Zaks.io](https://zaks.io).

I spent ten years at PlayStation Studios, where I built and operated SHIPwatch from its initial implementation into release-critical video infrastructure used by more than 15 first-party studios. It processed more than 10,000 videos a month with 99.9% availability, and I grew from its sole developer into technical lead for a seven-person team.

Now I am working on the evidence and control layers for increasingly autonomous software development. I want to know what agents are doing at scale, where they fail, and whether a change actually improves the system.

## Current work

- [Trace Flow](https://trace-flow.dev) ingests coding-agent transcripts and makes tool use, cost, latency, and workflow behavior inspectable.
- [Splitch](https://github.com/zaks-io/splitch) provides feature flags and A/B experimentation for humans and agents.
- [Agent Paste](https://github.com/zaks-io/agent-paste) publishes agent-built output to stable human-readable URLs and machine-readable manifests.
- [Insecur](https://github.com/zaks-io/insecur) lets agents and CI use credentials at runtime without exposing them to prompts, logs, or files.

The common thread is observability and reliability. The same instrumentation also supports classifiers and analysis agents.

## This repository

This is the source for [isaacsuttell.com](https://isaacsuttell.com), including older WebGL experiments and photography work alongside my current professional profile. It is a TypeScript monorepo built with Next.js, React, Convex, Tailwind CSS, Turborepo, and Bun.

## Development

```bash
bun install
bun run dev
```

The standard checks are:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run build
```

## Links

- [Personal site](https://isaacsuttell.com)
- [Zaks.io](https://zaks.io)
- [Zaks.io on GitHub](https://github.com/zaks-io)
- [LinkedIn](https://www.linkedin.com/in/isuttell/)

## License

MIT
