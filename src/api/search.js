/**
 * Search API - 商品搜索相关接口模块
 */
import request from '@/utils/request'

/**
 * 获取搜索商品的列表数据
 * @param {Object} obj 搜索参数对象
 * @param {number} obj.categoryId 分类 ID
 * @param {string} obj.goodsName 商品名称关键词
 * @param {number} obj.page 当前页码
 * @param {string} obj.sortType 排序类型: all, sales, price
 * @param {number} obj.sortPrice 价格排序: 0 (不限), 1 (升序), -1 (降序)
 * @returns {Promise} 包含商品搜索结果的分页数据
 */
export const getSearchData = (obj) => {
  const { categoryId, goodsName, page, sortType, sortPrice } = obj
  return request.get('/goods/list', {
    params: {
      categoryId,
      goodsName,
      page,
      sortType,
      sortPrice
    }
  })
}
