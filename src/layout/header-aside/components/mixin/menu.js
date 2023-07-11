import util from '@/libs/util.js'

export default {
  methods: {
    handleMenuSelect (index, indexPath) {
      console.log("index",index)
      // 当 index 符合 "d2-menu-empty-" 加上一个或多个数字的格式时，或者 index 的值为 undefined 时，条件判断结果为 true
      if (/^d2-menu-empty-\d+$/.test(index) || index === undefined) {

        this.$message.warning('临时菜单')
      } else if (/^https:\/\/|http:\/\//.test(index)) {
        util.open(index)
      } else {
        this.$router.push({
          path: index
        })
      }
    }
  }
}
