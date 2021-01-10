FROM hayd/alpine-deno:1.6.2

EXPOSE 8000

WORKDIR /app

USER deno

ADD . .

RUN deno cache --unstable cmd/moviematch/main.ts

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--unstable", "cmd/moviematch/main.ts"]
