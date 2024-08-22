import app from './app'
import dotenv from 'dotenv'

dotenv.config()

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000')
    const host = '0.0.0.0'

    await app.listen({ port, host })
    console.log(`Server running at http://localhost:${port}/`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
