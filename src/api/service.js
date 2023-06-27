import axios from 'axios'  //必填
import Adapter from 'axios-mock-adapter'
import { get } from 'lodash'
import util from '@/libs/util'
// import { errorLog, errorCreate } from './tools'
import { dataNotFound, errorLog, errorCreate } from './tools'
import router from '@/router' //新增-必填
import qs from 'qs' //新增
// 当需要将一个 JavaScript 对象转换为 URL 查询字符串时，可以使用 qs 模块的 stringify 方法
// 当需要将一个 URL 查询字符串解析为 JavaScript 对象时，可以使用 qs 模块的 parse 方法

/**
 * @description 创建请求实例
 */
//新增
export function getErrorMessage (msg) {
  if (typeof msg === 'string') {
    return msg
  }
  if (typeof msg === 'object') {
    if (msg.code === 'token_not_valid') {
      util.cookies.remove('token')
      util.cookies.remove('uuid')
      router.push({ path: '/login' })
      router.go(0)
      return '登录超时，请重新登录！'
    }
    if (msg.code === 'user_not_found') {
      util.cookies.remove('token')
      util.cookies.remove('uuid')
      router.push({ path: '/login' })
      router.go(0)
      // 当调用 router.go(0) 时，会重新加载当前页面，即使该页面在浏览器缓存中已存在
      return '用户无效，请重新登录！'
    }
    return Object.values(msg)
    // Object.values(msg) 的作用是将对象 msg 中所有的值返回为一个数组
  }
  if (Object.prototype.toString.call(msg).slice(8, -1) === 'Array') {
//在这段代码中，Object.prototype.toString.call(msg) 的作用是获取 msg 的类型信息，返回一个以 [object 类型] 的字符串形式表示的类型信息。例如，如果 msg 是一个对象，那么返回的字符串就是 [object Object]。
// .slice(8, -1) 则是为了从这个字符串中提取出类型名称，去掉前面的 [object  和最后的 ]，只留下类型名部分。比如 [object Array] 就会被截取成 Array。
// 所以整个表达式的作用就是判断 msg 是否为数组类型，如果是则返回 msg，否则返回其他值。
    return msg
  }
  return msg
}



function createService () {
  // 创建一个 axios 实例
  const service = axios.create(
    //新增
    {
      baseURL: util.baseURL(),
      timeout: 20000,
      paramsSerializer: (params) => qs.stringify(params, { indices: false })
// 默认情况下，Axios 使用了 JSON.stringify 函数将参数对象转换为 JSON 格式的字符串。但有些服务器只支持接收 URL 查询参数格式的数据，因此需要将参数对象序列化为 URL 查询参数字符串，这就需要使用 paramsSerializer 这个选项了
// 例如，如果有一个名为 foo 的参数，其值为数组 [1, 2]，那么默认情况下生成的查询参数字符串会是 foo[0]=1&foo[1]=2。
// 通过设置 { indices: false }，可以避免在查询参数字符串中显示数组索引，使其更加简洁和易读。例如，使用该选项后，上述示例中生成的查询参数字符串会是 foo=1&foo=2
    }
    )


  // 请求拦截
  service.interceptors.request.use(
    config => config,
    error => {
      // 发送失败
      console.log(error)
      return Promise.reject(error)
    }
  )
  // 响应拦截
  service.interceptors.response.use(
    // response => {
    //   // dataAxios 是 axios 返回数据中的 data
    //   const dataAxios = response.data
    //   // 这个状态码是和后端约定的
    //   const { code } = dataAxios
    //   // 根据 code 进行判断
    //   if (code === undefined) {
    //     // 如果没有 code 代表这不是项目后端开发的接口 比如可能是 D2Admin 请求最新版本
    //     return dataAxios
    //   } else {
    //     // 有 code 代表这是一个后端接口 可以进行进一步的判断
    //     switch (code) {
    //       case 0:
    //         // [ 示例 ] code === 0 代表没有错误
    //         return dataAxios.data
    //       case 'xxx':
    //         // [ 示例 ] 其它和后台约定的 code
    //         errorCreate(`[ code: xxx ] ${dataAxios.msg}: ${response.config.url}`)
    //         break
    //       default:
    //         // 不是正确的 code
    //         errorCreate(`${dataAxios.msg}: ${response.config.url}`)
    //         break
    //     }
    //   }
    // },

    async response => {
      // dataAxios 是 axios 返回数据中的 data
      let dataAxios = response.data || null
      if (response.headers['content-disposition']) {
        dataAxios = response
      }
      // 这个状态码是和后端约定的
      const { code } = dataAxios
      // 根据 code 进行判断
      if (code === undefined) {
        // 如果没有 code 代表这不是项目后端开发的接口 比如可能是 D2Admin 请求最新版本
        return dataAxios
      } else {
        // 有 code 代表这是一个后端接口 可以进行进一步的判断
        switch (code) {
          case 2000:
            // [ 示例 ] code === 2000 代表没有错误
            // TODO 可能结果还需要code和msg进行后续处理，所以去掉.data返回全部结果
            // return dataAxios.data
            return dataAxios
          case 401:
            if (response.config.url === 'api/login/') {
              errorCreate(`${getErrorMessage(dataAxios.msg)}`)
              break
            }
            var res = await refreshTken()
            // 设置请求超时次数
            var config = response.config
            util.cookies.set('token', res.data.access)
            config.headers.Authorization = 'JWT ' + res.data.access
            config.__retryCount = config.__retryCount || 0
            if (config.__retryCount >= config.retry) {
              // 如果重试次数超过3次则跳转登录页面
              util.cookies.remove('token')
              util.cookies.remove('uuid')
              router.push({ path: '/login' })
              errorCreate('认证已失效,请重新登录~')
              break
            }
            config.__retryCount += 1
            return service(config)
          case 404:
            dataNotFound(`${dataAxios.msg}`)
            break
          case 4000:
            // 删除cookie
            errorCreate(`${getErrorMessage(dataAxios.msg)}`)
            break
          case 400:
            errorCreate(`${dataAxios.msg}`)
            break
          default:
            // 不是正确的 code
            errorCreate(`${dataAxios.msg}: ${response.config.url}`)
            break
        }
      }
    },


    error => {
      const status = get(error, 'response.status')
      switch (status) {
        case 400: error.message = '请求错误'; break
        // case 401: error.message = '未授权，请登录'; break
        case 401:
          util.cookies.remove('token')
          util.cookies.remove('uuid')
          util.cookies.remove('refresh')
          router.push({ path: '/login' })
          error.message = '认证已失效,请重新登录~'
          break
        case 403: error.message = '拒绝访问'; break
        case 404: error.message = `请求地址出错: ${error.response.config.url}`; break
        case 408: error.message = '请求超时'; break
        case 500: error.message = '服务器内部错误'; break
        case 501: error.message = '服务未实现'; break
        case 502: error.message = '网关错误'; break
        case 503: error.message = '服务不可用'; break
        case 504: error.message = '网关超时'; break
        case 505: error.message = 'HTTP版本不受支持'; break
        default: break
      }
      errorLog(error)
      return Promise.reject(error)
    }
  )
  return service
}

/**
 * @description 创建请求方法
 * @param {Object} service axios 实例
 */
function createRequestFunction (service) {
  return function (config) {
    const token = util.cookies.get('token')

  // 新增
  // 校验是否为租户模式。租户模式把域名替换成 域名 加端口
  // 进行布尔值兼容
    var params = get(config, 'params', {})
    for (const key of Object.keys(params)) {
      if (String(params[key]) === 'true') {
        params[key] = 1
      }
      if (String(params[key]) === 'false') {
        params[key] = 0
      }
    }



    const configDefault = {
      headers: {
        // Authorization: token,
        Authorization: 'JWT ' + token,
        'Content-Type': get(config, 'headers.Content-Type', 'application/json')
      },
      timeout: 60000,
      // baseURL: process.env.VUE_APP_API,
      baseURL: util.baseURL(),
      data: {},
      params: params, //新增
      retry: 3, // 重新请求次数-新增
      retryDelay: 1000 // 重新请求间隔-新增
    }

    return service(Object.assign(configDefault, config))
  }
}

// 用于真实网络请求的实例和请求方法
export const service = createService()
export const request = createRequestFunction(service)

// 用于模拟网络请求的实例和请求方法
export const serviceForMock = createService()
export const requestForMock = createRequestFunction(serviceForMock)

// 网络请求数据模拟工具
export const mock = new Adapter(serviceForMock)


// 刷新token-新增
const refreshTken = function () {
  const refresh = util.cookies.get('refresh')
  return request({
    url: 'token/refresh/',
    method: 'post',
    data: {
      refresh: refresh
    }
  })
}

//新增
/**
 * 下载文件
 * @param url
 * @param params
 * @param method
 * @param filename
 */
export const downloadFile = function ({
  url,
  params,
  method,
  filename = '文件导出'
}) {
  request({
    url: url,
    method: method,
    params: params,
    responseType: 'blob'
    // headers: {Accept: 'application/vnd.openxmlformats-officedocument'}
  }).then(res => {
    const xlsxName = window.decodeURI(res.headers['content-disposition'].split('=')[1])
    const fileName = xlsxName || `${filename}.xlsx`
    if (res) {
      const blob = new Blob([res.data], { type: 'charset=utf-8' })
      const elink = document.createElement('a')
      elink.download = fileName
      elink.style.display = 'none'
      elink.href = URL.createObjectURL(blob)
      document.body.appendChild(elink)
      elink.click()
      URL.revokeObjectURL(elink.href) // 释放URL 对象0
      document.body.removeChild(elink)
    }
  })
}
