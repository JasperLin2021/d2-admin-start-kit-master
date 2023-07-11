import { uniqueId } from 'lodash'
import { request } from '@/api/service' //新增
import XEUtils from 'xe-utils'  //新增
import { frameInRoutes } from '@/router/routes' //新增
console.log("process.env.NODE_ENV",process.env.NODE_ENV)
// const _import = require('@/libs/util.import.' + process.env.NODE_ENV) //新增
// const _import = file => require('@/views/' + file).default //新增
// const _import = require(') //新增
const _import = require('@/libs/util.import.' + process.env.NODE_ENV)


// 在JavaScript中，require是一种用于加载模块的方法。它是CommonJS模块系统的一部分，通常用于Node.js环境。
const pluginImport = require('@/libs/util.import.plugin') //新增

/**
 * @description 给菜单数据补充上 path 字段
 * @description https://github.com/d2-projects/d2-admin/issues/209
 * @param {Array} menu 原始的菜单数据
 */
function supplementPath (menu) {
  return menu.map(e => ({
    ...e,
    path: e.path || uniqueId('d2-menu-empty-'),
    ...e.children ? {
      children: supplementPath(e.children)
    } : {}
  }))
}

export const menuHeader = supplementPath([
  // { path: '/index', title: '首页', icon: 'home' },
  // {
  //   title: '页面',
  //   icon: 'folder-o',
  //   children: [
  //     { path: '/page1', title: '页面 1' },
  //     { path: '/page2', title: '页面 2' },
  //     { path: '/page3', title: '页面 3' }
  //   ]
  // }
])

export const menuAside = supplementPath([
  // { path: '/index', title: '首页', icon: 'home' },
  // {
  //   title: '页面',
  //   icon: 'folder-o',
  //   children: [
  //     { path: '/page1', title: '页面 1' },
  //     { path: '/page2', title: '页面 2' },
  //     { path: '/page3', title: '页面 3' }
  //   ]
  // }
])


//以下均为新增
// 请求菜单数据,用于解析路由和侧边栏菜单
export const getMenu = function () {
  return request({
    url: '/api/system/menu/web_router/',
    method: 'get',
    params: {}
  }).then((res) => {
    // 设置动态路由
    const menuData = res.data.data
    sessionStorage.setItem('menuData', JSON.stringify(menuData))
    return menuData
  })
}

/**
 * 校验路由是否有效
 */
export const checkRouter = function (menuData) {
  const result = []
  for (const item of menuData) {
    try {
      if (item.path !== '' && item.component) {
        // console.log('component',require('@/views/system/user/index').default,item.component)
        // console.log('_import', _import)
        // try {
        //   _import('system/user/index')


        // } catch (error) {
        //   console.log('ERROR',error)
        // }
        // console.log("item.component")
        // console.log("item.1111",item)
        (item.component && item.component.substr(0, 8) === 'plugins/') ? pluginImport(item.component.replace('plugins/', '')) : _import(item.component)
      }
      result.push(item)
    } catch (err) {
      // console.log("err111",err)
      // console.log(`导入菜单错误，会导致页面无法访问，请检查文件是否存在：${item.component}`)
    }
  }
  // console.log("checkRouter-result",result)
  return result
}
/**
 * 将获取到的后端菜单数据,解析为前端路由
 */
export const handleRouter = function (menuData) {
  const result = []
  for (const item of menuData) {
    if (item.path !== '' && item.component) {
      const obj = {
        path: item.path,
        name: item.component_name,
        component: (item.component && item.component.substr(0, 8) === 'plugins/') ? pluginImport(item.component.replace('plugins/', '')) : _import(item.component),
        meta: {
          title: item.name,
          auth: true,
          cache: item.cache
        }
      }
      result.push(obj)
    } else {
      if (item.is_link === 0) {
        delete item.path
      }
    }
  }
  frameInRoutes[0].children = [...result]
  console.log("frameInRoutes",frameInRoutes)
  return frameInRoutes
}

/**
 * 将前端的侧边菜单进行处理
 */
export const handleAsideMenu = function (menuData) {
  // 将列表数据转换为树形数据
  const data = XEUtils.toArrayTree(menuData, {
    parentKey: 'parent',
    strict: true
  })
  const menu = [
    { path: '/index', title: '控制台', icon: 'home' },
    ...data
  ]
  console.log("handleAsideMenu-menu",menu)
  console.log("supplementPath-menu", supplementPath(menu))
  return supplementPath(menu)
}
