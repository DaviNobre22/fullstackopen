const loginWith = async (page, username, password) => {
  await page.goto('/login')
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

// creates a blog through the "create new" view and waits until it is in the list
const createBlog = async (page, { title, author, url }) => {
  await page.getByRole('link', { name: 'create new' }).click()
  await page.getByLabel('title').fill(title)
  await page.getByLabel('author').fill(author)
  await page.getByLabel('url').fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  await page.getByRole('link', { name: `${title} ${author}` }).waitFor()
}

module.exports = { loginWith, createBlog }
