<script setup lang="ts">
import { ref } from 'vue'
import MenuComp, { MenuOffsetKind } from './Menu.vue'

const emit = defineEmits(['selectIcon'])
const iconCompRef = ref()

async function selectIcon(event: Event) {
  const target = event.target as HTMLInputElement
  emit('selectIcon', target.classList[0])
  iconCompRef.value.close()
}

function showContainer(event: Event, offsetKind: MenuOffsetKind = MenuOffsetKind.MEDIUM_BOTTOM) {
  iconCompRef.value.show(event, offsetKind)
}

function hideContainer() {
  iconCompRef.value.close()
}

defineExpose({
  show: showContainer,
  close: hideContainer,
})
</script>

<template>
  <MenuComp ref="iconCompRef">
    <div class="iw-icon-picker flex flex-wrap w-96" @click="selectIcon">
      <i class="octicon-alert-24" />
      <i class="octicon-alert-fill-24" />
      <i class="octicon-archive-24" />
      <i class="octicon-arrow-both-24" />
      <i class="octicon-arrow-down-24" />
      <i class="octicon-arrow-down-left-24" />
      <i class="octicon-arrow-down-right-24" />
      <i class="octicon-arrow-left-24" />
      <i class="octicon-arrow-right-24" />
      <i class="octicon-arrow-switch-24" />
      <i class="octicon-arrow-up-24" />
      <i class="octicon-arrow-up-left-24" />
      <i class="octicon-arrow-up-right-24" />
      <i class="octicon-beaker-24" />
      <i class="octicon-bell-24" />
      <i class="octicon-bell-fill-24" />
      <i class="octicon-bell-slash-24" />
      <i class="octicon-blocked-24" />
      <i class="octicon-bold-24" />
      <i class="octicon-book-24" />
      <i class="octicon-bookmark-24" />
      <i class="octicon-bookmark-fill-24" />
      <i class="octicon-bookmark-slash-24" />
      <i class="octicon-bookmark-slash-fill-24" />
      <i class="octicon-briefcase-24" />
      <i class="octicon-broadcast-24" />
      <i class="octicon-browser-24" />
      <i class="octicon-bug-24" />
      <i class="octicon-calendar-24" />
      <i class="octicon-check-24" />
      <i class="octicon-check-circle-24" />
      <i class="octicon-check-circle-fill-24" />
      <i class="octicon-checkbox-24" />
      <i class="octicon-checklist-24" />
      <i class="octicon-chevron-down-24" />
      <i class="octicon-chevron-left-24" />
      <i class="octicon-chevron-right-24" />
      <i class="octicon-chevron-up-24" />
      <i class="octicon-circle-24" />
      <i class="octicon-circle-slash-24" />
      <i class="octicon-clock-24" />
      <i class="octicon-clock-fill-24" />
      <i class="octicon-cloud-24" />
      <i class="octicon-cloud-offline-24" />
      <i class="octicon-code-24" />
      <i class="octicon-code-of-conduct-24" />
      <i class="octicon-code-review-24" />
      <i class="octicon-code-square-24" />
      <i class="octicon-codescan-24" />
      <i class="octicon-codescan-checkmark-24" />
      <i class="octicon-codespaces-24" />
      <i class="octicon-columns-24" />
      <i class="octicon-command-palette-24" />
      <i class="octicon-comment-24" />
      <i class="octicon-comment-discussion-24" />
      <i class="octicon-commit-24" />
      <i class="octicon-container-24" />
      <i class="octicon-copilot-24" />
      <i class="octicon-copy-24" />
      <i class="octicon-cpu-24" />
      <i class="octicon-credit-card-24" />
      <i class="octicon-cross-reference-24" />
      <i class="octicon-dash-24" />
      <i class="octicon-database-24" />
      <i class="octicon-dependabot-24" />
      <i class="octicon-desktop-download-24" />
      <i class="octicon-device-camera-video-24" />
      <i class="octicon-device-desktop-24" />
      <i class="octicon-device-mobile-24" />
      <i class="octicon-devices-24" />
      <i class="octicon-diamond-24" />
      <i class="octicon-diff-24" />
      <i class="octicon-discussion-closed-24" />
      <i class="octicon-discussion-duplicate-24" />
      <i class="octicon-discussion-outdated-24" />
      <i class="octicon-dot-24" />
      <i class="octicon-dot-fill-24" />
      <i class="octicon-download-24" />
      <i class="octicon-duplicate-24" />
      <i class="octicon-eye-24" />
      <i class="octicon-eye-closed-24" />
      <i class="octicon-file-24" />
      <i class="octicon-file-binary-24" />
      <i class="octicon-file-code-24" />
      <i class="octicon-file-diff-24" />
      <i class="octicon-file-directory-24" />
      <i class="octicon-file-directory-fill-24" />
      <i class="octicon-file-directory-symlink-24" />
      <i class="octicon-file-media-24" />
      <i class="octicon-file-submodule-24" />
      <i class="octicon-file-symlink-file-24" />
      <i class="octicon-file-zip-24" />
      <i class="octicon-filter-24" />
      <i class="octicon-filter-remove-24" />
      <i class="octicon-flame-24" />
      <i class="octicon-fold-24" />
      <i class="octicon-fold-down-24" />
      <i class="octicon-fold-up-24" />
      <i class="octicon-gear-24" />
      <i class="octicon-gift-24" />
      <i class="octicon-git-branch-24" />
      <i class="octicon-git-commit-24" />
      <i class="octicon-git-compare-24" />
      <i class="octicon-git-merge-24" />
      <i class="octicon-git-merge-queue-24" />
      <i class="octicon-git-pull-request-24" />
      <i class="octicon-git-pull-request-closed-24" />
      <i class="octicon-git-pull-request-draft-24" />
      <i class="octicon-globe-24" />
      <i class="octicon-goal-24" />
      <i class="octicon-grabber-24" />
      <i class="octicon-graph-24" />
      <i class="octicon-hash-24" />
      <i class="octicon-heading-24" />
      <i class="octicon-heart-24" />
      <i class="octicon-heart-fill-24" />
      <i class="octicon-history-24" />
      <i class="octicon-home-24" />
      <i class="octicon-home-fill-24" />
      <i class="octicon-horizontal-rule-24" />
      <i class="octicon-hourglass-24" />
      <i class="octicon-hubot-24" />
      <i class="octicon-image-24" />
      <i class="octicon-inbox-24" />
      <i class="octicon-infinity-24" />
      <i class="octicon-info-24" />
      <i class="octicon-issue-closed-24" />
      <i class="octicon-issue-draft-24" />
      <i class="octicon-issue-opened-24" />
      <i class="octicon-issue-reopened-24" />
      <i class="octicon-issue-tracked-by-24" />
      <i class="octicon-issue-tracks-24" />
      <i class="octicon-italic-24" />
      <i class="octicon-iterations-24" />
      <i class="octicon-kebab-horizontal-24" />
      <i class="octicon-key-24" />
      <i class="octicon-law-24" />
      <i class="octicon-light-bulb-24" />
      <i class="octicon-link-24" />
      <i class="octicon-link-external-24" />
      <i class="octicon-list-ordered-24" />
      <i class="octicon-list-unordered-24" />
      <i class="octicon-location-24" />
      <i class="octicon-lock-24" />
      <i class="octicon-log-24" />
      <i class="octicon-mail-24" />
      <i class="octicon-megaphone-24" />
      <i class="octicon-mention-24" />
      <i class="octicon-milestone-24" />
      <i class="octicon-mirror-24" />
      <i class="octicon-moon-24" />
      <i class="octicon-mortar-board-24" />
      <i class="octicon-move-to-bottom-24" />
      <i class="octicon-move-to-end-24" />
      <i class="octicon-move-to-start-24" />
      <i class="octicon-move-to-top-24" />
      <i class="octicon-multi-select-24" />
      <i class="octicon-mute-24" />
      <i class="octicon-no-entry-24" />
      <i class="octicon-north-star-24" />
      <i class="octicon-note-24" />
      <i class="octicon-number-24" />
      <i class="octicon-organization-24" />
      <i class="octicon-package-24" />
      <i class="octicon-package-dependencies-24" />
      <i class="octicon-package-dependents-24" />
      <i class="octicon-paper-airplane-24" />
      <i class="octicon-paperclip-24" />
      <i class="octicon-passkey-fill-24" />
      <i class="octicon-paste-24" />
      <i class="octicon-pencil-24" />
      <i class="octicon-people-24" />
      <i class="octicon-person-24" />
      <i class="octicon-person-add-24" />
      <i class="octicon-person-fill-24" />
      <i class="octicon-pin-24" />
      <i class="octicon-pin-slash-24" />
      <i class="octicon-pivot-column-24" />
      <i class="octicon-play-24" />
      <i class="octicon-plug-24" />
      <i class="octicon-plus-24" />
      <i class="octicon-plus-circle-24" />
      <i class="octicon-project-24" />
      <i class="octicon-project-roadmap-24" />
      <i class="octicon-project-symlink-24" />
      <i class="octicon-project-template-24" />
      <i class="octicon-pulse-24" />
      <i class="octicon-question-24" />
      <i class="octicon-quote-24" />
      <i class="octicon-read-24" />
      <i class="octicon-rel-file-path-24" />
      <i class="octicon-reply-24" />
      <i class="octicon-repo-24" />
      <i class="octicon-repo-clone-24" />
      <i class="octicon-repo-forked-24" />
      <i class="octicon-repo-locked-24" />
      <i class="octicon-repo-pull-24" />
      <i class="octicon-repo-push-24" />
      <i class="octicon-repo-template-24" />
      <i class="octicon-report-24" />
      <i class="octicon-rocket-24" />
      <i class="octicon-rows-24" />
      <i class="octicon-rss-24" />
      <i class="octicon-ruby-24" />
      <i class="octicon-screen-full-24" />
      <i class="octicon-screen-normal-24" />
      <i class="octicon-search-24" />
      <i class="octicon-server-24" />
      <i class="octicon-share-24" />
      <i class="octicon-share-android-24" />
      <i class="octicon-shield-24" />
      <i class="octicon-shield-check-24" />
      <i class="octicon-shield-lock-24" />
      <i class="octicon-shield-slash-24" />
      <i class="octicon-shield-x-24" />
      <i class="octicon-sidebar-collapse-24" />
      <i class="octicon-sidebar-expand-24" />
      <i class="octicon-sign-in-24" />
      <i class="octicon-sign-out-24" />
      <i class="octicon-single-select-24" />
      <i class="octicon-skip-24" />
      <i class="octicon-skip-fill-24" />
      <i class="octicon-smiley-24" />
      <i class="octicon-sort-asc-24" />
      <i class="octicon-sort-desc-24" />
      <i class="octicon-sponsor-tiers-24" />
      <i class="octicon-square-24" />
      <i class="octicon-square-fill-24" />
      <i class="octicon-squirrel-24" />
      <i class="octicon-stack-24" />
      <i class="octicon-star-24" />
      <i class="octicon-star-fill-24" />
      <i class="octicon-stop-24" />
      <i class="octicon-stopwatch-24" />
      <i class="octicon-strikethrough-24" />
      <i class="octicon-sun-24" />
      <i class="octicon-sync-24" />
      <i class="octicon-tab-24" />
      <i class="octicon-table-24" />
      <i class="octicon-tag-24" />
      <i class="octicon-tasklist-24" />
      <i class="octicon-telescope-24" />
      <i class="octicon-telescope-fill-24" />
      <i class="octicon-terminal-24" />
      <i class="octicon-thumbsdown-24" />
      <i class="octicon-thumbsup-24" />
      <i class="octicon-tools-24" />
      <i class="octicon-tracked-by-closed-completed-24" />
      <i class="octicon-tracked-by-closed-not-planned-24" />
      <i class="octicon-trash-24" />
      <i class="octicon-triangle-down-24" />
      <i class="octicon-triangle-left-24" />
      <i class="octicon-triangle-right-24" />
      <i class="octicon-triangle-up-24" />
      <i class="octicon-trophy-24" />
      <i class="octicon-typography-24" />
      <i class="octicon-unfold-24" />
      <i class="octicon-unlink-24" />
      <i class="octicon-unlock-24" />
      <i class="octicon-unmute-24" />
      <i class="octicon-unread-24" />
      <i class="octicon-unverified-24" />
      <i class="octicon-upload-24" />
      <i class="octicon-verified-24" />
      <i class="octicon-versions-24" />
      <i class="octicon-video-24" />
      <i class="octicon-workflow-24" />
      <i class="octicon-x-24" />
      <i class="octicon-x-circle-24" />
      <i class="octicon-x-circle-fill-24" />
      <i class="octicon-zap-24" />
      <i class="octicon-zoom-in-24" />
      <i class="octicon-zoom-out-24" />
    </div>
  </MenuComp>
</template>

<style lang="css" scoped>
.iw-icon-picker {
  &>i {
    @apply p-0.5
  }
}
</style>
