import { useQuasar } from 'quasar'

export default function useNotify () {
  const $q = useQuasar()

  const notifySuccess = (message) => {
    try {
      if ($q && $q.notify) {
        $q.notify({
          type: 'positive',
          message: message || 'Sucesso!',
          position: 'top'
        })
      } else {
        console.log('✅ Sucesso:', message || 'Sucesso!')
      }
    } catch {
      console.log('✅ Sucesso:', message || 'Sucesso!')
    }
  }

  const notifyError = (message) => {
    try {
      if ($q && $q.notify) {
        $q.notify({
          type: 'negative',
          message: message || 'Erro!',
          position: 'top'
        })
      } else {
        console.error('❌ Erro:', message || 'Erro!')
      }
    } catch {
      console.error('❌ Erro:', message || 'Erro!')
    }
  }

  const confirmDialog = (title, message) => {
    return new Promise((resolve) => {
      try {
        if ($q && $q.dialog) {
          $q.dialog({
            title: title,
            message: message,
            cancel: true,
            persistent: true
          }).onOk(() => {
            resolve(true)
          }).onCancel(() => {
            resolve(false)
          })
        } else {
          // Fallback para quando $q.dialog não estiver disponível
          if (confirm(`${title}\n\n${message}`)) {
            resolve(true)
          } else {
            resolve(false)
          }
        }
      } catch {
        console.error('Erro no dialog')
        if (confirm(`${title}\n\n${message}`)) {
          resolve(true)
        } else {
          resolve(false)
        }
      }
    })
  }

  return {
    notifySuccess,
    notifyError,
    confirmDialog
  }
}