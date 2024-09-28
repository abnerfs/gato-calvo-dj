FROM node:18
RUN apt update && apt install pipx -y

RUN pipx install yt-dlp && pipx ensurepath && /root/.local/bin/yt-dlp -U

WORKDIR /app
COPY package*.json .

RUN npm install

COPY . .

RUN npm run build
RUN npm install pm2 -g
ENV YTDLP_PATH=/root/.local/bin/yt-dlp

CMD ["pm2-runtime", "start", "dist/index.js"]
