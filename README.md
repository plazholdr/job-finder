# Job Finder

A full-stack application for finding jobs, built with Next.js and FeathersJS.

## Project Structure

This is a monorepo managed with Turborepo and Yarn workspaces, containing:

- `frontend`: Next.js 14 application with Tailwind CSS and Ant Design
- `backend`: FeathersJS API with Node.js 20, REST, and Socket.io

## Getting Started

### Prerequisites

- Node.js 20 or later
- Yarn 1.22 or later
- Docker and Docker Compose

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/job-finder-my/job-finder.git
   cd job-finder
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development environment:
   ```bash
   yarn dev
   ```

## Docker Setup

The project is configured to run entirely in Docker containers. We provide a convenient script to manage the Docker environment.

### Using the run script

Make the script executable:

```bash
chmod +x run.sh
```

Start all services:

```bash
./run.sh start
```

Stop all services:

```bash
./run.sh stop
```

View logs:

```bash
./run.sh logs
```

### Manual Docker commands

Alternatively, you can use Docker Compose directly:

Start in detached mode:
```bash
docker-compose up -d
```

Start with logs:
```bash
docker-compose up
```

Stop all services:
```bash
docker-compose down
```

### Services

The Docker setup includes:
- Frontend (Next.js): http://localhost:3000
- Backend (FeathersJS): http://localhost:3030
- MongoDB (local only): mongodb://localhost:27017
- Redis (for caching and queues): redis://localhost:6379
- Mailhog (for testing emails): http://localhost:8025 (web UI)
- MinIO (S3-compatible storage):
  - API: http://localhost:9000
  - Console: http://localhost:9001 (login: minioadmin/minioadmin)

## Development

- `yarn dev`: Start all applications in development mode
- `yarn build`: Build all applications
- `yarn start`: Start all applications in production mode
- `yarn lint`: Run linting on all applications
- `yarn test`: Run tests on all applications

## Test-Driven Development (TDD)

This project follows Test-Driven Development practices:

### Frontend Testing

The frontend uses Jest and React Testing Library for testing:

```bash
cd frontend
yarn test
```

Write tests in the `__tests__` directory. Example test structure:

```typescript
// __tests__/ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import ComponentName from '../src/components/ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Backend Testing

The backend uses Jest for testing:

```bash
cd backend
yarn test
```

Write tests in the `test` directory. Example test structure:

```javascript
// test/service-name.test.js
const app = require('../src/index');

describe('ServiceName', () => {
  it('should perform expected action', async () => {
    // Setup
    const service = app.service('service-name');

    // Test
    const result = await service.find({ query: {} });

    // Assert
    expect(result).toHaveLength(0);
  });
});
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
