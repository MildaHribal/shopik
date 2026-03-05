export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${url.origin}/sitemap.xml`,
    '',
  ].join('\n')
})

