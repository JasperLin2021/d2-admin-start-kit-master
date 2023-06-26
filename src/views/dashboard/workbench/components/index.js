import { markRaw } from 'vue'

const resultComps = {}
const requireComponent = require.context(
  './', // 在当前目录下查找
  false, // 不遍历子文件夹
  /\.vue$/ // 正则匹配 以 .vue结尾的文件
)
requireComponent.keys().forEach(fileName => {
  const comp = requireComponent(fileName)
  resultComps[fileName.replace(/^\.\/(.*)\.\w+$/, '$1')] = comp.default
})
export default markRaw(resultComps)


// 这段代码的作用是动态加载指定目录下（包括子目录）的所有 Vue 单文件组件，并将它们转换为组件对象并存储在一个字典中，最终导出这个字典。该字典的 key 值是每个 Vue 组件文件名去掉路径和后缀之后的部分，value 是对应的组件对象。
// 具体来说，代码中使用了 require.context 方法创建了一个上下文环境，用于查找指定目录下的 Vue 组件文件。然后通过遍历这些文件，使用 comp.default 来获取组件对象，并将其存储在 resultComps 字典对象中。在存储时，使用文件名（去掉路径和后缀）作为 key。
// 此外，还使用了 markRaw 函数来标记组件对象为“原始值”，以避免在组件树中出现响应式数据的问题。
