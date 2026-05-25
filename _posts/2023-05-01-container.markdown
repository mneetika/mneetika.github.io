---
layout: single
comments: true
title: "Containers from First Principles"
date: 2023-01-28 00:00:00-0000
categories: [Cloud]
tags: [containers, linux, docker, kubernetes, namespaces, cgroups]
---

Container fundamentals are presented below from operating-system basics upward.

## Program vs Process

A **program** is code stored on disk.
A **process** is that program while it is running.

When a process runs, the OS gives it:

- CPU time
- memory
- file descriptors
- network access
- process ID (PID)

So the core unit of work in Linux is not a container. It is a process.

## Why Containers Were Needed

Suppose two applications need different versions of the same dependency.
Running both on one host becomes painful:

- library version conflicts
- port conflicts
- unpredictable environment differences

Containers solve this by giving each application its own isolated runtime view, while still sharing the host kernel.

## What an Image Is

Before a container starts, a template for its filesystem is required.
That template is called an **image**.

An image contains:

- base OS userspace files (for example Debian/Alpine files)
- application binary or source build output
- runtime config (entrypoint/CMD, env defaults)

Important: an image is not a running thing.
It is a packaged, read-only template.

## What Root Filesystem Means

Every process resolves file paths from a root `/`.

On the host machine, `/` means host root.
Inside a container, `/` points to the container root filesystem built from the image.

That is why `/etc`, `/usr`, `/app` inside a container can be different from the host.

## What a Container Actually Is

Definition:

A container is a Linux process started with:

- a root filesystem from an image
- isolated system views (namespaces)
- resource limits (cgroups)
- restricted privileges (capabilities/seccomp)

So: container = process + isolation + limits + rootfs.

## How a Container Starts

Startup lifecycle:

1. get image layers from registry/local cache
2. assemble root filesystem from those layers
3. create namespaces for isolation
4. configure cgroups for resource limits
5. apply security restrictions
6. start entrypoint process (usually PID 1 inside container)

Who does this?

- higher-level runtime management: `containerd` (or equivalent)
- low-level process setup: `runc` (or equivalent OCI runtime)
- application itself: entrypoint/CMD process

## Isolation with Namespaces

Namespaces change what a process can see.

### `pid`
Gives a separate process tree view.
Process listing inside a container is therefore namespace-scoped, and PID 1 behavior directly affects lifecycle management.

### `mnt`
Gives a separate mount/filesystem view.
Host files remain hidden unless they are mounted explicitly into the container namespace.

### `net`
Gives separate interfaces, routes, and ports.
Each container receives an isolated network context, including its own interface and routing view.

### `uts`
Gives separate hostname/domain.
This supports workload-level identity and cleaner host/container diagnostics separation.

### `ipc`
Isolates shared memory and IPC objects.
Isolation of IPC resources prevents unintended cross-application interaction.

### `user`
Maps UID/GID differently.
UID/GID remapping strengthens privilege boundaries between container and host contexts.

## Resource Control with cgroups

cgroups limit and account resource usage.

### Memory
- hard limits can trigger OOM kill when exceeded
- protects host from one process consuming all RAM

### CPU
- quota/period limits total CPU time
- shares control relative fairness during contention

### PIDs
- caps process count to avoid runaway forks

### I/O
- can throttle disk bandwidth/IOPS

Without cgroups, namespaces isolate visibility but do not prevent resource starvation.

## Container Networking in Practice

In bridge mode, typical packet path is:

1. app listens on container port (for example `80`)
2. container connects to bridge via veth pair
3. host forwarding/NAT maps host port to container port

Example: `-p 8080:80` maps host `8080` to container `80`.

Common bug: app binds `127.0.0.1` inside container, so external traffic cannot reach it. Use `0.0.0.0` when external access is required.

## How Apps Run Inside the Container

The entrypoint process is the main process, often PID 1 in that namespace.

If PID 1 does not handle signals (`SIGTERM`) or reap child processes:

- shutdown becomes unreliable
- zombie processes can accumulate
- orchestrated rollouts become unstable

That is why minimal init wrappers (`tini`) are common.

## Quick Validation Commands

{% highlight bash %}
docker run --rm -d --name demo nginx:alpine
docker exec demo sh -c 'echo "inside pid is $$"; ps -ef'
ps -ef | grep nginx
lsns
{% endhighlight %}

For networking checks:

{% highlight bash %}
docker network ls
docker network inspect bridge
ss -lntp
ip a
ip route
{% endhighlight %}

For memory limit behavior:

{% highlight bash %}
docker run --rm -m 128m --memory-swap 128m \
  progrium/stress --vm 1 --vm-bytes 256M --vm-hang 1
{% endhighlight %}

## Optional: Build a Minimal Container Environment on Ubuntu

To observe primitives directly (without Docker abstraction):

{% highlight bash %}
sudo apt update
sudo apt install -y debootstrap util-linux
sudo debootstrap --variant=minbase noble ~/mini-rootfs http://archive.ubuntu.com/ubuntu/
sudo unshare --fork --pid --mount --uts --ipc --net --mount-proc \
  chroot ~/mini-rootfs /bin/bash
{% endhighlight %}

Inside that shell:

{% highlight bash %}
ps -ef
hostname mini-container
ls /
{% endhighlight %}

The resulting shell shows namespace-scoped process and filesystem views directly.

## Closing

Containers are not miniature machines.
They are carefully isolated Linux processes.

Understanding process, rootfs, namespace, cgroup, and PID 1 behavior makes Docker and Kubernetes behavior predictable.
