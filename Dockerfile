# Dockerfile to run the FAQ-div website on MyPaas
# See https://github.com/almarklein/mypaas
#
# mypaas.service = faq-div
# mypaas.url = https://faq-div.com
# mypaas.url = https://www.faq-div.com
# mypaas.scale = 0
# mypaas.maxmem = 100m

FROM python:3.8-slim-buster

RUN apt update \
    && pip --no-cache-dir install pip --upgrade \
    && pip --no-cache-dir install uvicorn uvloop httptools asgineer>=0.8 \
    && pip --no-cache-dir install jsmin markdown jinja2 pygments

WORKDIR /root
COPY . .
CMD ["python", "serve.py"]
