import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim()

export async function POST(request: NextRequest) {
  try {
    const { word, partOfSpeech = 'noun', level = 'A1' } = await request.json()

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 })
    }

    let result = {
      phonetic: `/${word}/`,
      meaning: '',
      examples: [] as string[],
      foundPOS: partOfSpeech,
      scenario: `A typical situation involving ${word}`,
      emotionalConnection: `A memory hook for ${word}`
    }

    // 1. Try OpenRouter (LLM) first if API key exists
    if (OPENROUTER_API_KEY) {
      try {
        const maskedKey = `${OPENROUTER_API_KEY.slice(0, 8)}...${OPENROUTER_API_KEY.slice(-4)}`
        console.log(`🚀 [AI] Calling OpenRouter [Key: ${maskedKey}] for word: "${word}" [Level: ${level}]`)
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://visual-english.local", 
            "X-Title": "Visual English Admin",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "openrouter/free",
            "messages": [
              {
                "role": "system",
                "content": "You are an English language expert. Provide word information in JSON format. Be concise and accurate."
              },
              {
                "role": "user",
                "content": `Provide details for the word "${word}" used as a ${partOfSpeech} at English level ${level}. 
                Return exactly this JSON structure:
                {
                  "phonetic": "IPA phonetic string",
                  "meaning": "simple definition for ${level} level",
                  "examples": ["example 1", "example 2", "example 3"],
                  "scenario": "a short 1-sentence real-life scenario using the word",
                  "emotionalConnection": "a short 1-sentence memory hook or emotional connection"
                }`
              }
            ],
            "response_format": { "type": "json_object" },
            "temperature": 0.7
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ [AI] OpenRouter success')
          let content = data.choices?.[0]?.message?.content
          
          if (content) {
            // Clean up content if it's wrapped in markdown code blocks
            content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
            
            try {
              const parsed = JSON.parse(content)
              result = {
                ...result,
                ...parsed,
                foundPOS: partOfSpeech
              }
              return NextResponse.json(result)
            } catch (parseError) {
              console.error('❌ [AI] JSON Parse failed:', content)
            }
          }
        } else {
          const errorText = await response.text()
          console.error(`❌ [AI] OpenRouter API Error (${response.status}):`, errorText)
        }
      } catch (llmError) {
        console.error('❌ [AI] Connection failed:', llmError)
      }
    } else {
      console.warn('⚠️ [AI] OPENROUTER_API_KEY is missing or empty')
    }

    // 2. Fallback to Dictionary API
    try {
      const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      
      if (dictResponse.ok) {
        const data = await dictResponse.json()
        
        if (Array.isArray(data) && data[0]) {
          const entry = data[0]
          
          if (entry.phonetic) {
            result.phonetic = entry.phonetic
          } else if (entry.phonetics?.length > 0) {
            result.phonetic = entry.phonetics.find((p: any) => p.text)?.text || result.phonetic
          }

          const meanings = entry.meanings || []
          const targetPOS = partOfSpeech.toLowerCase()
          
          let foundMeaning = meanings.find((m: any) => m.partOfSpeech.toLowerCase() === targetPOS) || meanings[0]
          
          if (foundMeaning) {
            result.meaning = foundMeaning.definitions?.[0]?.definition || result.meaning
            result.examples = foundMeaning.definitions
              .slice(0, 3)
              .map((d: any) => d.example)
              .filter(Boolean)
            result.foundPOS = foundMeaning.partOfSpeech
          }
        }
      }
    } catch (dictError) {
      console.log('Dictionary API fallback failed')
    }

    // 3. Final default values if still empty
    if (!result.meaning) result.meaning = `A ${partOfSpeech} related to ${word}`
    if (result.examples.length === 0) {
      result.examples = [
        `I saw a ${word} today.`,
        `Can you use "${word}" in a sentence?`,
        `What does "${word}" mean?`
      ]
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Final Route Error:', error)
    return NextResponse.json({ 
      phonetic: '/word/',
      meaning: 'Error generating definition',
      examples: ['Learning "word" today.'],
      partOfSpeech: 'noun',
      scenario: 'Learning context',
      emotionalConnection: 'Memory hook'
    }, { status: 500 })
  }
}
