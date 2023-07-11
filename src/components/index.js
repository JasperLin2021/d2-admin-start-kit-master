import Vue from 'vue'

import d2Container from './d2-container'
// import tableProgress from './table-progress/lib/table-progress.vue'  //新增

// 注意 有些组件使用异步加载会有影响
Vue.component('d2-container', d2Container)
Vue.component('d2-icon', () => import('./d2-icon'))
Vue.component('d2-icon-svg', () => import('./d2-icon-svg/index.vue'))

//以下均为新增
Vue.component('importExcel', () => import('./importExcel/index.vue'))
Vue.component('foreignKey', () => import('./foreign-key/index.vue')) //跟用户管理-部门的显示有关
Vue.component('manyToMany', () => import('./many-to-many/index.vue'))  //跟用户管理-角色的显示有关
Vue.component('d2p-tree-selector', () => import('./tree-selector/lib/tree-selector.vue')) //跟显示样式有关
// Vue.component('dept-format', () => import('./dept-format/lib/dept-format.vue'))
// Vue.component('dvaHtml2pdf', () => import('./dvaHtml2pdf/index.vue'))
// Vue.component('table-progress', tableProgress)
