import request from '@/utils/request'

// 获取搜索商品的列表数据
export const getSearchData = (obj) => {
  const { categoryId, goodsName, page } = obj
  return request.get('/goods/list', {
    params: {
      categoryId,
      goodsName,
      page
    }
  })
}
