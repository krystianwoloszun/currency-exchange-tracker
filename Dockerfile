FROM node:22-alpine AS frontend-build
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build


FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /app

COPY pom.xml mvnw ./
COPY .mvn ./.mvn
COPY src ./src
COPY --from=frontend-build /frontend/dist ./src/main/resources/static

RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests


FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=backend-build /app/target/kursywalut-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
