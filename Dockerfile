FROM denoland/deno:2.2.5

WORKDIR /app
COPY . .

RUN deno cache src/server.ts

CMD ["task", "start"]