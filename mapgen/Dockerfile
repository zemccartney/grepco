FROM alpine:latest

RUN apk add --no-cache \
    build-base \
    # asciiworld dependencies (see README)
    # -dev versions needed since building from source (so the robot tells me)
    gd-dev \
    shapelib-dev \
    # ImageMagick for rendering ASCII text to image
    imagemagick \
    # Monospace font for ASCII art
    font-dejavu

WORKDIR /asciiworld

COPY asciiworld/ .

RUN make

RUN mkdir -p /output

# Copy entrypoint script that generates ASCII and renders to image
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /asciiworld

ENTRYPOINT ["/entrypoint.sh"]
