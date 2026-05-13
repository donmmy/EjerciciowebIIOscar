/**
 * Servicio de WebSockets con Socket.IO
 * Gestiona conexiones en tiempo real para notificaciones
 */

export const setupWebSocket = (io) => {
  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    socket.userId = socket.handshake.auth.userId;
    socket.companyId = socket.handshake.auth.companyId;
    next();
  });

  // Eventos de conexión
  io.on('connection', (socket) => {
    console.log(`🔌 Usuario conectado: ${socket.userId} (${socket.id})`);

    // Unirse a sala de compañía
    if (socket.companyId) {
      socket.join(`company:${socket.companyId}`);
      socket.join(`user:${socket.userId}`);
      console.log(`📍 Usuario ${socket.userId} en salas`);
    }

    // Evento: Cliente creado
    socket.on('client:created', (data) => {
      io.to(`company:${socket.companyId}`).emit('client:new', {
        id: data.id,
        name: data.name,
        cif: data.cif,
        createdBy: socket.userId,
        timestamp: new Date()
      });
      console.log(`✅ Evento client:created emitido`);
    });

    // Evento: Cliente actualizado
    socket.on('client:updated', (data) => {
      io.to(`company:${socket.companyId}`).emit('client:modified', {
        id: data.id,
        name: data.name,
        updatedBy: socket.userId,
        timestamp: new Date()
      });
      console.log(`✅ Evento client:updated emitido`);
    });

    // Evento: Cliente eliminado
    socket.on('client:deleted', (data) => {
      io.to(`company:${socket.companyId}`).emit('client:removed', {
        id: data.id,
        deletedBy: socket.userId,
        isHardDelete: data.isHardDelete,
        timestamp: new Date()
      });
      console.log(`✅ Evento client:deleted emitido`);
    });

    // Evento: Proyecto creado
    socket.on('project:created', (data) => {
      io.to(`company:${socket.companyId}`).emit('project:new', {
        id: data.id,
        name: data.name,
        budget: data.budget,
        createdBy: socket.userId,
        timestamp: new Date()
      });
      console.log(`✅ Evento project:created emitido`);
    });

    // Evento: Proyecto actualizado
    socket.on('project:updated', (data) => {
      io.to(`company:${socket.companyId}`).emit('project:modified', {
        id: data.id,
        status: data.status,
        updatedBy: socket.userId,
        timestamp: new Date()
      });
      console.log(`✅ Evento project:updated emitido`);
    });

    // Evento: Proyecto completado
    socket.on('project:completed', (data) => {
      io.to(`company:${socket.companyId}`).emit('project:done', {
        id: data.id,
        name: data.name,
        completedBy: socket.userId,
        timestamp: new Date()
      });
      console.log(`✅ Evento project:completed emitido`);
    });

    // Evento: Albarán creado
    socket.on('deliverynote:created', (data) => {
      io.to(`company:${socket.companyId}`).emit('deliverynote:new', {
        id: data.id,
        description: data.description,
        format: data.format,
        createdBy: socket.userId,
        timestamp: new Date()
      });
      console.log(`✅ Evento deliverynote:created emitido`);
    });

    // Evento: Albarán firmado
    socket.on('deliverynote:signed', (data) => {
      io.to(`company:${socket.companyId}`).emit('deliverynote:signed', {
        id: data.id,
        signedBy: data.signedBy,
        signedAt: new Date(),
        timestamp: new Date()
      });
      console.log(`✅ Evento deliverynote:signed emitido`);
    });

    // Evento: Albarán eliminado
    socket.on('deliverynote:deleted', (data) => {
      io.to(`company:${socket.companyId}`).emit('deliverynote:removed', {
        id: data.id,
        deletedBy: socket.userId,
        isHardDelete: data.isHardDelete,
        timestamp: new Date()
      });
      console.log(`✅ Evento deliverynote:deleted emitido`);
    });

    // Evento: Notificación personalizada
    socket.on('notify', (data) => {
      io.to(`company:${socket.companyId}`).emit('notification', {
        message: data.message,
        type: data.type || 'info',
        from: socket.userId,
        timestamp: new Date()
      });
      console.log(`✅ Notificación personalizada emitida`);
    });

    // Evento: Desconexión
    socket.on('disconnect', () => {
      console.log(`🔌 Usuario desconectado: ${socket.userId}`);
    });
  });

  return io;
};

/**
 * Emisor de eventos desde controladores
 */
export const emitEvent = (io, eventName, data, roomId) => {
  if (!io) {
    console.warn('⚠️ Socket.IO no inicializado');
    return;
  }

  if (roomId) {
    io.to(roomId).emit(eventName, {
      ...data,
      timestamp: new Date()
    });
  } else {
    io.emit(eventName, {
      ...data,
      timestamp: new Date()
    });
  }

  console.log(`📤 Evento ${eventName} emitido`);
};

/**
 * Broadcast a compañía específica
 */
export const broadcastToCompany = (io, companyId, eventName, data) => {
  const roomId = `company:${companyId}`;
  emitEvent(io, eventName, data, roomId);
};

/**
 * Broadcast a usuario específico
 */
export const broadcastToUser = (io, userId, eventName, data) => {
  const roomId = `user:${userId}`;
  emitEvent(io, eventName, data, roomId);
};
