import { createTodo, getAllTodosByUserId, getTodoById, updatedTodo, deleteTodoItem } from '../dataLayer/todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
// import { getUploadUrl } from './attachmentUtils';
import { TodoItem } from '../../models/TodoItem'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

import { parseUserId } from '../../auth/utils';
// TODO: Implement businessLogic

export async function getTodosByUserId(jwtToken: string): Promise<TodoItem[]> {
    return getAllTodosByUserId(parseUserId(jwtToken))
}

export async function createTodos(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {
    const todoId = uuid.v4()
    const userId = parseUserId(jwtToken)

    return await createTodo({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: ''
        // attachmentUrl: `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${todoId}`
        
    })
}

export async function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    todoId: string,
    // imageId: string,
    jwtToken: string
): Promise<TodoItem> {
    const userId = parseUserId(jwtToken)

    return await updatedTodo({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done,
        attachmentUrl: `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${todoId}`
        
    })
}

export async function getTodo(
    todoId: string,
    // jwtToken: string
): Promise<TodoItem> {
    // const todoId = uuid.v4()
    // const userId = parseUserId(jwtToken)

    return await getTodoById(todoId)
}

export async function deleteTodo(
    todoId: string,
    jwtToken: string
) {
    const userId = parseUserId(jwtToken)
    return await deleteTodoItem(todoId, userId)
}
