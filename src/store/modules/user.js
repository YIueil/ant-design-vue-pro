import storage from 'store'
import expirePlugin from 'store/plugins/expire'

import { login, logout, getInfo, getCurrentUserPermissions, getCurrentUserRoles } from '@/api/login'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

storage.addPlugin(expirePlugin)
const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    permissions: [],
    userInfo: {}
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    },
    SET_INFO: (state, info) => {
      state.userInfo = info
    }
  },
  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          const { body } = response
          storage.set(ACCESS_TOKEN, body, new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
          commit('SET_TOKEN', body)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          storage.remove(ACCESS_TOKEN)
          resolve()
        }).catch((err) => {
          console.log('logout fail:', err)
          // resolve()
        }).finally(() => {
        })
      })
    },
    // 获取用户角色
    async InitUserInfo ({ dispatch }) {
      // todo 异步操作获取到所有的用户信息
      await dispatch('GetUserInfo')
      await dispatch('GetRoles')
      await dispatch('GetPermissions')
    },
    // 获取用户信息
    GetUserInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        // 请求后端获取用户信息
        getInfo().then(response => {
          const { body } = response
          if (body) {
            commit('SET_INFO', body)
            commit('SET_NAME', { name: body.username, welcome: welcome() })
            commit('SET_AVATAR', body.id)
            // 下游
            resolve(body)
          } else {
            reject(new Error('getInfo: roles must be a non-null array !'))
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 获取用户角色
    GetRoles ({ commit }) {
      return new Promise((resolve, reject) => {
        getCurrentUserRoles().then(response => {
          const { body } = response
          commit('SET_ROLES', body)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 获取用户权限
    GetPermissions ({ commit }) {
      return new Promise((resolve, reject) => {
        getCurrentUserPermissions().then(response => {
          const { body } = response
          commit('SET_PERMISSIONS', body)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default user
