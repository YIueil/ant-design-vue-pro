import { asyncRouterMap, constantRouterMap } from '@/config/router.config'
import cloneDeep from 'lodash.clonedeep'

/**
 * 过滤账户是否拥有某一个权限，并将菜单从加载列表移除
 *
 * @param permissions 用户的权限集合
 * @param route 当前路由
 * @returns {boolean}
 */
function hasPermission (permissions, route) {
  // todo 对于生产环境, 检测权限配置
  // if (route.meta && route.meta.permission) {
  //   return route.meta.permission.find(p => permissions.includes(p))
  // }
  return true
}

/**
 * 单账户多角色时，使用该方法可过滤角色不存在的菜单
 *
 * @param roles
 * @param route
 * @returns {*}
 */
// eslint-disable-next-line
function hasRole(roles, route) {
  if (route.meta && route.meta.roles) {
    return route.meta.roles.includes(roles.id)
  } else {
    return true
  }
}

function filterAsyncRouter (routerMap, permissions) {
  return routerMap.filter(route => {
    if (hasPermission(permissions, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, permissions)
      }
      return true
    }
    return false
  })
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes ({ commit }, permissions) {
      return new Promise(resolve => {
        const routerMap = cloneDeep(asyncRouterMap)
        const accessedRouters = filterAsyncRouter(routerMap, permissions)
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission
