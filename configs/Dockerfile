FROM lukechannings/deno:1.6.3

EXPOSE 8000

WORKDIR /app

USER deno

ADD . .

RUN deno cache --unstable cmd/moviematch/main.ts

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--unstable", "--import-map=./configs/import_map.json", "cmd/moviematch/main.ts"]
