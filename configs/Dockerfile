FROM lukechannings/deno:v1.8.0 AS build

ENV TZ="Europe/London"
ENV DEBIAN_FRONTEND="noninteractive"

RUN apt-get update -y
RUN apt-get install -y golang ca-certificates

RUN GO111MODULE=on go get github.com/evanw/esbuild/cmd/esbuild@v0.8.54

WORKDIR /moviematch

ADD . .

RUN PATH="$HOME/go/bin:$PATH" ./scripts/bundle.sh -e

FROM lukechannings/deno:v1.8.0

EXPOSE 8000

WORKDIR /app

USER deno

COPY --from=build /moviematch/build .

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--unstable", "--import-map=./import_map.json", "moviematch.js"]
