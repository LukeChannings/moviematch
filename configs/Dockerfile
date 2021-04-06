FROM ubuntu:focal
ARG TARGETARCH

EXPOSE 8000

WORKDIR /app

COPY ./build/linux-${TARGETARCH}/moviematch /app/

RUN chmod +x /app/moviematch

ENTRYPOINT ["/app/moviematch"]
