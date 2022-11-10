import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodos } from '../../helpers/businessLogic/todos'
import { createLogger } from '../../utils/logger'
// import { createTodo } from '../../businessLogic/todos'
// import { DocumentClient } from 'aws-sdk/clients/dynamodb'
const logger = createLogger('auth')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        console.log('processing event: ', event)
        const userId = getUserId(event)
        logger.info('Getting User ID ', {
          key: userId
          })
      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      const authorization = event.headers.Authorization
      const split = authorization.split(' ')
      const jwtToken = split[1]

        const todoItem = await createTodos(newTodo,jwtToken)

    return{
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: todoItem
          })
    }
    })
    handler.use(
        cors({
          credentials: true
        })
      )