import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createNote, deleteNote, getNotes, patchNote, searchNotes } from '../api/notes-api'
import Auth from '../auth/Auth'
import { Note } from '../types/Note'
import { SearchNoteRequest } from '../types/SearchNoteRequest'

interface NotesProps {
  auth: Auth
  history: History
}

interface NotesState {
  notes: Note[]
  newNoteName: string
  searchNote: string
  loadingNotes: boolean
}

export class Notes extends React.PureComponent<NotesProps, NotesState> {
  state: NotesState = {
    notes: [],
    newNoteName: '',
    searchNote: '',
    loadingNotes: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newNoteName: event.target.value })
  }

  handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchNote: event.target.value })
  }

  onEditButtonClick = (noteId: string) => {
    this.props.history.push(`/notes/${noteId}/edit`)
  }

  onNoteCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newNote = await createNote(this.props.auth.getIdToken(), {
        name: this.state.newNoteName,
        dueDate
      })
      this.setState({
        notes: [...this.state.notes, newNote],
        newNoteName: ''
      })
    } catch {
      alert('Note creation failed')
    }
  }

  onNoteSearch = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const searchNote = this.state.searchNote
      console.log('Search note with keyword: ', searchNote)

      if (searchNote) {
        console.log('Enter search note')
        const searchReq:SearchNoteRequest = {keyword: searchNote}

        const notes = await searchNotes(this.props.auth.getIdToken(), searchReq)
        this.setState({
          notes,
          loadingNotes: false
        })
      } else {
        console.log('Empty search. Enter fetch note')
        this.componentDidMount()
      }
    } catch (e) {
      if (e instanceof Error) {
        alert(`Failed to fetch notes: ${e.message}`)
      }
    }
  }

  onNoteDelete = async (noteId: string) => {
    try {
      await deleteNote(this.props.auth.getIdToken(), noteId)
      this.setState({
        notes: this.state.notes.filter(note => note.noteId !== noteId)
      })
    } catch {
      alert('Note deletion failed')
    }
  }

  onNoteCheck = async (pos: number) => {
    try {
      const note = this.state.notes[pos]
      await patchNote(this.props.auth.getIdToken(), note.noteId, {
        name: note.name,
        dueDate: note.dueDate,
        done: !note.done
      })
      this.setState({
        notes: update(this.state.notes, {
          [pos]: { done: { $set: !note.done } }
        })
      })
    } catch {
      alert('Note deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const notes = await getNotes(this.props.auth.getIdToken())
      this.setState({
        notes,
        loadingNotes: false
      })
    } catch (e) {
      if (e instanceof Error) {
        alert(`Failed to fetch notes: ${e.message}`)
      }
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">NOTEs</Header>

        {this.renderNoteSearch()}

        {this.renderCreateNoteInput()}

        {this.renderNotes()}
      </div>
    )
  }

  renderCreateNoteInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New note',
              onClick: this.onNoteCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Add your note here..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderNoteSearch() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'search',
              content: 'Search note name',
              onClick: this.onNoteSearch
            }}
            fluid
            actionPosition="left"
            placeholder="Search your note here..."
            onChange={this.handleSearch}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderNotes() {
    if (this.state.loadingNotes) {
      return this.renderLoading()
    }

    return this.renderNotesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading NOTEs
        </Loader>
      </Grid.Row>
    )
  }

  renderNotesList() {
    return (
      <Grid padded>
        {this.state.notes.map((note, pos) => {
          return (
            <Grid.Row key={note.noteId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onNoteCheck(pos)}
                  checked={note.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {note.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {note.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(note.noteId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onNoteDelete(note.noteId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {note.attachmentUrl && (
                <Image src={note.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
