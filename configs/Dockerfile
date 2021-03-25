FROM lukechannings/deno:v1.8.2

ARG VERSION

EXPOSE 8000

RUN apt-get update -y && apt-get install -y curl ca-certificates

USER deno

WORKDIR /app

RUN curl -OL "https://github.com/LukeChannings/moviematch/releases/download/${VERSION}/moviematch.bundle.js"

CMD ["run", "--allow-net", "--allow-read=.", "--allow-write=.", "--allow-env", "--unstable", "moviematch.bundle.js"]
