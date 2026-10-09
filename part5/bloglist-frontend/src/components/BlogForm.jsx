import { useState } from 'react'
import { Paper, Stack, TextField, Button, Typography } from '@mui/material'

// the form keeps its own field values; createBlog is called with { title, author, url }
const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = async (event) => {
    event.preventDefault()

    // only clear the fields when the blog was really added
    const created = await createBlog({ title, author, url })
    if (created) {
      setTitle('')
      setAuthor('')
      setUrl('')
    }
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        create new
      </Typography>
      <form onSubmit={addBlog}>
        <Stack spacing={2}>
          <TextField
            id="title"
            label="title"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
          <TextField
            id="author"
            label="author"
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
          <TextField
            id="url"
            label="url"
            value={url}
            onChange={({ target }) => setUrl(target.value)}
          />
          <Button variant="contained" type="submit">
            create
          </Button>
        </Stack>
      </form>
    </Paper>
  )
}

export default BlogForm
