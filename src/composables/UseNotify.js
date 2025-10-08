import { useQuasar } from 'quasar'

export default function useNotify () {
  const $q = useQuasar()

  const notifySuccess = (message) => {
    $q.notify({
      type: 'positive',
      message: message || 'Sucesso!',
      position: 'top'
    })
  }

  const notifyError = (message) => {
    $q.notify({
      type: 'negative',
      message: message || 'Erro!',
      position: 'top'
    })
  }

  const confirmDialog = (title, message) => {
    return $q.dialog({
      title: title,
      message: message,
      cancel: true,
      persistent: true
    })
  }

  return {
    notifySuccess,
    notifyError,
    confirmDialog
  }
}