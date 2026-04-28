/**
 * Category API - 商品分类相关接口模块
 */
import request from '@/utils/request'

/**
 * 获取全部分类数据
 * @returns {Promise} 包含分类树形结构数据
 */
export const getCategoryData = () => {
  return request.get('/category/list')
}
