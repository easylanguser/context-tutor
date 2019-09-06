FROM ubuntu:18.04

RUN apt-get update && apt-get install -y git curl sudo && apt-get install -y --no-install-recommends apt-utils
RUN curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
RUN apt-get install -y nodejs build-essential npm
RUN yes | npm i ionic -g
RUN apt-get update && apt-get install -y nginx

WORKDIR /etc
COPY nginx.conf nginx/

WORKDIR /var/www
RUN git clone https://github.com/easably/context-tutor && cd context-tutor && npm i \
    && sed -i 's|https://easy4learn.com|http://localhost:3000|g' src/environments/environment.prod.ts \
    && ionic build --prod && cd .. && rm -rf html && mkdir html && cp -r context-tutor/www/* html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]