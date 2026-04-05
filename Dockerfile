# Build and Runtime
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x ./mvnw

COPY src ./src
RUN ./mvnw clean package -DskipTests

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "target/kursywalut-0.0.1-SNAPSHOT.jar"]

