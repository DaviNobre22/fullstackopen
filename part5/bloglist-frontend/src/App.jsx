import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate, useMatch } from 'react-router-dom'
import { Container } from '@mui/material'
import NavBar from './components/NavBar'
import BlogList from './components/BlogList'
import BlogView from './components/BlogView'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

// the key under which the logged-in user is kept in the browser's local storage
const USER_STORAGE_KEY = 'loggedBlogappUser'

// read synchronously, so a page reload on e.g. /create already knows who is logged in
const loadSavedUser = () => {
  const loggedUserJSON = window.localStorage.getItem(USER_STORAGE_KEY)
  if (!loggedUserJSON) {
    return null
  }

  const user = JSON.parse(loggedUserJSON)
  blogService.setToken(user.token)
  return user
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  // the logged-in user: { token, username, name }, or null when nobody is logged in
  const [user, setUser] = useState(loadSavedUser)
  const [notification, setNotification] = useState({ message: null, type: 'success' })
  const notificationTimeout = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
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

  const login = async (credentials) => {
    try {
      const user = await loginService.login(credentials)
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      // e.g. an earlier "wrong username or password" no longer applies
      clearNotification()
      navigate('/')
    } catch {
      notify('wrong username or password', 'error')
    }
  }

  const logout = () => {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    blogService.setToken(null)
    setUser(null)
    navigate('/')
  }

  // returns true when the blog was added, so the form knows whether to clear its fields
  const createBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      notify(`a new blog ${returnedBlog.title} by ${returnedBlog.author} added`)
      navigate('/')
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
      navigate('/')
    } catch (error) {
      notify(error.response?.data?.error || `removing ${blog.title} failed`, 'error')
    }
  }

  // on /blogs/:id, the blog with that id (undefined until the blogs have been loaded)
  const match = useMatch('/blogs/:id')
  const blog = match ? blogs.find(b => b.id === match.params.id) : null

  return (
    <>
      <NavBar user={user} logout={logout} />

      <Container>
        <Notification message={notification.message} type={notification.type} />

        <Routes>
          <Route path="/" element={<BlogList blogs={blogs} />} />
          <Route
            path="/blogs/:id"
            element={<BlogView blog={blog} user={user} likeBlog={likeBlog} removeBlog={removeBlog} />}
          />
          <Route
            path="/create"
            element={user ? <BlogForm createBlog={createBlog} /> : <Navigate replace to="/login" />}
          />
          <Route
            path="/login"
            element={user ? <Navigate replace to="/" /> : <LoginForm login={login} />}
          />
        </Routes>
      </Container>
    </>
  )
}

export default App
