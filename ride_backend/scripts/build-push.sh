#!/bin/bash

REGISTRY="18c336445927"
TAG=${1:-latest}   

eval $(minikube docker-env)

SERVICES=(
  "accounts"
  "drivers"
  "notifications"
  "payments"
  "reviews"
  "trips"
)

for SERVICE in "${SERVICES[@]}"; do
  echo "🔨 Building $SERVICE..."
  docker build \
    -t $REGISTRY/$SERVICE-service:$TAG \
    -f ./services/$SERVICE/Dockerfile \
    .                          # context is repo root (for shared requirements.txt)

  echo "📦 Pushing $SERVICE..."
  docker push $REGISTRY/$SERVICE-service:$TAG

  echo "✅ Done: $REGISTRY/$SERVICE-service:$TAG"
  echo "---"
done

echo "🚀 All images built and pushed!"