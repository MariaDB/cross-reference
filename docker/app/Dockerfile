ARG PYTHON_VERSION
# Use an official Python runtime as a parent image
FROM python:${PYTHON_VERSION}-alpine3.20

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Setup project and working directory
COPY ./docker/app/requirements.txt ./requirements.txt

# Install dependencies and create user
RUN pip install --no-cache-dir --upgrade pip && \
    apk add --update --no-cache \
        gcc \
        libc-dev \
        mariadb-dev && \
    pip install -r requirements.txt

WORKDIR /app/src

RUN mkdir -p /app/logs

# Run entrypoint.sh
COPY ./docker/app/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
