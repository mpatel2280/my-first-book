FROM node:20-bookworm

ARG MDBOOK_VERSION=0.4.40

RUN apt-get update && apt-get install -y curl ca-certificates \
  && curl -sL "https://github.com/rust-lang/mdBook/releases/download/v${MDBOOK_VERSION}/mdbook-v${MDBOOK_VERSION}-x86_64-unknown-linux-gnu.tar.gz" \
  | tar -xz -C /usr/local/bin \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/server

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
