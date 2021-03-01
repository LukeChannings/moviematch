FROM lukechannings/deno:v1.7.5 AS build

RUN apt-get update -y
RUN DEBIAN_FRONTEND="noninteractive" TZ="Europe/London" apt-get install -y golang ca-certificates

RUN GO111MODULE=on go get github.com/evanw/esbuild/cmd/esbuild@v0.8.54

WORKDIR /moviematch

ADD . .

RUN PATH="$HOME/go/bin:$PATH" ./scripts/bundle.sh -e

FROM lukechannings/deno:v1.7.5

EXPOSE 8000

WORKDIR /app

USER deno

COPY --from=build /moviematch/build .

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--unstable", "--import-map=./import_map.json", "moviematch.js"]
