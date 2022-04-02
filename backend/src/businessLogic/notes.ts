import { NotesAccess } from '../dataLayer/notesAcess'
import { AttachmentUtils } from '../fileStorage/attachmentUtils';
import { NoteItem } from '../models/NoteItem'
import { NoteUpdate } from '../models/NoteUpdate'
import { CreateNoteRequest } from '../requests/CreateNoteRequest'
import { UpdateNoteRequest } from '../requests/UpdateNoteRequest'

import * as uuid from 'uuid'


// TODO: Implement businessLogic
const notesAccess = new NotesAccess();
const accessFile = new AttachmentUtils();

export async function createAttachmentPresignedUrl(userId: string, noteId: string): Promise<String> {
    const uploadUrl = await accessFile.getUploadUrl(noteId);
    const attachmentUrl = accessFile.getAttachmentUrl(noteId);
    await notesAccess.updateAttachmentUrl(userId, noteId, attachmentUrl);
    return uploadUrl;
}

export async function getAllNotes(userId: string): Promise<NoteItem[]> {
    return notesAccess.getAllNotes(userId);
}

export async function searchNote(userId: string, keyword: string): Promise<NoteItem[]> {
    return notesAccess.searchNotes(userId, keyword);
}

export async function createNote(createNoteRequest: CreateNoteRequest, userId: string): Promise<NoteItem> {

    const noteId = uuid.v4();
    const timestamp = new Date().toISOString();

    return await notesAccess.createNote({
        userId: userId,
        noteId: noteId,
        createdAt: timestamp,
        name: createNoteRequest.name,
        dueDate: createNoteRequest.dueDate,
        done: false
    });
}

export async function updateNote(noteId: string, updateNoteRequest: UpdateNoteRequest, userId: string): Promise<NoteUpdate> {

    return await notesAccess.updateNote({
        name: updateNoteRequest.name,
        dueDate: updateNoteRequest.dueDate,
        done: updateNoteRequest.done
    },
        noteId,
        userId);
}

export async function deleteNote(noteId: string, userId: string) {
    await notesAccess.deleteNote(noteId, userId)
}