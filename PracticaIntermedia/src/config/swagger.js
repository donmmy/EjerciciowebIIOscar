import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PracticaIntermedia API',
      version: '1.0.0',
      description: 'API REST para gestión de usuarios, clientes, proyectos y albaranes'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            lastName: { type: 'string' },
            nif: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'guest'] },
            status: { type: 'string', enum: ['pending', 'verified'] },
            company: { type: 'string', description: 'Company ID' },
            deleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          example: {
            _id: '507f1f77bcf86cd799439011',
            email: 'user@example.com',
            name: 'John',
            lastName: 'Doe',
            nif: '12345678A',
            role: 'admin',
            status: 'verified',
            company: '507f1f77bcf86cd799439012',
            deleted: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        },
        Company: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            owner: { type: 'string', description: 'User ID' },
            cif: { type: 'string' },
            name: { type: 'string' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                number: { type: 'string' },
                postal: { type: 'string' },
                city: { type: 'string' },
                province: { type: 'string' }
              }
            },
            logo: { type: 'string' },
            deleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Client: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string', description: 'User ID' },
            company: { type: 'string', description: 'Company ID' },
            name: { type: 'string' },
            cif: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                number: { type: 'string' },
                postal: { type: 'string' },
                city: { type: 'string' },
                province: { type: 'string' }
              }
            },
            deleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string', description: 'User ID' },
            company: { type: 'string', description: 'Company ID' },
            client: { type: 'string', description: 'Client ID' },
            name: { type: 'string' },
            projectCode: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['activo', 'completado', 'suspendido'] },
            budget: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            address: { type: 'object' },
            deleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        DeliveryNote: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            company: { type: 'string' },
            client: { type: 'string' },
            project: { type: 'string' },
            format: { type: 'string', enum: ['material', 'hours'] },
            description: { type: 'string' },
            workDate: { type: 'string', format: 'date-time' },
            material: { type: 'string' },
            quantity: { type: 'number' },
            unit: { type: 'string' },
            hours: { type: 'number' },
            workers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  hours: { type: 'number' }
                }
              }
            },
            signed: { type: 'boolean' },
            signedAt: { type: 'string', format: 'date-time' },
            signatureUrl: { type: 'string' },
            pdfUrl: { type: 'string' },
            deleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'boolean' },
            message: { type: 'string' },
            statusCode: { type: 'number' },
            details: { type: 'object' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [
    './src/routes/user.routes.js',
    './src/routes/client.routes.js',
    './src/routes/proyecto.routes.js',
    './src/routes/albaranes.routes.js'
  ]
};

export const specs = swaggerJsdoc(options);
