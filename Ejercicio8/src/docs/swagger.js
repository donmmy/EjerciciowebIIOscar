import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Blog API',
      version: '1.0.0',
      description: 'Una API de Blog con posts, slugs, autores y gestión de contenido'
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
            role: { type: 'string', enum: ['user', 'author', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Post: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            title: { type: 'string', example: 'Mi Primer Post' },
            slug: { type: 'string', example: 'mi-primer-post' },
            content: { type: 'string', example: 'Contenido del post...' },
            author: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            excerpt: { type: 'string', example: 'Resumen del post' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['blog', 'nodejs']
            },
            featured: { type: 'string', example: 'https://example.com/image.jpg' },
            published: { type: 'boolean', example: false },
            views: { type: 'integer', example: 42 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        UpdatePost: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Post Actualizado' },
            content: { type: 'string', example: 'Contenido actualizado...' },
            excerpt: { type: 'string', example: 'Resumen actualizado' },
            tags: { type: 'array', items: { type: 'string' } },
            featured: { type: 'string', example: 'https://example.com/new-image.jpg' },
            published: { type: 'boolean', example: true }
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
