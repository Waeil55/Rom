import { useEffect, useState } from 'react'
import { getMedicineById } from '../lib/openfda'
import { getAllLocalMedicines, getLocalMedicineById, isLocalId } from '../lib/localMeds'
import { fetchDbMedicines, getDbMedicineById, isDbId } from '../lib/dbMedicines'
import type { Medicine } from '../lib/types'

export function useStudyPool(medicineId?: string | null) {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const dbMeds = await fetchDbMedicines()
      const fullPool = [...getAllLocalMedicines(), ...dbMeds]

      if (medicineId) {
        const single = isLocalId(medicineId)
          ? getLocalMedicineById(medicineId)
          : isDbId(medicineId)
            ? await getDbMedicineById(medicineId)
            : await getMedicineById(medicineId)
        const rest = fullPool.filter((m) => m.id !== medicineId)
        if (!cancelled) setMedicines(single ? [single, ...rest] : fullPool)
      } else {
        if (!cancelled) setMedicines(fullPool)
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
