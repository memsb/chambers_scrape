FROM --platform=linux/amd64 python:3.10-alpine
WORKDIR /app

COPY requirements.txt /app
RUN pip install -r requirements.txt

COPY src /app

ENTRYPOINT ["python"]

CMD ["scrape_publications.py"]