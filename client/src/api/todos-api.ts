import { apiEndpoint } from '../config'
import { Note } from '../types/Note';
import { CreateNoteRequest } from '../types/CreateNoteRequest';
import Axios from 'axios'
import { UpdateNoteRequest } from '../types/UpdateNoteRequest';

export async function getNotes(idToken: string): Promise<Note[]> {
  console.log('Fetching notes')

  const response = await Axios.get(`${apiEndpoint}/todos`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Notes:', response.data)
  return response.data.items
}

export async function createNote(
  idToken: string,
  newNote: CreateNoteRequest
): Promise<Note> {
  const response = await Axios.post(`${apiEndpoint}/todos`,  JSON.stringify(newNote), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchNote(
  idToken: string,
  todoId: string,
  updatedNote: UpdateNoteRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/todos/${todoId}`, JSON.stringify(updatedNote), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteNote(
  idToken: string,
  todoId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/todos/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  todoId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/todos/${todoId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
