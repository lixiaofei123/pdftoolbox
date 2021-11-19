FROM golang AS build
WORKDIR /build
COPY . .
ENV GOPROXY https://goproxy.io,direct
ENV CGO_ENABLED=0
RUN go build -o pdftoolbox

FROM ubuntu

RUN apt-get -y update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY gs /usr/bin/gs

RUN mkdir -p /usr/local/share/tessdata

ENV TESSDATA_PREFIX /usr/local/share/tessdata

RUN curl https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/eng.traineddata -o /usr/local/share/tessdata/eng.traineddata
RUN curl https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/chi_sim.traineddata -o /usr/local/share/tessdata/chi_sim.traineddata
RUN curl https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/chi_sim_vert.traineddata -o /usr/local/share/tessdata/chi_sim_vert.traineddata
RUN curl https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/chi_tra.traineddata -o /usr/local/share/tessdata/chi_tra.traineddata
RUN curl https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/chi_tra_vert.traineddata -o /usr/local/share/tessdata/chi_tra_vert.traineddata
RUN curl https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/jpn.traineddata -o /usr/local/share/tessdata/jpn.traineddata
RUN curl https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/jpn_vert.traineddata -o /usr/local/share/tessdata/jpn_vert.traineddata
RUN curl https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/kor.traineddata -o /usr/local/share/tessdata/kor.traineddata
RUN curl https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/kor_vert.traineddata -o /usr/local/share/tessdata/kor_vert.traineddata

RUN apt-get -y remove curl

RUN mkdir -p /opt/pdftoolbox/input && mkdir -p /opt/pdftoolbox/output

COPY --from=build /build/pdftoolbox /opt/pdftoolbox/pdftoolbox
COPY static /opt/pdftoolbox/static

VOLUME ["/opt/pdftoolbox/input"]
VOLUME ["/opt/pdftoolbox/output"]

EXPOSE 8082

WORKDIR /opt/pdftoolbox/

ENTRYPOINT ["./pdftoolbox"]
