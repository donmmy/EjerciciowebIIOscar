// Jest setup file
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Aumentar timeout para tests
jest.setTimeout(30000);

// Limpiar console durante tests
global.console.log = jest.fn();
global.console.error = jest.fn();
