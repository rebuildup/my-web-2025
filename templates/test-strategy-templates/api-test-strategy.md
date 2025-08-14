# API Test Strategy Template

**API Name**: [API Name]  
**Developer**: [Developer Name]  
**Date**: [Date]  
**API Version**: [Version]

## API Overview

### Purpose

[Brief description of the API's purpose and functionality]

### Endpoints

```
GET    /api/[resource]           - List resources
GET    /api/[resource]/:id       - Get specific resource
POST   /api/[resource]           - Create new resource
PUT    /api/[resource]/:id       - Update resource
DELETE /api/[resource]/:id       - Delete resource
```

### Authentication

- **Type**: [Bearer Token/API Key/OAuth/None]
- **Required**: [Yes/No]
- **Scope**: [Read/Write/Admin]

### Dependencies

- [ ] Database connection
- [ ] External APIs
- [ ] Authentication service
- [ ] Caching layer

## Test Strategy

### 1. Endpoint Testing

#### HTTP Methods

- [ ] **GET Requests**
  - [ ] Successful retrieval (200)
  - [ ] Resource not found (404)
  - [ ] Unauthorized access (401)
  - [ ] Forbidden access (403)
  - [ ] Server error (500)

- [ ] **POST Requests**
  - [ ] Successful creation (201)
  - [ ] Invalid data (400)
  - [ ] Duplicate resource (409)
  - [ ] Unauthorized (401)
  - [ ] Server error (500)

- [ ] **PUT Requests**
  - [ ] Successful update (200)
  - [ ] Resource not found (404)
  - [ ] Invalid data (400)
  - [ ] Unauthorized (401)
  - [ ] Server error (500)

- [ ] **DELETE Requests**
  - [ ] Successful deletion (204)
  - [ ] Resource not found (404)
  - [ ] Unauthorized (401)
  - [ ] Cascade deletion handling
  - [ ] Server error (500)

#### Request Validation

- [ ] **Required Fields**: Missing required fields return 400
- [ ] **Data Types**: Invalid data types return 400
- [ ] **Field Lengths**: Exceeding max length returns 400
- [ ] **Format Validation**: Invalid formats (email, URL) return 400
- [ ] **Business Rules**: Business logic validation

#### Response Validation

- [ ] **Response Structure**: Consistent response format
- [ ] **Data Types**: Correct data types in response
- [ ] **Required Fields**: All required fields present
- [ ] **Null Handling**: Proper null value handling
- [ ] **Pagination**: Pagination metadata correct

### 2. Authentication & Authorization Testing

#### Authentication

- [ ] **Valid Credentials**: Successful authentication
- [ ] **Invalid Credentials**: Authentication failure (401)
- [ ] **Missing Credentials**: Unauthorized access (401)
- [ ] **Expired Tokens**: Token expiration handling
- [ ] **Token Refresh**: Token refresh mechanism

#### Authorization

- [ ] **Role-based Access**: Different roles have appropriate access
- [ ] **Resource Ownership**: Users can only access their resources
- [ ] **Admin Access**: Admin users have elevated permissions
- [ ] **Cross-tenant Access**: Tenant isolation is enforced

### 3. Data Integrity Testing

#### CRUD Operations

- [ ] **Create**: Data is correctly stored
- [ ] **Read**: Data is correctly retrieved
- [ ] **Update**: Data is correctly modified
- [ ] **Delete**: Data is correctly removed

#### Data Consistency

- [ ] **Referential Integrity**: Foreign key constraints
- [ ] **Unique Constraints**: Duplicate prevention
- [ ] **Data Validation**: Business rule enforcement
- [ ] **Transaction Handling**: ACID properties maintained

### 4. Error Handling Testing

#### Client Errors (4xx)

- [ ] **400 Bad Request**: Invalid request format
- [ ] **401 Unauthorized**: Authentication required
- [ ] **403 Forbidden**: Insufficient permissions
- [ ] **404 Not Found**: Resource doesn't exist
- [ ] **409 Conflict**: Resource conflict
- [ ] **422 Unprocessable Entity**: Validation errors

#### Server Errors (5xx)

- [ ] **500 Internal Server Error**: Unexpected server errors
- [ ] **502 Bad Gateway**: Upstream service errors
- [ ] **503 Service Unavailable**: Service temporarily down
- [ ] **504 Gateway Timeout**: Request timeout

#### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### 5. Performance Testing

#### Response Time

- [ ] **GET Requests**: < 200ms (95th percentile)
- [ ] **POST Requests**: < 500ms (95th percentile)
- [ ] **PUT Requests**: < 500ms (95th percentile)
- [ ] **DELETE Requests**: < 300ms (95th percentile)

#### Load Testing

- [ ] **Concurrent Users**: Handle 100+ simultaneous requests
- [ ] **Throughput**: Process 1000+ requests per minute
- [ ] **Resource Usage**: CPU and memory within limits
- [ ] **Database Connections**: Connection pool management

#### Stress Testing

- [ ] **Peak Load**: Handle 10x normal load
- [ ] **Graceful Degradation**: Proper error handling under stress
- [ ] **Recovery**: Quick recovery after load reduction
- [ ] **Rate Limiting**: Proper rate limiting implementation

## Test Implementation

### Test File Structure

```
src/app/api/[endpoint]/
├── route.ts
├── __tests__/
│   ├── route.test.ts
│   ├── auth.test.ts
│   ├── validation.test.ts
│   └── performance.test.ts
└── __mocks__/
    └── database.mock.ts
```

### Basic Test Template

```typescript
import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "../route";

describe("/api/[endpoint]", () => {
  beforeEach(() => {
    // Setup test database
    // Reset mocks
  });

  afterEach(() => {
    // Cleanup
  });

  describe("GET", () => {
    it("should return list of resources", async () => {
      const request = new NextRequest("http://localhost/api/endpoint");
      const response = await GET(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("items");
      expect(Array.isArray(data.items)).toBe(true);
    });

    it("should return 404 for non-existent resource", async () => {
      const request = new NextRequest("http://localhost/api/endpoint/999");
      const response = await GET(request, { params: { id: "999" } });

      expect(response.status).toBe(404);
    });
  });

  describe("POST", () => {
    it("should create new resource", async () => {
      const requestBody = {
        name: "Test Resource",
        description: "Test Description",
      };

      const request = new NextRequest("http://localhost/api/endpoint", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data).toHaveProperty("id");
      expect(data.name).toBe(requestBody.name);
    });

    it("should return 400 for invalid data", async () => {
      const request = new NextRequest("http://localhost/api/endpoint", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
```

### Authentication Testing

```typescript
describe("Authentication", () => {
  it("should require authentication", async () => {
    const request = new NextRequest("http://localhost/api/protected");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("should accept valid token", async () => {
    const request = new NextRequest("http://localhost/api/protected", {
      headers: { Authorization: "Bearer valid-token" },
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it("should reject invalid token", async () => {
    const request = new NextRequest("http://localhost/api/protected", {
      headers: { Authorization: "Bearer invalid-token" },
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});
```

### Validation Testing

```typescript
describe("Validation", () => {
  const validationTestCases = [
    {
      name: "missing required field",
      data: { description: "Test" }, // missing 'name'
      expectedStatus: 400,
      expectedError: "name is required",
    },
    {
      name: "invalid email format",
      data: { name: "Test", email: "invalid-email" },
      expectedStatus: 400,
      expectedError: "Invalid email format",
    },
    {
      name: "field too long",
      data: { name: "x".repeat(256) },
      expectedStatus: 400,
      expectedError: "name must be less than 255 characters",
    },
  ];

  validationTestCases.forEach(
    ({ name, data, expectedStatus, expectedError }) => {
      it(`should handle ${name}`, async () => {
        const request = new NextRequest("http://localhost/api/endpoint", {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        });

        const response = await POST(request);

        expect(response.status).toBe(expectedStatus);

        if (expectedError) {
          const errorData = await response.json();
          expect(errorData.error.message).toContain(expectedError);
        }
      });
    },
  );
});
```

### Performance Testing

```typescript
describe("Performance", () => {
  it("should respond within acceptable time", async () => {
    const startTime = Date.now();

    const request = new NextRequest("http://localhost/api/endpoint");
    const response = await GET(request);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(200); // 200ms threshold
  });

  it("should handle concurrent requests", async () => {
    const requests = Array.from({ length: 10 }, () =>
      GET(new NextRequest("http://localhost/api/endpoint")),
    );

    const responses = await Promise.all(requests);

    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });
  });
});
```

## Mock Strategy

### Database Mocking

```typescript
jest.mock("@/lib/database", () => ({
  db: {
    collection: jest.fn(() => ({
      find: jest.fn(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    })),
  },
}));
```

### External API Mocking

```typescript
jest.mock("@/lib/external-api", () => ({
  externalApiCall: jest.fn().mockResolvedValue({
    status: 200,
    data: { success: true },
  }),
}));
```

### Authentication Mocking

```typescript
jest.mock("@/lib/auth", () => ({
  verifyToken: jest.fn(),
  getUserFromToken: jest.fn(),
}));
```

## Test Data Management

### Test Database Setup

```typescript
beforeAll(async () => {
  // Setup test database
  await setupTestDatabase();
});

afterAll(async () => {
  // Cleanup test database
  await cleanupTestDatabase();
});

beforeEach(async () => {
  // Reset test data
  await resetTestData();
});
```

### Test Data Fixtures

```typescript
const testFixtures = {
  validUser: {
    id: "1",
    name: "Test User",
    email: "test@example.com",
  },
  validResource: {
    id: "1",
    name: "Test Resource",
    description: "Test Description",
    userId: "1",
  },
};
```

## Quality Gates

### Coverage Requirements

- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

### Performance Requirements

- **Response Time**: < 200ms (95th percentile)
- **Throughput**: > 1000 requests/minute
- **Error Rate**: < 0.1%
- **Availability**: > 99.9%

### Security Requirements

- **Authentication**: All protected endpoints require auth
- **Authorization**: Role-based access control enforced
- **Input Validation**: All inputs properly validated
- **SQL Injection**: Parameterized queries used

## Monitoring and Alerting

### Metrics to Track

- [ ] **Response Times**: Average and percentile response times
- [ ] **Error Rates**: 4xx and 5xx error percentages
- [ ] **Throughput**: Requests per second/minute
- [ ] **Database Performance**: Query execution times

### Alerts

- [ ] **High Error Rate**: > 5% error rate
- [ ] **Slow Response**: > 1s average response time
- [ ] **High Load**: > 80% CPU utilization
- [ ] **Database Issues**: Connection pool exhaustion

## Documentation

### API Documentation

- [ ] **OpenAPI Spec**: Complete API specification
- [ ] **Request/Response Examples**: Sample requests and responses
- [ ] **Error Codes**: Complete error code documentation
- [ ] **Authentication Guide**: How to authenticate

### Test Documentation

- [ ] **Test Plan**: This document
- [ ] **Test Cases**: Detailed test specifications
- [ ] **Mock Documentation**: How to set up mocks
- [ ] **Performance Benchmarks**: Expected performance metrics

## Troubleshooting

### Common Issues

#### Database Connection Issues

- **Symptom**: Tests fail with connection errors
- **Solution**: Ensure test database is running and accessible

#### Authentication Failures

- **Symptom**: All protected endpoints return 401
- **Solution**: Check token generation and validation logic

#### Timeout Issues

- **Symptom**: Tests timeout frequently
- **Solution**: Increase timeout values or optimize slow operations

### Debugging Tips

1. **Use request/response logging** for debugging
2. **Check database state** before and after operations
3. **Verify mock configurations** are correct
4. **Test endpoints individually** to isolate issues

---

**Template Version**: 1.0  
**Last Updated**: [Date]  
**Next Review**: [Date + 3 months]
