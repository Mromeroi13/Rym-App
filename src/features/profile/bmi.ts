export interface BmiResult {
  value: number
  category: 'Bajo peso' | 'Normal' | 'Sobrepeso' | 'Obesidad'
}

export function calculateBmi(weightKg: number, heightCm: number): BmiResult {
  const heightM = heightCm / 100
  const value = Math.round((weightKg / (heightM * heightM)) * 10) / 10

  let category: BmiResult['category']
  if (value < 18.5) category = 'Bajo peso'
  else if (value < 25) category = 'Normal'
  else if (value < 30) category = 'Sobrepeso'
  else category = 'Obesidad'

  return { value, category }
}
