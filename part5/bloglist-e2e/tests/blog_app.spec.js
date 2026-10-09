const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

const blog = {
  title: 'Canonical string reduction',
  author: 'Edsger W. Dijkstra',
  url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // empty the test database and create one user
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      },
    })

    await page.goto('/')
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')

      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
      await expect(page).toHaveURL('/')
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrong')

      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('wrong username or password')
      // shown as Material UI's red error alert
      await expect(errorDiv).toHaveClass(/MuiAlert-colorError/)

      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
      await expect(page).toHaveURL('/login')
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, blog)

      // back on the list of all blogs, which now has the new blog
      await expect(page).toHaveURL('/')
      await expect(page.locator('.success')).toContainText(
        `a new blog ${blog.title} by ${blog.author} added`
      )
      await expect(page.getByRole('link', { name: `${blog.title} ${blog.author}` })).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, blog)
      await page.getByRole('link', { name: `${blog.title} ${blog.author}` }).click()

      await expect(page.getByText('likes 0')).toBeVisible()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('likes 1')).toBeVisible()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('likes 2')).toBeVisible()
    })

    test('the user who added a blog can delete it', async ({ page }) => {
      await createBlog(page, blog)
      await page.getByRole('link', { name: `${blog.title} ${blog.author}` }).click()

      // accept the window.confirm dialog that asks before removing
      page.once('dialog', async (dialog) => {
        expect(dialog.message()).toBe(`Remove blog ${blog.title} by ${blog.author}`)
        await dialog.accept()
      })
      await page.getByRole('button', { name: 'remove' }).click()

      // back on the list of all blogs, without the removed blog
      await expect(page).toHaveURL('/')
      await expect(page.locator('.success')).toContainText(`removed ${blog.title}`)
      await expect(page.getByRole('link', { name: `${blog.title} ${blog.author}` })).toHaveCount(0)
    })
  })
})
