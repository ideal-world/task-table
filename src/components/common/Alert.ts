export enum AlertKind {
  ERROR,
  WARNING,
  INFO,
  SUCCESS,
}

/**
 * 消息提示
 *
 * Message prompt
 *
 * @param message 提示的消息 / Message to prompt
 * @param showTimeSec 显示的时间（秒） / Display time (seconds)
 * @param kind  消息类型 / Message type
 * @param attachEle 附加到的元素 / Element to attach
 */
export function showAlert(message: string, showTimeSec: number = 4, kind: AlertKind = AlertKind.WARNING, attachEle: HTMLElement = document.body) {
  let alertDiv = ``
  switch (kind) {
    case AlertKind.ERROR: {
      alertDiv = `  <div role="alert" class="iw-alert-wrap iw-alert-wrap--error">${message}</div>`
      break
    }
    case AlertKind.WARNING: {
      alertDiv = `  <div role="alert" class="iw-alert-wrap iw-alert-wrap--warning">${message}</div>`
      break
    }
    case AlertKind.INFO: {
      alertDiv = `  <div role="alert" class="iw-alert-wrap iw-alert-wrap--info">${message}</div>`
      break
    }
    case AlertKind.SUCCESS: {
      alertDiv = `  <div role="alert" class="iw-alert-wrap iw-alert-wrap--success">${message}</div>`
      break
    }
    default: {
      alertDiv = `  <div role="alert" class="iw-alert-wrap">${message}</div>`
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
