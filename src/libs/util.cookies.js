import Cookies from 'js-cookie'

// 如果没有先定义 cookies 对象，那么尝试给其添加属性或方法就会报错
const cookies = {}

/**
 * @description 存储 cookie 值
 * @param {String} name cookie name
 * @param {String} value cookie value
 * @param {Object} setting cookie setting
 */
cookies.set = function (name = 'default', value = '', cookieSetting = {}) {
  const currentCookieSetting = {
    expires: 1
  }
  Object.assign(currentCookieSetting, cookieSetting)
  // Object.assign(currentCookieSetting, cookieSetting) 的作用是将cookieSetting对象中的所有属性和对应的值都复制到 currentCookieSetting 对象中，并覆盖同名属性的值。如果有同名属性，则后面的属性值会覆盖前面的属性值
  Cookies.set(`d2admin-${process.env.VUE_APP_VERSION}-${name}`, value, currentCookieSetting)
}

/**
 * @description 拿到 cookie 值
 * @param {String} name cookie name
 */
cookies.get = function (name = 'default') {
  return Cookies.get(`d2admin-${process.env.VUE_APP_VERSION}-${name}`)
}

/**
 * @description 拿到 cookie 全部的值
 */
cookies.getAll = function () {
  return Cookies.get()
}

/**
 * @description 删除 cookie
 * @param {String} name cookie name
 */
cookies.remove = function (name = 'default') {
  return Cookies.remove(`d2admin-${process.env.VUE_APP_VERSION}-${name}`)
}

export default cookies
