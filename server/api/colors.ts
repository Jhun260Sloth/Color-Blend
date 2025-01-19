import fs from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  })

  const filePath = resolve('./assets/jsonfiles/colors.json')
  
  try {
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return jsonData 
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to read colors data'
    })
  }
})