import { useState } from 'react'

const blogStyle = {
  paddingTop: 10,
  paddingLeft: 2,
  border: 'solid',
  borderWidth: 1,
  marginBottom: 5,
}

// canRemove: true when the logged-in user added this blog
const Blog = ({ blog, likeBlog, removeBlog, canRemove }) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div style={blogStyle} className="blog">
      <div>
        {blog.title} {blog.author}{' '}
        <button onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'hide' : 'view'}
        </button>
      </div>

      {showDetails && (
        <div className="blog-details">
          <div>{blog.url}</div>
          <div>
            likes {blog.likes} <button onClick={() => likeBlog(blog)}>like</button>
          </div>
          <div>{blog.user?.name}</div>
          {canRemove && <button onClick={() => removeBlog(blog)}>remove</button>}
        </div>
      )}
    </div>
  )
}

export default Blog
