FROM nginx:alpine

# Remove o arquivo padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração personalizada
COPY nginx.conf /etc/nginx/conf.d/

# Copia apenas os arquivos estáticos necessários preservando a estrutura
COPY index.html /usr/share/nginx/html/
COPY src /usr/share/nginx/html/src

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]