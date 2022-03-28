import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateNoteRequest } from '../../requests/CreateNoteRequest'
import { getUserId } from '../utils';
import { createNote } from '../../businessLogic/notes'


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newNote: CreateNoteRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const item = await createNote(newNote, userId)
    return {
      statusCode: 201,
      body: JSON.stringify({
        item
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
