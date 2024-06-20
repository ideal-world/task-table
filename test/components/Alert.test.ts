import { describe, expect, it, vi } from 'vitest'
import { AlertKind, showAlert } from '../../src/components/common/Alert'

describe('showAlert', () => {
  function checkAlert(className: string, message: string) {
    const alert = document.querySelector(`.${className}`)!
    expect(alert).not.toBeNull()
    expect(alert.textContent).toBe(message)
  }

  it('should display an error alert', () => {
    vi.useFakeTimers()
    showAlert('Error message', 4, AlertKind.ERROR)
    checkAlert('iw-alert-wrap--error', 'Error message')
    vi.advanceTimersByTime(4000)
    expect(document.querySelector('.iw-alert-wrap--error')).toBeNull()
    vi.useRealTimers()
  })

  it('should display a warning alert', () => {
    vi.useFakeTimers()
    showAlert('Warning message', 4, AlertKind.WARNING)
    checkAlert('iw-alert-wrap--warning', 'Warning message')
    vi.advanceTimersByTime(4000)
    expect(document.querySelector('.iw-alert-wrap--warning')).toBeNull()
    vi.useRealTimers()
  })

  it('should display an info alert', () => {
    vi.useFakeTimers()
    showAlert('Info message', 4, AlertKind.INFO)
    checkAlert('iw-alert-wrap--info', 'Info message')
    vi.advanceTimersByTime(4000)
    expect(document.querySelector('.iw-alert-wrap--info')).toBeNull()
    vi.useRealTimers()
  })

  it('should display a success alert', () => {
    vi.useFakeTimers()
    showAlert('Success message', 4, AlertKind.SUCCESS)
    checkAlert('iw-alert-wrap--success', 'Success message')
    vi.advanceTimersByTime(4000)
    expect(document.querySelector('.iw-alert-wrap--success')).toBeNull()
    vi.useRealTimers()
  })

  it('should remove the alert after the specified time', () => {
    vi.useFakeTimers()
    showAlert('Temporary message', 2, AlertKind.INFO)
    checkAlert('iw-alert-wrap--info', 'Temporary message')
    vi.advanceTimersByTime(2000)
    expect(document.querySelector('.iw-alert-wrap--info')).toBeNull()
    vi.useRealTimers()
  })

  it('should attach the alert to a specific element', () => {
    vi.useFakeTimers()
    const attachEle = document.createElement('div')
    document.body.append(attachEle)
    showAlert('Attached message', 4, AlertKind.WARNING, attachEle)
    const alert = attachEle.querySelector('.iw-alert-wrap--warning')!
    expect(alert).not.toBeNull()
    expect(alert.textContent).toBe('Attached message')
    vi.advanceTimersByTime(4000)
    expect(attachEle.querySelector('.iw-alert-wrap--warning')).toBeNull()
    attachEle.remove()
    vi.useRealTimers()
  })
})
