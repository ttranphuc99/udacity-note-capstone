import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { searchNote } from '../../businessLogic/notes'
import { getUserId } from '../utils';
import { SearchNoteRequest } from '../../requests/SearchNoteRequest'

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId = getUserId(event)
    const requestSearchNote: SearchNoteRequest = JSON.parse(event.body)
    const notes = await searchNote(userId, requestSearchNote.keyword)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: notes
      })
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
