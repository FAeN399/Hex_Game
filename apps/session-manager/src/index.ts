import readline from 'readline'
import { scriptAutomaticEvents, CharacterAttributes, CharacterProfile, Scenario } from '../../packages/story/src'
import { Character } from '../../packages/schema/src'

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer); }))
}

async function run() {
  const scenarioDesc = await ask('Describe the upcoming scenario: ')
  const scenario: Scenario = { description: scenarioDesc }

  const charName = await ask('Character name: ')
  const attributes: CharacterAttributes = {
    fear: Number(await ask('Fear (0-10): ')),
    inspire: Number(await ask('Inspire (0-10): ')),
    mindControl: Number(await ask('Mind Control (0-10): '))
  }
  const base: Character = {
    id: '00000000-0000-0000-0000-000000000001',
    name: charName,
    totalPower: 0,
    cardIds: Array(6).fill('00000000-0000-0000-0000-000000000000')
  }
  const profile: CharacterProfile = { base, attributes }

  const decision = await ask('What does the character do? ')
  const events = scriptAutomaticEvents(
    [profile],
    scenario,
    [{ characterId: base.id, decision }]
  )

  console.log('\nGenerated Events:')
  for (const e of events) {
    console.log(`- [${e.type}] ${e.text}`)
  }
}

run()
