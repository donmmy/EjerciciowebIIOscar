import { todo } from "../data/todo.js";

export const getTodos = (req, res) => {
    res.json(todo);
}

export const getTodoById = (req, res) => {
    const id = req.params.id;
    const todo = todo.find(todo => todo.id === id);
    res.json(todo);
}

export const createTodo = (req, res) => {
    const todo = req.body;
    todo.id = todo.length + 1;
    todo.push(todo);
    res.json(todo);
}

export const updateTodo = (req, res) => {
    const id = req.params.id;
    const todo = todo.find(todo => todo.id === id);
    todo.titulo = req.body.titulo;
    todo.descripcion = req.body.descripcion;
    todo.completado = req.body.completado;
    todo.prioridad = req.body.prioridad;
    todo.fechaCreacion = req.body.fechaCreacion;
    res.json(todo);
}

export const deleteTodo = (req, res) => {
    const id = req.params.id;
    const todo = todo.find(todo => todo.id === id);
    todo.splice(todo.indexOf(todo), 1);
    res.json(todo);
}

export const patchTodo = (req, res) => {
    const id = req.params.id;
    const todo = todo.find(todo => todo.id === id);
    todo.completado = !todo.completado;
    res.json(todo);
}