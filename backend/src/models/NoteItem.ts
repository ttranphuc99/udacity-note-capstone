export interface NoteItem {
  userId: string
  noteId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
