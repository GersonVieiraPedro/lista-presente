// app/pagamento/sucesso/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'

export default function PagamentoSucesso() {
  const params = useSearchParams()

  const collectionId = params.get('collection_id')
  const status = params.get('status')
  const paymentType = params.get('payment_type')
  const preferenceId = params.get('preference_id')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-green-50 p-6">
      <h1 className="mb-4 text-2xl font-bold text-green-700">
        Pagamento aprovado ✅
      </h1>
      <p className="mb-2 text-green-800">
        ID da transação: <strong>{collectionId}</strong>
      </p>
      <p className="mb-2 text-green-800">
        Status: <strong>{status}</strong>
      </p>
      <p className="mb-2 text-green-800">
        Tipo de pagamento: <strong>{paymentType}</strong>
      </p>
      <p className="mb-2 text-green-800">
        ID da preferência: <strong>{preferenceId}</strong>
      </p>
    </div>
  )
}
