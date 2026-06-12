# Incus Development Helper

`bin/incus_dev.py` manages persistent, unprivileged CTI-Transmute development
containers with [Incus](https://linuxcontainers.org/incus/).

Each Test Container:

- Uses Ubuntu 24.04.
- Has an isolated PostgreSQL database and Python environment.
- Bind-mounts a selected host worktree read-write.
- Immediately sees source-code changes.
- Runs CTI-Transmute automatically through systemd.
- Persists until explicitly destroyed.

The tool is registered as a console script, so `uv run incus-dev <command>` and
`./bin/incus_dev.py <command>` are equivalent.

## First-Time Setup

Install Incus first — this tool configures it but does not install it. See the
[Incus install guide](https://linuxcontainers.org/incus/docs/main/installing/).

Configure the host (adds you to the `incus-admin` group and runs
`incus admin init --minimal`):

`uv run incus-dev host setup`

The first run adds you to `incus-admin` and stops — log out and back in (or run
`newgrp incus-admin`), then run `host setup` again to finish.

Verify the configuration:

`uv run incus-dev host check`

Initialize the current worktree's submodules manually:

`git submodule update --init --recursive`

Build the reusable Runtime Base image:

`uv run incus-dev base rebuild`

Check the Runtime Base image:

`uv run incus-dev base status`

## Create Containers

Create a container using the current directory:

`uv run incus-dev create feature-a`

Create a container using a specific Git worktree:

`uv run incus-dev create feature-b /home/user/git/cti-transmute-feature-b`

Creation automatically:

1. Launches a fresh instance from the Runtime Base image.
2. Maps your host identity onto the container's `developer` user.
3. Mounts the selected worktree.
4. Runs uv sync --locked.
5. Creates a fresh database.
6. Applies migrations.
7. Creates the Development Admin.
8. Starts CTI-Transmute.
9. Prints the private container URL.

Default login:

Email:    admin@admin.admin
Password: admin

## Daily Usage

List all containers:

`uv run incus-dev list`

Show a container's URL, state, and mounted worktree:

`uv run incus-dev status feature-a`

Open a shell inside the container:

`uv run incus-dev shell feature-a`

The shell opens in /workspace/cti-transmute as the `developer` user.

View service logs:

`uv run incus-dev logs feature-a`

Follow logs continuously:

`uv run incus-dev logs -f feature-a`

## Start, Stop, and Restart

```
uv run incus-dev stop feature-a
uv run incus-dev start feature-a
uv run incus-dev restart feature-a
```

Containers persist while stopped.

## Refresh Dependencies and Migrations

After changing pyproject.toml, uv.lock, or database migrations:

`uv run incus-dev refresh feature-a`

This runs uv sync --locked, applies migrations, and restarts CTI-Transmute
without resetting the database.

Normal source changes appear immediately and do not require refresh.

## Destroy a Container

`uv run incus-dev destroy feature-a`

This permanently removes the container and its database. The host worktree is
unaffected.

## Rebuild the Runtime Base

After changing required system dependencies:

`uv run incus-dev base rebuild`

This republishes the `cti-transmute-base` image. Existing Test Containers are
unaffected; new containers pick up the change.

## Typical Workflow

```
git worktree add ../cti-transmute-feature-a feature-a
cd ../cti-transmute-feature-a
git submodule update --init --recursive

uv run incus-dev create feature-a "$PWD"

uv run incus-dev logs -f feature-a
uv run incus-dev shell feature-a
uv run incus-dev destroy feature-a
```
