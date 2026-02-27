import { todo } from "../data/todo.js";

const todos = todo.todos;

export const getTodos = (req, res) => {
    let resultados = [...todos];
    const { completado, prioridad, fechaCreacion } = req.query;
    if (completado) {
        resultados = resultados.filter(todo => todo.completado === completado);
    } else {
        resultados = resultados.filter(todo => todo.completado !== completado);
    }
    if (prioridad == 'alta') {
        resultados = resultados.filter(todo => todo.prioridad === 'alta');
    } else if (prioridad == 'media') {
        resultados = resultados.filter(todo => todo.prioridad === 'media');
    } else if (prioridad == 'baja') {
        resultados = resultados.filter(todo => todo.prioridad === 'baja');
    }
    res.json(resultados);
}

export const getTodoById = (req, res) => {
    const { id } = parseInt(req.params.id);
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        res.json(todo);
    } else {
        res.status(404).json({ message: 'Todo no encontrado' });
    }
}

export const createTodo = (req, res) => {
    const { titulo, descripcion, completado, prioridad } = req.body;
    const newTodo = {
        id: todos.length + 1,
        titulo,
        descripcion,
        completado,
        prioridad,
        fechaCreacion: new Date(),
    };
    todos.push(newTodo);
    res.status(201).json({ message: 'Todo creado exitosamente' });
}

export const updateTodo = (req, res) => {
    const { id } = parseInt(req.params.id);
    const todoIndex = todos.findIndex(todo => todo.id === id);

    if (todoIndex === -1) {
        return res.status(404).json({ message: 'Todo no encontrado' });
    }
    const { completado, prioridad, fechaCreacion } = req.body;
    todos[todoIndex] = {
        ...todos[todoIndex],
        completado,
        prioridad,
        fechaCreacion,
    };
    res.json({ message: 'Todo actualizado exitosamente con id:' + todos[todoIndex] });
}
