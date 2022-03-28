import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateNote } from '../../businessLogic/notes'
import { UpdateNoteRequest } from '../../requests/UpdateNoteRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const noteId = event.pathParameters.noteId
    const updatedNote: UpdateNoteRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    await updateNote(noteId, updatedNote, userId)
    return {
      statusCode: 204,
      body: ''
    }
  })

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
