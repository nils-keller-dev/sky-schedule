import app from './app.ts'

const start = async () => {
  try {
    const port = parseInt(Deno.env.get('PORT') ?? '3000')
    const host = '0.0.0.0'

    await app.listen({ port, host })
  } catch (err) {
    app.log.error(err)
  }
}

start()
