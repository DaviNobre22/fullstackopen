import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'

// the key under which the logged-in user is kept in the browser's local storage
const USER_STORAGE_KEY = 'loggedBlogappUser'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  // the logged-in user: { token, username, name }, or null when nobody is logged in
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState({ message: null, type: 'success' })
  const notificationTimeout = useRef(null)
  // lets App hide the "create new blog" form after a blog is added
  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  // after a page reload, log back in with the user saved in local storage
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem(USER_STORAGE_KEY)
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const clearNotification = () => {
    clearTimeout(notificationTimeout.current)
    setNotification({ message: null, type: 'success' })
  }

  // show a message for 5 seconds; a new message replaces the old one and gets its own 5 seconds
  const notify = (message, type = 'success') => {
    clearTimeout(notificationTimeout.current)
    setNotification({ message, type })
    notificationTimeout.current = setTimeout(clearNotification, 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      // e.g. an earlier "wrong username or password" no longer applies
      clearNotification()
    } catch {
      notify('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    blogService.setToken(null)
    setUser(null)
  }

  // returns true when the blog was added, so the form knows whether to clear its fields
  const createBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      // hide the form again after a blog has been added
      blogFormRef.current.toggleVisibility()
      notify(`a new blog ${returnedBlog.title} by ${returnedBlog.author} added`)
      return true
    } catch (error) {
      notify(error.response?.data?.error || 'adding the blog failed', 'error')
      return false
    }
  }

  const likeBlog = async (blog) => {
    // the backend expects the whole blog, with the creator as an id instead of an object
    const likedBlog = {
      user: blog.user?.id,
      likes: blog.likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url,
    }

    try {
      const returnedBlog = await blogService.update(blog.id, likedBlog)
      setBlogs(blogs.map(b => b.id === blog.id ? returnedBlog : b))
    } catch (error) {
      notify(error.response?.data?.error || `liking ${blog.title} failed`, 'error')
    }
  }

  const removeBlog = async (blog) => {
    if (!window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      return
    }

    try {
      await blogService.remove(blog.id)
      setBlogs(blogs.filter(b => b.id !== blog.id))
      notify(`removed ${blog.title} by ${blog.author}`)
    } catch (error) {
      notify(error.response?.data?.error || `removing ${blog.title} failed`, 'error')
    }
  }

  // most liked first; sort() changes the array it is called on, so sort a copy, not the state
  const blogsByLikes = [...blogs].sort((a, b) => b.likes - a.likes)

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={notification.message} type={notification.type} />
        <form onSubmit={handleLogin}>
          <div>
            <label>
              username
              <input
                type="text"
                value={username}
                onChange={({ target }) => setUsername(target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              password
              <input
                type="password"
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
            </label>
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={notification.message} type={notification.type} />
      <p>
        {user.name} logged in <button onClick={handleLogout}>logout</button>
      </p>

      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={createBlog} />
      </Togglable>

      {blogsByLikes.map(blog =>
        <Blog
          key={blog.id}
          blog={blog}
          likeBlog={likeBlog}
          removeBlog={removeBlog}
          canRemove={blog.user?.username === user.username}
        />
      )}
    </div>
  )
}

export default App
