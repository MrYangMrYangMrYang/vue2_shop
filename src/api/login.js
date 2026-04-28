/**
 * Login API - 登录相关接口模块
 */
import request from '@/utils/request'

/**
 * 1. 获取图形验证码
 * @returns {Promise} 包含 base64 图片和验证码 key
 */
export const getPicCode = () => {
  return request.get('/captcha/image')
}

/**
 * 2. 获取短信验证码
 * @param {string} captchaCode 图形验证码内容
 * @param {string} captchaKey 图形验证码 key
 * @param {string} mobile 手机号
 * @returns {Promise}
 */
export const getMsgCode = (captchaCode, captchaKey, mobile) => {
  return request.post('/captcha/sendSmsCaptcha', {
    form: {
      captchaCode,
      captchaKey,
      mobile
    }
  })
}

/**
 * 3. 验证码登录
 * @param {string} mobile 手机号
 * @param {string} smsCode 短信验证码
 * @returns {Promise} 包含用户信息和 token
 */
export const codeLogin = (mobile, smsCode) => {
  return request.post('/passport/login', {
    form: {
      isParty: false,
      partyData: {},
      mobile,
      smsCode
    }
  })
}
