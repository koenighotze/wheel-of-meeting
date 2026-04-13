FROM nginx:alpine
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY src/ /app/src/
EXPOSE 8080
