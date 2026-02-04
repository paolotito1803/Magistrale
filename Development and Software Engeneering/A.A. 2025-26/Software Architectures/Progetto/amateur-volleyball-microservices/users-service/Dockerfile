# 1. Build
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy the project context from root to access 'common' library and settings.gradle
COPY . .

# Fix line endings for Windows users and grant execution permissions
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Build this service (and dependencies)
# -x test skips tests
RUN ./gradlew :users-service:bootJar -x test --no-daemon

# 2. Run
# Light JRE image for the final container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the jar from the build
COPY --from=builder /app/users-service/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]