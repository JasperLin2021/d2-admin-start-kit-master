// module.exports = file => {
//   console.log("window",window)
//   // console.log("file1",file)
//   // console.log("require('@/views/' + file)",require('@/views/' + file))
//   // console.log("require('@/views/' + file).default",require('@/views/' + file).default)

//   return require('@/views/' + file).default
// }

export default function (file) {
  // console.log("window",window)
  // console.log("file1",file)
  // console.log("require('@/views/' + file)",require('@/views/' + file))
  // console.log("require('@/views/' + file).default",require('@/views/' + file).default)

  return require('@/views/' + file).default
}

