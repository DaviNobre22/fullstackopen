import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import BlogView from './BlogView'

describe('<BlogView />', () => {
  const creator = { id: '5a43e6b6c37f3d065eaaa581', username: 'mluukkai', name: 'Matti Luukkainen' }

  const blog = {
    id: '5a43fde2cbd20b12a2c34e91',
    title: 'The Joel Test: 12 Steps to Better Code',
    author: 'Joel Spolsky',
    url: 'https://www.joelonsoftware.com/2000/08/09/the-joel-test-12-steps-to-better-code/',
    likes: 7,
    user: creator,
  }

  let likeBlog
  let removeBlog

  beforeEach(() => {
    likeBlog = vi.fn()
    removeBlog = vi.fn()
  })

  const renderFor = (user) => {
    render(<BlogView blog={blog} user={user} likeBlog={likeBlog} removeBlog={removeBlog} />)
  }

  test('shows the blog and its likes, but no buttons, to users who are not logged in', () => {
    renderFor(null)

    expect(screen.getByText('The Joel Test: 12 Steps to Better Code', { exact: false })).toBeVisible()
    expect(screen.getByText('Joel Spolsky', { exact: false })).toBeVisible()
    expect(screen.getByText(blog.url)).toBeVisible()
    expect(screen.getByText('likes 7', { exact: false })).toBeVisible()
    expect(screen.getByText('added by Matti Luukkainen')).toBeVisible()

    expect(screen.queryByRole('button')).toBeNull()
  })

  test('shows only the like button to a logged-in user who did not create the blog', () => {
    renderFor({ username: 'hellas', name: 'Arto Hellas', token: 'x' })

    expect(screen.getByRole('button', { name: 'like' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'remove' })).toBeNull()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  test('shows the like and remove buttons to the creator of the blog', () => {
    renderFor({ username: 'mluukkai', name: 'Matti Luukkainen', token: 'x' })

    expect(screen.getByRole('button', { name: 'like' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'remove' })).toBeVisible()
  })

  test('calls the like handler twice when like is clicked twice', async () => {
    const user = userEvent.setup()
    renderFor({ username: 'hellas', name: 'Arto Hellas', token: 'x' })

    const likeButton = screen.getByRole('button', { name: 'like' })
    await user.click(likeButton)
    await user.click(likeButton)

    expect(likeBlog).toHaveBeenCalledTimes(2)
    expect(likeBlog).toHaveBeenCalledWith(blog)
  })

  test('calls the remove handler when the creator clicks remove', async () => {
    const user = userEvent.setup()
    renderFor({ username: 'mluukkai', name: 'Matti Luukkainen', token: 'x' })

    await user.click(screen.getByRole('button', { name: 'remove' }))

    expect(removeBlog).toHaveBeenCalledTimes(1)
    expect(removeBlog).toHaveBeenCalledWith(blog)
  })
})
