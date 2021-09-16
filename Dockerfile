FROM golang AS build
WORKDIR /build
COPY . .
ENV GOPROXY https://goproxy.io,direct
ENV CGO_ENABLED=0
RUN go build -o pdftoolbox

FROM ubuntu
RUN apt-get -y update && rm -rf /var/lib/apt/lists/*
RUN cp gs /usr/bin/gs
RUN mkdir -p /opt/pdftoolbox
RUN mkdir -p /opt/pdftoolbox/input
RUN mkdir -p /opt/pdftoolbox/output
COPY --from=build /build/pdftoolbox /opt/pdftoolbox/pdftoolbox
COPY static /opt/pdftoolbox/static
EXPOSE 8082
WORKDIR /opt/pdftoolbox/
ENTRYPOINT ["./pdftoolbox"]
