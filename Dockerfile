FROM hayd/alpine-deno:1.5.4

EXPOSE 8000

WORKDIR /app

USER deno

ADD . .

RUN deno cache src/index.ts

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "src/index.ts"]
