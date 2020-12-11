# Running MovieMatch behind a reverse proxy

Many people choose to run services behind a reverse proxy. This page aims to provide some documentation to spare lots of duplicated effort (and bug tickets).

## Nginx

### Behind a subdomain

```nginx.conf
[...]

http {
  server {
    listen 9000;
    server_name moviematch.example.com;

    location ^~ / {
        proxy_pass http://localhost:8000/;
        proxy_set_header Upgrade $http_upgrade;
    }
  }
}

[...]
```

### Behind a subpath

Run MovieMatch with the `ROOT_PATH=/moviematch`, and use the following `nginx.conf`.

```nginx.conf
[...]

http {
  server {
    listen 9000;

    location ^~ /moviematch/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Upgrade $http_upgrade;
    }
  }
}

[...]
```

## HAProxy

### Behind a subdomain

```haproxy.cfg
frontend https
  mode http
  bind 0.0.0.0:443 name bind_1 crt /etc/haproxy/certs ssl alpn h2,http/1.1
  http-request set-header X-Forwarded-Proto https if { ssl_fc }
  use_backend moviematch-http if { req.hdr(host),field(1,:) -i moviematch.channings.me } { path_beg / }

backend moviematch-http
  mode http
  balance roundrobin
  option forwardfor
  server localhost:8000
```
