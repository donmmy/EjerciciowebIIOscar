import { Router } from "express";
import * as todoController from "../controllers/todo.controller.js";
import { validate } from "../middlewares/validateRequest.js";
import { todoSchema, updateTodoSchema } from "../schemas/todo.schemas.js";

const router = Router();

router.get("/", todoController.getTodos);
router.get("/:id", todoController.getTodoById);
router.post("/", validate(todoSchema), todoController.createTodo);
router.put("/:id", validate(updateTodoSchema), todoController.updateTodo);
router.delete("/:id", todoController.deleteTodo);
router.patch("/:id/toggle", todoController.patchTodo);

export default router;