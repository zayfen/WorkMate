<script setup lang="ts">
import TodayTasksCard from '@/components/today-tasks-card/today-tasks-card.vue'
import UpcomingAlerts from '@/components/upcoming-alerts/upcoming-alerts.vue'
import WeeklyStats from '@/components/weekly-stats/weekly-stats.vue'
import QuickActions from '@/components/quick-actions/quick-actions.vue'
</script>

<template>
  <div class="dashboard">
    <div class="grid">
      <TodayTasksCard />
      <UpcomingAlerts />
    </div>
    <div class="grid">
      <WeeklyStats />
      <QuickActions />
    </div>
  </div>
</template>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 16px }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px }
@media (max-width: 960px) {
  .grid { grid-template-columns: 1fr }
}
</style>


