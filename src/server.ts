import closestPlane from './app.ts'
import { verifyClient } from './utils/authentication.ts'
import { buildLogArray, log } from './utils/utils.ts'

const routes = {
  'closestPlane': closestPlane,
}

const port = parseInt(Deno.env.get('PORT') ?? '3000')
const hostname = '0.0.0.0'

Deno.serve({ port, hostname }, async (request: Request) => {
  console.log('---')

  const name = await verifyClient(request.headers.get('token'))
  if (!name) {
    console.log('Unauthorized')
    return new Response('Unauthorized', { status: 401 })
  }

  console.log(name)
  console.log(new Date().toISOString())
  console.log(request.url)

  const fullPath = request.url.split('/')[3].split('?')
  const searchParams = new URLSearchParams(fullPath[1])
  const queryObject = Object.fromEntries(searchParams.entries())

  const routeFunction = routes[fullPath[0] as keyof typeof routes]
  if (!routeFunction) {
    return new Response('Not found', { status: 404 })
  }

  const response = await routeFunction?.(queryObject)

  if (!response) {
    return new Response('Bad request', { status: 400 })
  }

  if (Object.keys(response).length > 0) {
    const logArray = buildLogArray(queryObject, response)
    log(`${logArray.join(',')}\n`, name)
  }

  console.log(response)

  return new Response(
    JSON.stringify(response),
    { headers: { 'content-type': 'application/json; charset=utf-8' } },
  )
})
