FROM nginx:alpine
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY src/ /app/src/
COPY data/ /app/data/
EXPOSE 8080
