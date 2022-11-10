import 'source-map-support/register'
​
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getTodoById, updatedTodo } from '../../helpers/dataLayer/todosAcess'
import { getUploadUrl } from '../../helpers/dataLayer/attachmentUtils'
//import * as AWS from 'aws-sdk';
//const s3 = new AWS.S3();
const bucketname = process.env.ATTACHMENT_S3_BUCKET
​
​
//import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
//import { getUserId } from '../utils'
​
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const todo = await getTodoById(todoId)
    todo.attachmentUrl = `https://${bucketname}.s3.amazonaws.com/${todoId}`
    
​
    await updatedTodo(todo);
​
    const url= await getUploadUrl(todoId)
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    
​
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
  
      body: JSON.stringify({
        uploadUrl: url,
          
      })
    }
  }
)
​
handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )