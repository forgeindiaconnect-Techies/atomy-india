# Build stage using Maven and Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/app.jar app.jar
ENV PORT=8085
EXPOSE 8085
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8085} -jar app.jar"]

