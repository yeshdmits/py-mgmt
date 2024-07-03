FROM node:18.18.2 AS frontend-builder

WORKDIR /app/frontend
COPY site/package.json site/package-lock.json ./
RUN npm install

COPY site/ ./
RUN npm run build

FROM python:3.12.4

WORKDIR /app
COPY requirements.txt pyproject.toml ./
RUN pip install -r requirements.txt

COPY src ./src
COPY certs ./certs
COPY --from=frontend-builder /app/frontend/dist /app/site/dist
ENV mongo_password=chageit
CMD ["python", "./src/game/main.py" ]