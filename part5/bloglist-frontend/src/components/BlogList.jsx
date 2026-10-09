import { Link } from 'react-router-dom'
import { Paper, List, ListItemButton, ListItemText, Typography, Chip } from '@mui/material'

const BlogList = ({ blogs }) => {
  // most liked first; sort() changes the array it is called on, so sort a copy, not the state
  const blogsByLikes = [...blogs].sort((a, b) => b.likes - a.likes)

  return (
    <div>
      <Typography variant="h4" component="h2" gutterBottom>
        blogs
      </Typography>
      <Paper>
        <List disablePadding>
          {blogsByLikes.map(blog =>
            <ListItemButton
              key={blog.id}
              component={Link}
              to={`/blogs/${blog.id}`}
              className="blog"
              divider
            >
              <ListItemText
                primary={`${blog.title} ${blog.author}`}
                slotProps={{ primary: { component: 'span' } }}
              />
              <Chip label={`${blog.likes} likes`} size="small" />
            </ListItemButton>
          )}
        </List>
      </Paper>
    </div>
  )
}

export default BlogList
