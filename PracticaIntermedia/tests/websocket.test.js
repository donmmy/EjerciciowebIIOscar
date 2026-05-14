import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { setupWebSocket, emitEvent, broadcastToCompany, broadcastToUser } from '../src/services/websocket.service.js';

// Mock de Socket.IO
class MockSocket {
  constructor() {
    this.events = {};
    this.joinedRooms = [];
    this.userId = 'test-user-id';
    this.companyId = 'test-company-id';
    this.id = 'socket-id-123';
    this.handshake = {
      auth: {
        token: 'valid-token',
        userId: this.userId,
        companyId: this.companyId
      }
    };
  }

  on(event, callback) {
    this.events[event] = callback;
  }

  join(room) {
    this.joinedRooms.push(room);
  }

  emit(event, data) {
    // Mock emit
  }
}

class MockIO {
  constructor() {
    this.sockets = [];
    this.events = {};
    this.rooms = {};
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  on(event, callback) {
    this.events[event] = callback;
  }

  to(room) {
    return {
      emit: jest.fn((event, data) => {
        this.rooms[room] = { event, data };
      })
    };
  }

  emit(event, data) {
    // Mock emit global
  }
}

describe('WebSocket Service', () => {
  let io;

  beforeEach(() => {
    io = new MockIO();
  });

  describe('setupWebSocket', () => {
    it('should setup socket.io with middleware and event handlers', () => {
      setupWebSocket(io);
      
      expect(io.middlewares.length).toBeGreaterThan(0);
      expect(io.events['connection']).toBeDefined();
    });

    it('should add authentication middleware', () => {
      setupWebSocket(io);
      
      const middleware = io.middlewares[0];
      expect(middleware).toBeDefined();
    });

    it('should create connection handler', () => {
      setupWebSocket(io);
      
      expect(io.events['connection']).toBeDefined();
      expect(typeof io.events['connection']).toBe('function');
    });
  });

  describe('emitEvent', () => {
    it('should emit event to specific room', () => {
      const result = emitEvent(io, 'test:event', { data: 'test' }, 'company:123');
      
      expect(io.rooms['company:123']).toBeDefined();
    });

    it('should emit event globally without room', () => {
      const emitSpy = jest.spyOn(io, 'emit');
      emitEvent(io, 'test:event', { data: 'test' });
      
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should add timestamp to event data', () => {
      const data = { message: 'test' };
      emitEvent(io, 'test:event', data, 'company:123');
      
      expect(io.rooms['company:123'].data).toHaveProperty('timestamp');
    });

    it('should handle null io gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      emitEvent(null, 'test:event', {});
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('no inicializado'));
    });
  });

  describe('broadcastToCompany', () => {
    it('should broadcast to company room', () => {
      const data = { client: 'new', name: 'Acme' };
      broadcastToCompany(io, 'company-123', 'client:new', data);
      
      expect(io.rooms['company:company-123']).toBeDefined();
    });

    it('should include timestamp in company broadcast', () => {
      broadcastToCompany(io, 'company-123', 'client:new', { name: 'Test' });
      
      expect(io.rooms['company:company-123'].data).toHaveProperty('timestamp');
    });
  });

  describe('broadcastToUser', () => {
    it('should broadcast to user room', () => {
      const data = { notification: 'test' };
      broadcastToUser(io, 'user-456', 'notify', data);
      
      expect(io.rooms['user:user-456']).toBeDefined();
    });

    it('should include timestamp in user broadcast', () => {
      broadcastToUser(io, 'user-456', 'notify', { message: 'test' });
      
      expect(io.rooms['user:user-456'].data).toHaveProperty('timestamp');
    });
  });

  describe('Socket Events', () => {
    let socket;

    beforeEach(() => {
      socket = new MockSocket();
    });

    it('should handle client:created event', () => {
      setupWebSocket(io);
      const connectionHandler = io.events['connection'];
      connectionHandler(socket);

      expect(socket.joinedRooms).toContain('company:test-company-id');
      expect(socket.joinedRooms).toContain('user:test-user-id');
    });

    it('should emit client:new on client:created', () => {
      setupWebSocket(io);
      const connectionHandler = io.events['connection'];
      connectionHandler(socket);

      const clientCreatedHandler = socket.events['client:created'];
      expect(clientCreatedHandler).toBeDefined();

      const toSpy = jest.spyOn(io, 'to');
      clientCreatedHandler({ id: '123', name: 'Test Client', cif: 'B123456' });
      
      expect(toSpy).toHaveBeenCalledWith('company:test-company-id');
    });

    it('should emit project:new on project:created', () => {
      setupWebSocket(io);
      const connectionHandler = io.events['connection'];
      connectionHandler(socket);

      const projectCreatedHandler = socket.events['project:created'];
      expect(projectCreatedHandler).toBeDefined();

      const toSpy = jest.spyOn(io, 'to');
      projectCreatedHandler({ id: '123', name: 'New Project', budget: 5000 });
      
      expect(toSpy).toHaveBeenCalled();
    });

    it('should emit deliverynote:signed on deliverynote:signed event', () => {
      setupWebSocket(io);
      const connectionHandler = io.events['connection'];
      connectionHandler(socket);

      const signedHandler = socket.events['deliverynote:signed'];
      expect(signedHandler).toBeDefined();

      const toSpy = jest.spyOn(io, 'to');
      signedHandler({ id: '123', signedBy: 'Client A', signedAt: new Date() });
      
      expect(toSpy).toHaveBeenCalled();
    });

    it('should handle disconnect event', () => {
      setupWebSocket(io);
      const connectionHandler = io.events['connection'];
      connectionHandler(socket);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const disconnectHandler = socket.events['disconnect'];
      disconnectHandler();

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('desconectado'));
    });
  });

  describe('Room Management', () => {
    let socket;

    beforeEach(() => {
      socket = new MockSocket();
    });

    it('should join user to company room', () => {
      setupWebSocket(io);
      const connectionHandler = io.events['connection'];
      connectionHandler(socket);

      expect(socket.joinedRooms).toContain(`company:${socket.companyId}`);
    });

    it('should join user to personal room', () => {
      setupWebSocket(io);
      const connectionHandler = io.events['connection'];
      connectionHandler(socket);

      expect(socket.joinedRooms).toContain(`user:${socket.userId}`);
    });

    it('should allow multiple rooms per user', () => {
      setupWebSocket(io);
      const connectionHandler = io.events['connection'];
      connectionHandler(socket);

      expect(socket.joinedRooms.length).toBeGreaterThanOrEqual(2);
    });
  });
});
