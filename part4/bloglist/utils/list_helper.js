const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

// the blog with the most likes, or null for an empty list
const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  return blogs.reduce((favorite, blog) =>
    blog.likes > favorite.likes ? blog : favorite
  )
}

// adds up a value per author, e.g. { 'Robert C. Martin': 3, ... }
const countByAuthor = (blogs, valueOf) => {
  return blogs.reduce((counts, blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + valueOf(blog)
    return counts
  }, {})
}

// the [author, value] pair with the biggest value, or null if there are none
const topAuthor = (counts) => {
  const entries = Object.entries(counts)
  if (entries.length === 0) {
    return null
  }

  return entries.reduce((top, entry) => (entry[1] > top[1] ? entry : top))
}

const mostBlogs = (blogs) => {
  const top = topAuthor(countByAuthor(blogs, () => 1))
  return top ? { author: top[0], blogs: top[1] } : null
}

const mostLikes = (blogs) => {
  const top = topAuthor(countByAuthor(blogs, (blog) => blog.likes))
  return top ? { author: top[0], likes: top[1] } : null
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
