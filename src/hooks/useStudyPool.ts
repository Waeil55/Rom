import { useEffect, useState } from 'react'
import { getMedicineById } from '../lib/openfda'
import { getAllLocalMedicines, getLocalMedicineById, isLocalId } from '../lib/localMeds'
import type { Medicine } from '../lib/types'

export function useStudyPool(medicineId?: string | null) {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const localPool = getAllLocalMedicines()

      if (medicineId) {
        const single = isLocalId(medicineId) ? getLocalMedicineById(medicineId) : await getMedicineById(medicineId)
        const rest = localPool.filter((m) => m.id !== medicineId)
        if (!cancelled) setMedicines(single ? [single, ...rest] : localPool)
      } else {
        if (!cancelled) setMedicines(localPool)
      }
      if (!cancelled) setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [medicineId])

  return { medicines, loading }
}
