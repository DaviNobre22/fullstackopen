import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import BlogForm from './BlogForm'

describe('<BlogForm />', () => {
  // 5.16
  test('calls createBlog with the right details when a blog is created', async () => {
    const user = userEvent.setup()
    const createBlog = vi.fn()

    render(<BlogForm createBlog={createBlog} />)

    await user.type(screen.getByLabelText('title'), 'Canonical string reduction')
    await user.type(screen.getByLabelText('author'), 'Edsger W. Dijkstra')
    await user.type(screen.getByLabelText('url'), 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html')
    await user.click(screen.getByRole('button', { name: 'create' }))

    expect(createBlog).toHaveBeenCalledTimes(1)
    expect(createBlog.mock.calls[0][0]).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    })
  })
})
