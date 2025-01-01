import { MistralClient } from '@mistralai/mistralai'

export async function getMistralResponse(prompt: string) {
  const client = new MistralClient(process.env.MISTRAL_API_KEY || '')
  
  try {
    const response = await client.chat({
      model: 'mistral-tiny',
      messages: [{ role: 'user', content: prompt }],
    })
    
    return response.choices[0]?.message?.content || 'No response generated'
  } catch (error) {
    console.error('Mistral API error:', error)
    return 'Sorry, I encountered an error processing your request.'
  }
}

