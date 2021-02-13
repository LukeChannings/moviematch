# Running MovieMatch behind a reverse proxy

Many people choose to run services behind a reverse proxy. This page aims to provide some documentation to spare lots of duplicated effort (and bug tickets).

## Nginx

### Behind a subdomain

```nginx.conf
events {
  worker_connections 4096;
}

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
```

### Behind a subpath

Run MovieMatch normally, and use the following `nginx.conf`.

```nginx.conf
events {
  worker_connections 4096;
}

http {
  server {
    listen 9000;

    location ^~ /moviematch/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header X-Forwarded-Prefix /moviematch;
    }

    location ^~ / {
        proxy_pass http://localhost:8000/;
        proxy_set_header Upgrade $http_upgrade;
    }
  }
}
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

## Apache2

Make sure to enable Apache2 mods first: a2enmod mod_proxy mod_proxy_wstunnel mod_rewrite

```xml
<VirtualHost *:80>
  ServerName moviematch.example.com
  ServerAlias moviematch.example.com
  ProxyPass / http://localhost:8000/
  RewriteEngine on
  RewriteCond %{HTTP:Upgrade} websocket [NC]
  RewriteCond %{HTTP:Connection} upgrade [NC]
  RewriteRule ^/?(.*) "ws://localhost:8000/$1" [P,L]
</VirtualHost>
```
