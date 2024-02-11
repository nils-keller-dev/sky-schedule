import fastify from 'fastify'

const app = fastify({ logger: true })

app.get('/', async (_request, _reply) => {
  return { hello: 'world' }
})

export default app
