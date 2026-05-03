import { areaList } from '@/utils/area'

export default {
  methods: {
    parseRegion (addr) {
      if (!addr) return '其他'

      let p = ''
      let c = ''
      let r = ''

      if (addr.province_id && areaList.province_list[addr.province_id]) {
        p = areaList.province_list[addr.province_id]
      }
      if (addr.city_id && areaList.city_list[addr.city_id]) {
        c = areaList.city_list[addr.city_id]
      }
      if (addr.region_id && areaList.county_list[addr.region_id]) {
        r = areaList.county_list[addr.region_id]
      }

      if (!p || !c || !r) {
        if (typeof addr.region === 'string' && addr.region.includes(',')) {
          const arr = addr.region.split(',')
          p = p || arr[0] || ''
          c = c || arr[1] || ''
          r = r || arr[2] || ''
        } else if (addr.region && (Array.isArray(addr.region) || typeof addr.region === 'object')) {
          const getVal = (obj) => {
            if (!obj) return ''
            if (typeof obj === 'string') return obj
            return obj.label || obj.value || ''
          }

          if (Array.isArray(addr.region)) {
            p = p || getVal(addr.region[0]) || ''
            c = c || getVal(addr.region[1]) || ''
            r = r || getVal(addr.region[2]) || ''
          } else {
            p = p || getVal(addr.region.province) || addr.province || ''
            c = c || getVal(addr.region.city) || addr.city || ''
            r = r || getVal(addr.region.region) || getVal(addr.region.county) || addr.county || ''
          }
        }
      }

      const fullRegion = (p + c + r) || '其他'
      return fullRegion === '其他' || fullRegion === '其他其他其他' ? '其他其他其他' : fullRegion
    },

    buildFullAddress (addr) {
      if (!addr) return ''
      const region = this.parseRegion(addr)
      return region + (addr.detail || '')
    }
  }
}
