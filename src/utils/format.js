/**
 * 格式化价格，保留两位小数并添加货币符号
 * @param {number|string} price 价格
 * @returns {string} 格式化后的价格
 */
export const formatPrice = (price) => {
  if (isNaN(price)) return '0.00'
  return parseFloat(price).toFixed(2)
}

/**
 * 格式化销量数据
 * @param {number} sales 销量
 * @returns {string} 格式化后的销量
 */
export const formatSales = (sales) => {
  if (sales > 10000) {
    return (sales / 10000).toFixed(1) + 'w+'
  }
  return sales + '件'
}
