# Alfred Workflow: Discord Timestamps

Type `dt` followed by a natural language date/time to generate Discord timestamp formats. Select one to copy it to your clipboard.

```
dt tomorrow at 3pm
dt next friday
dt in 2 hours
```

## Install

Download the latest `.alfredworkflow` from [Releases](https://github.com/notjosh/alfred-workflow-discord-timestamps/releases) and double-click to install.

Requires Node.js 22+.

## Formats

Each query gives you 7 Discord timestamp variants to choose from:

| Format          | Example output                                              |
| --------------- | ----------------------------------------------------------- |
| Relative        | `<t:1707580800:R>` — "in 20 hours"                          |
| Full Date/Time  | `<t:1707580800:F>` — "Wednesday, February 10, 2026 3:00 PM" |
| Date/Time       | `<t:1707580800:f>` — "February 10, 2026 3:00 PM"            |
| Date            | `<t:1707580800:D>` — "February 10, 2026"                    |
| Short Date      | `<t:1707580800:d>` — "02/10/2026"                           |
| Time w/ Seconds | `<t:1707580800:T>` — "3:00:00 PM"                           |
| Time            | `<t:1707580800:t>` — "3:00 PM"                              |

## Development

```bash
pnpm install
pnpm run build
node dist/index.js "tomorrow at 3pm"  # test output
```

### Clock icons

Regenerate the 144 clock-face icons (one per 5-minute increment) used in Alfred results:

```bash
pnpm run generate-clock-icons
```

### Live development with Alfred

Symlink the project into Alfred's workflow directory, then run esbuild in watch mode:

```bash
pnpm link-workflow   # one-time: symlinks project into Alfred's workflows folder
pnpm dev             # rebuilds dist/index.js on every save
```

Now type `dt ...` in Alfred and it runs your local code. No restart needed — just save and re-trigger.

### Releasing

```bash
./scripts/bump-version-and-push-for-release.sh patch  # or minor, major
```

This bumps the version in `package.json` and `info.plist`, creates a git tag, and pushes. The GitHub Action builds and attaches a `.alfredworkflow` to the release.

## License

MIT — see [LICENSE.md](LICENSE.md).

`run-node.sh` is adapted from [alfy](https://github.com/sindresorhus/alfy) (MIT).
