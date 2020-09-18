# mypaas.service = faq-div
#
# mypaas.url = https://faq-div.com
# mypaas.url = https://www.faq-div.com
#
# mypaas.scale = 0
#
# mypaas.maxmem = 100m

FROM python:3.8-slim-buster

RUN apt update \
    && pip --no-cache-dir install pip --upgrade \
    && pip --no-cache-dir install uvicorn uvloop httptools \
    && pip --no-cache-dir install markdown pygments asgineer>=0.8

WORKDIR /root
COPY . .
CMD ["python", "server.py"]
