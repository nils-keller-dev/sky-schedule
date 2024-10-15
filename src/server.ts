import closestPlane from './app.ts'

const routes = {
  'closestPlane': closestPlane,
}

const port = parseInt(Deno.env.get('PORT') ?? '3000')
const hostname = '0.0.0.0'

Deno.serve({ port, hostname }, async (request: Request) => {
  console.log('---')
  console.log(new Date().toISOString())
  console.log('-')
  console.log(request.url)
  console.log('-')

  const fullPath = request.url.split('/')[3].split('?')
  const searchParams = new URLSearchParams(fullPath[1])
  const queryObject = Object.fromEntries(searchParams.entries())

  const routeFunction = routes[fullPath[0] as keyof typeof routes]
  const { body, init } = await routeFunction?.(queryObject)

  console.log(body)

  return new Response(body, init)
})
