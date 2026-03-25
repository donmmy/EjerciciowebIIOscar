import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'PodcastHub API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            name: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
            age: { type: 'integer', example: 25 },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' }
          }
        },
        Podcast: {
          type: 'object',
          required: ['title', 'duration'],
          properties: {
            _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            title: { type: 'string', example: 'Mi Podcast' },
            author: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            description: { type: 'string', example: 'Un podcast sobre tecnología' },
            duration: { type: 'integer', example: 3600 },
            categories: {
              type: 'array',
              items: { type: 'string' },
              example: ['tecnología', 'ciencia']
            },
            coverImage: { type: 'string', example: 'https://example.com/cover.jpg' },
            published: { type: 'boolean', example: false }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'boolean', example: true },
            message: { type: 'string', example: 'ERROR_MESSAGE' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'],
};

export default swaggerJsdoc(options);
