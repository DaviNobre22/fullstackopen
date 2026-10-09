// one blog with all its details.
// user is the logged-in user, or null: only logged-in users may like,
// and only the blog's creator may remove it
const BlogView = ({ blog, user, likeBlog, removeBlog }) => {
  if (!blog) {
    return null
  }

  const isCreator = user !== null && blog.user?.username === user.username

  return (
    <div className="blog-view">
      <h2>{blog.title} {blog.author}</h2>
      <div>
        <a href={blog.url}>{blog.url}</a>
      </div>
      <div>
        likes {blog.likes}{' '}
        {user && <button onClick={() => likeBlog(blog)}>like</button>}
      </div>
      <div>added by {blog.user?.name}</div>
      {isCreator && <button onClick={() => removeBlog(blog)}>remove</button>}
    </div>
  )
}

export default BlogView
