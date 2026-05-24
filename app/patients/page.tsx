import { AppLayout } from '@/components/layout/app-layout'
import { PatientList } from '@/components/patients/patient-list'

export default function PatientsPage() {
  return (
    <AppLayout>
      <PatientList />
    </AppLayout>
  )
}
