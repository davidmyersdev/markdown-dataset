import { writeFile } from 'node:fs/promises'

const max = 1000
const perPage = Math.min(100, max)
const maxPages = Math.ceil(max / perPage)
const searchUrl = new URL('https://api.github.com/search/repositories')

searchUrl.searchParams.set('q', 'license:mit sort:stars')
searchUrl.searchParams.set('per_page', `${perPage}`)

const all: object[] = []

for (let page = 1; page <= maxPages; page++) {
  searchUrl.searchParams.set('page', `${page}`)

  console.log(`Fetching page ${page} of ${maxPages}...`)

  // Fetch the next page of repositories.
  const reposResponse = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
    },
  })

  const reposJson = await reposResponse.json()

  // Fetch the README for each repository.
  for (const repoJson of reposJson.items) {
    try {
      const readmeUrl = `https://api.github.com/repos/${repoJson.full_name}/readme`
      const readmeResponse = await fetch(readmeUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
        },
      })

      const readmeJson = await readmeResponse.json()

      if (/\.md$|\.markdown$/i.test(readmeJson.name)) {
        all.push({
          licenseKey: repoJson.license?.key,
          licenseName: repoJson.license?.name,
          licenseUrl: repoJson.license?.url,
          markdownEncoded: readmeJson.content,
          markdownEncoding: readmeJson.encoding,
          markdownSource: readmeJson.name,
          repoId: repoJson.id,
          repoName: repoJson.full_name,
          repoUrl: repoJson.html_url,
          sha: readmeJson.sha,
          updatedAt: Date.now(),
        })
      } else {
        console.log(`No README found for ${repoJson.full_name}`)
      }
    } catch (error) {
      console.error(error)
    }
  }
}

await writeFile('./data/markdown.json', JSON.stringify(all, null, 2))
