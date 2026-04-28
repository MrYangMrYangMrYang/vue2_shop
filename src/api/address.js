/**
 * Address API - 收货地址相关接口模块
 */
import request from '@/utils/request'

/**
 * 获取收货地址列表
 * @returns {Promise} 包含用户所有的收货地址
 */
export const getAddressList = () => {
  return request.get('/address/list')
}

/**
 * 新增收货地址
 * @param {Object} data 地址表单数据 (name, phone, region, detail 等)
 * @returns {Promise}
 */
export const addAddress = (data) => {
  return request.post('/address/add', {
    form: data
  })
}

/**
 * 获取指定地址详情
 * @param {number} addressId 地址 ID
 * @returns {Promise}
 */
export const getAddressDetail = (addressId) => {
  return request.get('/address/detail', {
    params: {
      addressId
    }
  })
}

/**
 * 编辑收货地址
 * @param {number} addressId 地址 ID
 * @param {Object} data 修改后的地址表单数据
 * @returns {Promise}
 */
export const editAddress = (addressId, data) => {
  return request.post('/address/edit', {
    addressId,
    form: data
  })
}

/**
 * 删除收货地址
 * @param {number} addressId 地址 ID
 * @returns {Promise}
 */
export const removeAddress = (addressId) => {
  return request.post('/address/remove', { address_id: addressId })
}

/**
 * 设置默认收货地址
 * @param {number} addressId 地址 ID
 * @returns {Promise}
 */
export const setDefaultAddress = (addressId) => {
  return request.post('/address/setDefault', { address_id: addressId })
}
