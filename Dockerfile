# Usa un'immagine Node.js ufficiale come base
FROM node:18-alpine

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia i file package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze del progetto
RUN npm install

# Copia il resto del codice dell'applicazione
COPY . .

# Espone la porta su cui l'app sarà in ascolto
EXPOSE 3000

# Comando per avviare l'applicazione
CMD ["npm", "start"]