import { Card, CardContent, CardActions, Typography, Link, Button } from '@mui/material'

// one blog with all its details.
// user is the logged-in user, or null: only logged-in users may like,
// and only the blog's creator may remove it
const BlogView = ({ blog, user, likeBlog, removeBlog }) => {
  if (!blog) {
    return null
  }

  const isCreator = user !== null && blog.user?.username === user.username

  return (
    <Card className="blog-view" sx={{ maxWidth: 700 }}>
      <CardContent>
        <Typography variant="h5" component="h2">
          {blog.title}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {blog.author}
        </Typography>

        <Link href={blog.url} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-all' }}>
          {blog.url}
        </Link>

        <Typography sx={{ mt: 2 }}>likes {blog.likes}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          added by {blog.user?.name}
        </Typography>
      </CardContent>

      {user && (
        <CardActions>
          <Button variant="contained" onClick={() => likeBlog(blog)}>
            like
          </Button>
          {isCreator && (
            <Button variant="outlined" color="error" onClick={() => removeBlog(blog)}>
              remove
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  )
}

export default BlogView
