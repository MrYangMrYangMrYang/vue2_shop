<template>
  <div class="count-box">
    <button @click="handleSub" class="minus">-</button>
    <input :value="value" @change="handleChange" class="inp" type="text">
    <button @click="handleAdd" class="add">+</button>
  </div>
</template>

<script>
/**
 * CountBox - 通用数字计步器组件
 * 核心功能：
 * 1. 数量加减交互：点击 +/- 按钮实现数值的增减
 * 2. 边界约束：支持配置最小值 (默认为 1) 与最大值 (库存限制)
 * 3. 手动录入校验：支持 input 直接修改，并自动过滤非法字符、负数及超限数值
 * 4. 双向绑定支持：基于 v-model (props: value, event: input) 的标准实现
 */
export default {
  props: {
    // 当前计步器的数值
    value: {
      type: Number,
      default: 1
    },
    // 最大允许数值 (通常为商品库存)
    max: {
      type: Number,
      default: 999
    }
  },
  methods: {
    /**
     * 减号点击事件
     */
    handleSub () {
      // 数量下限校验：最低不能小于 1
      if (this.value <= 1) {
        return
      }
      this.$emit('input', this.value - 1)
    },
    /**
     * 加号点击事件
     */
    handleAdd () {
      // 数量上限校验：不能超过库存
      if (this.value >= this.max) {
        this.$toast(`库存不足，最多购买${this.max}件`)
        return
      }
      this.$emit('input', this.value + 1)
    },
    /**
     * 用户手动在输入框修改数值的回调
     * 包含严格的类型与范围校验逻辑
     * @param {Event} e
     */
    handleChange (e) {
      const num = +e.target.value // 转为数字，非法输入会得到 NaN

      // 1. 非法输入拦截 (非数字、负数)
      if (isNaN(num) || num < 1) {
        e.target.value = this.value // 强行回退 UI 显示
        return
      }

      // 2. 超出上限拦截
      if (num > this.max) {
        this.$toast(`库存不足，最多购买${this.max}件`)
        e.target.value = this.max
        this.$emit('input', this.max)
        return
      }

      // 3. 校验通过，通知父组件更新数据
      this.$emit('input', num)
    }
  }
}
</script>

<style lang="less" scoped>
.count-box {
  width: 110px;
  display: flex;
  .add, .minus {
    width: 30px;
    height: 30px;
    outline: none;
    border: none;
    background-color: #efefef;
  }
  .inp {
    width: 40px;
    height: 30px;
    outline: none;
    border: none;
    margin: 0 5px;
    background-color: #efefef;
    text-align: center;
  }
}
</style>
