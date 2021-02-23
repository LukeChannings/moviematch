FROM lukechannings/deno:v1.7.5

EXPOSE 8000

WORKDIR /app

USER deno

ADD . .

RUN deno cache --unstable src/index.ts

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--unstable", "src/index.ts"]
