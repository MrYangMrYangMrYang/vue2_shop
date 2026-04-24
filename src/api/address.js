import request from '@/utils/request'

// 获取地址列表
export const getAddressList = () => {
  return request.get('/address/list')
}

// 新增地址
export const addAddress = (data) => {
  return request.post('/address/add', {
    form: data
  })
}

// 获取地址详情
export const getAddressDetail = (addressId) => {
  return request.get('/address/detail', {
    params: {
      addressId
    }
  })
}

// 编辑地址
export const editAddress = (addressId, data) => {
  return request.post('/address/edit', {
    addressId,
    form: data
  })
}

// 删除收货地址
export const removeAddress = (addressId) => {
  return request.post('/address/remove', { address_id: addressId })
}

// 设置默认地址
export const setDefaultAddress = (addressId) => {
  return request.post('/address/setDefault', { address_id: addressId })
}
