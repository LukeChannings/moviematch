# Configuration

## Via UI

If you prefer to set up MovieMatch using a web interface, just start MovieMatch
and you will be presented with a configuration screen. The configuration will be
saved in the working directory.

## Via YAML

MovieMatch can be configured with a simple YAML document, which allows
connecting to multiple Plex servers.

Here's a simple example:

```YAML
host: 0.0.0.0
port: 8000
servers:
  - url: https://plex.foo.com
    token: abcdef12346
    useForAuth: true
  - url: https://plex.bar.com
    token: abcdef12346
    useForAuth: true
permittedAuthTypes:
  anonymous:
    - JoinRoom
  plex:
    - JoinRoom
  plexFriends:
    - JoinRoom
    - CreateRoom
  plexOwner:
    - JoinRoom
    - CreateRoom
    - DeleteRoom
    - ResetRoom
    - Admin
```

MovieMatch will read the config from `config.yaml` by default.
