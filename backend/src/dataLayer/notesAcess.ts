import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { NoteItem } from '../models/NoteItem'
import { NoteUpdate } from '../models/NoteUpdate';

//const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('NotesAccess')

// TODO: Implement the dataLayer logic
export class NotesAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly notesTable = process.env.NOTES_TABLE) {
    }

    async getAllNotes(userId: string): Promise<NoteItem[]> {
        console.log('Getting all Notes for user ', userId)

        const result = await this.docClient.query({
            TableName: this.notesTable,
            KeyConditionExpression: '#userId =:i',
            ExpressionAttributeNames: {
                '#userId': 'userId'
            },
            ExpressionAttributeValues: {
                ':i': userId
            }
        }).promise();

        const items = result.Items
        return items as NoteItem[]
    }

    async searchNotes(userId: string, keyword: string): Promise<NoteItem[]> {
        console.log('search all Notes for user ', userId, ' with keyword ', keyword)

        const result = await this.docClient.query({
            TableName: this.notesTable,
            KeyConditionExpression: '#userId =:i',
            ExpressionAttributeNames: {
                '#userId': 'userId'
            },
            ExpressionAttributeValues: {
                ':i': userId
            }
        }).promise();

        let items = result.Items as NoteItem[]
        items = items.filter(item => item.name.includes(keyword))
        return items
    }

    async createNote(note: NoteItem): Promise<NoteItem> {
        console.log('Creating new NOTE item')
        await this.docClient.put({
            TableName: this.notesTable,
            Item: note
        }).promise()
        console.log('Created new NOTE item')
        return note
    }

    async updateNote(note: NoteUpdate, userId: string, noteId: string): Promise<NoteUpdate> {
        console.log(`Updating NOTE ${noteId} for user ${userId}`)
        const params = {
            TableName: this.notesTable,
            Key: {
                userId: userId,
                noteId: noteId
            },
            ExpressionAttributeNames: {
                '#note_name': 'name',
            },
            ExpressionAttributeValues: {
                ':name': note.name,
                ':dueDate': note.dueDate,
                ':done': note.done,
            },
            UpdateExpression: 'SET #note_name = :name, dueDate = :dueDate, done = :done',
            ReturnValues: 'ALL_NEW',
        };

        const result = await this.docClient.update(params).promise();

        logger.info('Result of update statement', { result: result });

        return result.Attributes as NoteUpdate;
    }

    async updateAttachmentUrl(userId: string, noteId: string, attachmentUrl: string) {
        console.log(`Updating attachment URL for NOTE ${noteId} of user ${userId} with URL ${attachmentUrl}`)
        const params = {
            TableName: this.notesTable,
            Key: {
                userId: userId,
                noteId: noteId
            },
            ExpressionAttributeNames: {
                '#note_attachmentUrl': 'attachmentUrl'
            },
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
            },
            UpdateExpression: 'SET #note_attachmentUrl = :attachmentUrl',
            ReturnValues: 'ALL_NEW',
        };

        const result = await this.docClient.update(params).promise();
        logger.info('Result of update statement', { result: result });
    }

    async deleteNote(noteId: string, userId: string) {
        console.log(`Deleting NOTE ${noteId} of user ${userId}`)
    
        await this.docClient.delete({
          TableName: this.notesTable,
          Key: {
            userId: userId,
            noteId: noteId
          }
        }).promise();
    
        logger.info('Deleted NOTE successfully');
      }
}

function createDynamoDBClient(): DocumentClient {
    const service = new AWS.DynamoDB();
    const client = new AWS.DynamoDB.DocumentClient({
        service: service
    });
    AWSXRay.captureAWSClient(service);
    return client;
}