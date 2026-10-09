import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import Blog from './Blog'

describe('<Blog />', () => {
  const blog = {
    id: '5a43fde2cbd20b12a2c34e91',
    title: 'The Joel Test: 12 Steps to Better Code',
    author: 'Joel Spolsky',
    url: 'https://www.joelonsoftware.com/2000/08/09/the-joel-test-12-steps-to-better-code/',
    likes: 7,
    user: { id: '5a43e6b6c37f3d065eaaa581', username: 'mluukkai', name: 'Matti Luukkainen' },
  }

  let likeBlog
  let container

  beforeEach(() => {
    likeBlog = vi.fn()
    container = render(
      <Blog blog={blog} likeBlog={likeBlog} removeBlog={vi.fn()} canRemove={false} />
    ).container
  })

  // 5.13
  test('renders title and author, but not url or likes by default', () => {
    expect(screen.getByText('The Joel Test: 12 Steps to Better Code', { exact: false })).toBeVisible()
    expect(screen.getByText('Joel Spolsky', { exact: false })).toBeVisible()

    expect(screen.queryByText(blog.url)).toBeNull()
    expect(screen.queryByText('likes 7', { exact: false })).toBeNull()
    expect(container.querySelector('.blog-details')).toBeNull()
  })

  // 5.14
  test('shows url and likes after the view button is clicked', async () => {
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'view' }))

    expect(screen.getByText(blog.url)).toBeVisible()
    expect(screen.getByText('likes 7', { exact: false })).toBeVisible()
    expect(container.querySelector('.blog-details')).toBeVisible()
  })

  // 5.15
  test('calls the like handler twice when like is clicked twice', async () => {
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'view' }))

    const likeButton = screen.getByRole('button', { name: 'like' })
    await user.click(likeButton)
    await user.click(likeButton)

    expect(likeBlog).toHaveBeenCalledTimes(2)
    expect(likeBlog).toHaveBeenCalledWith(blog)
  })
})
