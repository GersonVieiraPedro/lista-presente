import { Suspense } from 'react'
import Lista from '../components/listaPresentes'

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <Lista />
    </Suspense>
  )
}
