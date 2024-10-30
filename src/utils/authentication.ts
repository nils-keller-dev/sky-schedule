import { verify } from 'djwt'

const verifyClient = async (token: string | null) => {
  if (!token) {
    return
  }

  try {
    const key = Deno.env.get('SECRET_KEY') ?? ''
    const cryptoKey = await createHS256Key(key)
    const payload = await verify<{ name: string }>(token, cryptoKey)

    return payload.name
  } catch (error) {
    console.log(error)
    return
  }
}

const createHS256Key = async (keyString: string) => {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(keyString)

  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign', 'verify'],
  )
}

export { verifyClient }
