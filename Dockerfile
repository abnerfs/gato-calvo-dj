FROM node:18
RUN apt update && apt install pipx -y
RUN pipx install yt-dlp
RUN pipx ensurepath
RUN /root/.local/bin/yt-dlp -U

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build
ENV YTDLP_PATH=/root/.local/bin/yt-dlp
CMD ["npm", "start"]
