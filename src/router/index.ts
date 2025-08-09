import { createRouter, createWebHashHistory } from 'vue-router'

const HomeView = () => import('@/views/home-view/home-view.vue')
const AboutView = () => import('@/views/about-view/about-view.vue')
const Layout = () => import('@/views/layout.vue')
const DashboardView = () => import('@/views/dashboard-view/dashboard-view.vue')
const CalendarViews = () => import('@/views/calendar-views/calendar-views.vue')
const ProjectsView = () => import('@/views/projects-view/projects-view.vue')
const TasksView = () => import('@/views/tasks-view/tasks-view.vue')
const ReportsView = () => import('@/views/reports-view/reports-view.vue')
const MessagesView = () => import('@/views/messages-view/messages-view.vue')
const UserProfileView = () => import('@/views/user-profile-view/user-profile-view.vue')
const SettingsView = () => import('@/views/settings-view/settings-view.vue')

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: AboutView },
    {
      path: '/app',
      children: [
        { path: '', redirect: '/app/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: DashboardView, meta: { title: '仪表盘' } },
        { path: 'calendar', name: 'calendar', component: CalendarViews, meta: { title: '日程' } },
        { path: 'projects', name: 'projects', component: ProjectsView, meta: { title: '项目' } },
        { path: 'tasks', name: 'tasks', component: TasksView, meta: { title: '任务' } },
        { path: 'reports', name: 'reports', component: ReportsView, meta: { title: '报告' } },
        { path: 'messages', name: 'messages', component: MessagesView, meta: { title: '消息' } },
        { path: 'user', name: 'user', component: UserProfileView, meta: { title: '用户资料' } },
        { path: 'settings', name: 'settings', component: SettingsView, meta: { title: '设置' } }
      ]
    }
  ]
})

export default router


