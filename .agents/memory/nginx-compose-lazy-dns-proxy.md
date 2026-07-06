---
name: nginx reverse proxy in Docker Compose needs lazy DNS resolution
description: static proxy_pass to a Compose service name resolves DNS once at nginx startup and can fail hard; use a variable + resolver for lazy per-request resolution.
---

When nginx (in a Docker Compose service) reverse-proxies to another Compose service by name (e.g. `proxy_pass http://api-server:8080;`), nginx resolves that hostname **once, at config-load/startup time**, using the container's OS resolver. If the target service's DNS entry isn't resolvable at that exact moment, nginx refuses to start at all with `host not found in upstream "..."` — not just a warning, a fatal boot failure.

**Why:** This bit us deploying a pnpm-monorepo web+api app to Coolify: the website container's nginx proxied `/api/` to the api-server container by Compose service name. It worked in ad-hoc testing but is fragile to startup ordering/timing, and fails outright in isolated test environments where the upstream container doesn't exist yet on the network.

**How to apply:** Make nginx resolve the upstream lazily per-request instead of once at startup:
```nginx
resolver 127.0.0.11 valid=10s;  # Docker Compose's embedded DNS server
location /api/ {
    set $api_upstream http://api-server:8080;
    proxy_pass $api_upstream;   # using a variable forces per-request resolution
    ...
}
```
`127.0.0.11` is the fixed embedded DNS resolver address on every Compose/Swarm user-defined network. Also relevant: also prefer `expose:` over `ports:` for internal-only services (like an api-server with no public domain) on shared hosts like Coolify, since hardcoded host `ports:` bindings can collide with other apps on the same server.
