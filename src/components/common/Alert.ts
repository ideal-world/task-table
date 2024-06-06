export enum AlertKind {
  ERROR,
  WARNING,
  INFO,
  SUCCESS,
}

export function showAlert(message: string, showTimeSec: number, kind: AlertKind = AlertKind.WARNING, attachEle: HTMLElement = document.body) {
  let alertDiv = ``
  switch (kind) {
    case AlertKind.ERROR: {
      alertDiv = `  <div role="alert" class="iw-alert-wrap iw-alert-wrap--error">
   ${message}
  </div>`
      break
    }
    case AlertKind.WARNING: {
      alertDiv = `  <div role="alert" class="iw-alert-wrap iw-alert-wrap--warning">
   ${message}
  </div>`
      break
    }
    case AlertKind.INFO: {
      alertDiv = `  <div role="alert" class="iw-alert-wrap iw-alert-wrap--info">
   ${message}
  </div>`
      break
    }
    case AlertKind.SUCCESS: {
      alertDiv = `  <div role="alert" class="iw-alert-wrap iw-alert-wrap--success">
   ${message}
  </div>`
      break
    }
    default: {
      alertDiv = `  <div role="alert" class="iw-alert-wrap">
   ${message}
  </div>`
      break
    }
  }
  const alertEle = document.createElement('div')
  alertEle.innerHTML = alertDiv
  attachEle.append(alertEle)
  setTimeout(() => {
    alertEle.remove()
  }, showTimeSec * 1000)
}
