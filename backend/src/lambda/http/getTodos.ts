import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodosByUserId } from '../../helpers/businessLogic/todos'
import { createLogger } from '../../utils/logger'
// import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
// import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
const logger = createLogger('auth')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    console.log('Processing event: ', event)
    const authorization = event.headers.Authorization
      const split = authorization.split(' ')
      const jwtToken = split[1]
    const todos = await getTodosByUserId(jwtToken)
    logger.info('Listing Todos ', {
      key: todos
      })
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: todos
      })
    }})

handler.use(
  cors({
    credentials: true
  })
)
