# Microservices Messaging Example

This repository demonstrates two decoupled microservices built using Node.js and Express that communicate asynchronously via RabbitMQ. It is designed to showcase a senior‑level approach to microservices architecture with an emphasis on scalability, decoupling, and asynchronous communication.

## Architecture Overview

- **Service A (Port 3001):**
    - Exposes an HTTP POST `/send` endpoint.
    - Publishes messages to **Service B** by sending them to the RabbitMQ queue `serviceBQueue`.
    - Listens on its own queue `serviceAQueue` for messages (for example, acknowledgments or responses from Service B).

- **Service B (Port 3002):**
    - Exposes an HTTP POST `/send` endpoint.
    - Publishes messages to **Service A** by sending them to the RabbitMQ queue `serviceAQueue`.
    - Listens on its own queue `serviceBQueue` for incoming messages.

- **Communication Pattern:**  
  Asynchronous messaging is implemented via RabbitMQ. Each service asserts (creates if necessary) its own queue and the target queue before publishing. This design ensures that the services remain independent and can be scaled or updated without impacting one another.

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/max1k1/microservices-messaging-example.git
   cd microservices-messaging-example
