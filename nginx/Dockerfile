FROM nginx:alpine

# Copiar configs
COPY conf.d /etc/nginx/conf.d/

# Criar diretórios para Certbot
RUN mkdir -p /var/www/certbot /etc/letsencrypt

# Expor portas HTTP e HTTPS
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
