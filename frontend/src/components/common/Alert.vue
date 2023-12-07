<script lang ="ts">
export enum AlertKind {
  ERROR,
  WARNING,
  INFO,
  SUCCESS,
}

export function showAlert(message: string, showTimeSec: number, kind: AlertKind = AlertKind.WARNING, attachEle: HTMLElement = document.body) {
  let alertDiv = ``
  const messageDiv = `<span>${message}</span>`
  switch (kind) {
    case AlertKind.ERROR: {
      alertDiv = `  <div role="alert" class="iw-alert iw-alert--error">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
   ${messageDiv}
  </div>`
      break
    }
    case AlertKind.WARNING: {
      alertDiv = `  <div role="alert" class="iw-alert iw-alert--warning">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
   ${messageDiv}
  </div>`
      break
    }
    case AlertKind.INFO: {
      alertDiv = `  <div role="alert" class="iw-alert iw-alert--info">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
   ${messageDiv}
  </div>`
      break
    }
    case AlertKind.SUCCESS: {
      alertDiv = `  <div role="alert" class="iw-alert iw-alert--success">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
   ${messageDiv}
  </div>`
      break
    }
    default: {
      alertDiv = `  <div role="alert" class="iw-alert">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
   ${messageDiv}
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
</script>

<script setup lang="ts">
// "default" is not exported
</script>

<style lang="css">
.iw-alert {
  @apply alert alert-error absolute z-[10000] bottom-2 right-2 p-1 w-1/2 rounded-lg;
}

.iw-alert--success {
  @apply alert-success;
}

.iw-alert--info {
  @apply alert-info;
}

.iw-alert--warning {
  @apply alert-warning;
}

.iw-alert--error {
  @apply alert-error;
}
</style>
