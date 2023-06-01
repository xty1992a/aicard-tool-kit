import {
  URLParams,
  toSearch,
  toUrlString,
  ensureUrlDecoded,
} from './url-params'
import { AuthType, YD_ATTRIBUTE } from './type'
import type {
  RequestSubscribeMessage,
  AuthItem,
  AuthPhone,
  AuthLocation,
  MultiAuth,
  AuthUserInfo,
  PageChatOption,
  PageH5Option,
  PageProjectOption,
  PageProjectDetailOption,
  RouterOption,
  RouteConfig,
  PaymentParams,
  SharePayload,
  TTrackCustomParams,
} from './type'

export * from './type'

export class AistoreToolKit {
  /**
   * tc-id,h5的会话标识，应该由小程序的tc-id转化而来，请对接人链
   * 本sdk只做透传
   */
  tcId = ''
  constructor() {
    this.handleLegacy()
    this.setEnable().catch(console.log)
  }
  //#region 兼容处理
  /**
   * 兼容处理云店 webview1.0 页面加载了对接 aicard-tool-kit h5 页面
   */
  private handleLegacy() {
    if (!/ai_webview_legacy/g.test(location.search)) return

    // 将关键字删除, 避免循环跳转
    const url = encodeURIComponent(
      location.href
        .replace(/&?ai_webview_legacy=.*?(?=(&|$))/, '')
        .replace(/\?\&/, '?'),
    )
    this.goTo(
      {
        path: '/page/mainPage/pages/h5/index',
        params: { url },
      },
      { redirect: true, isTab: false },
    )
  }
  //#endregion

  //#region 可用性
  public enable = false
  async setEnable() {
    async function enableCheck() {
      if (this.enable) {
        return true
      }
      if (!window['wx']) {
        return false
      }
      const { miniprogram } = await new Promise<{ miniprogram: boolean }>(
        (resolve) => wx.miniProgram.getEnv(resolve),
      )
      return miniprogram
    }

    this.enable = await enableCheck()
  }
  async enableCheck() {
    await this.setEnable()
    if (!this.enable) throw new Error('请先初始化微信jssdk')
  }
  //#endregion

  //#region 基础
  /**
   * @description 将h5自身的tc-id（来自小程序的tc-id生成），给到toolkit，后续行为都将携带此id
   */
  setTcId(tcId: string) {
    this.tcId = tcId
  }

  /**
   * @description 新的路由跳转方法，底层使用标准库的URL
   */
  protected async goTo(
    option: { path: string; params?: Record<string, any> },
    config: RouteConfig = {},
  ) {
    await this.enableCheck()
    const mini = wx.miniProgram
    const _cfg = { ...{ redirect: false, isTab: false }, ...config }
    const fn = _cfg.isTab
      ? mini.switchTab
      : _cfg.redirect
      ? mini.redirectTo
      : mini.navigateTo

    fn({
      url: this.stringifyPath(option, { old: false }),
    })
  }

  /**
   * 调整旧页面的方法，序列化参数的方式不同
   */
  protected async goToOld(
    option: { path: string; params?: Record<string, any> },
    config: RouteConfig = { redirect: false },
  ) {
    await this.enableCheck()
    const mini = wx.miniProgram
    const _cfg = { ...{ redirect: false, isTab: false }, ...config }
    const fn = _cfg.isTab
      ? mini.switchTab
      : _cfg.redirect
      ? mini.redirectTo
      : mini.navigateTo

    fn({
      url: this.stringifyPath(option, { old: true }),
    })
  }

  /**
   * @description 序列化小程序路径
   * @param option
   */
  protected stringifyPath(
    option: { path: string; params?: Record<string, any> },
    config: { old: boolean },
  ) {
    option.params = {
      ...(option.params || {}),
      tc_id: this.tcId,
    }
    if (config.old) {
      return `${option.path}?${toSearch(option.params || {})}`
    }
    return `${option.path}?${URLParams.stringify(option.params || {})}`
  }

  /**
   * @description 与小程序通信（非实时，仅跳转，分享等场景批量派发）
   * @param{Record<string, any>} data 传给小程序的数据
   */
  async postMessage(data: Record<string, any>) {
    await this.enableCheck()
    wx.miniProgram.postMessage({ data })
  }

  //#endregion

  //#region 支付
  /**
   * @description 跳转到支付页
   * @param{PaymentParams} params 支付参数，以及回跳地址等
   * @param{RouteConfig} config 路由方法配置，决定以何种路由方法跳转
   */
  payment(params: PaymentParams, config: RouteConfig = { redirect: false }) {
    const { callbackUrl: location, failedUrl, successUrl, ..._params } = params

    this.goToOld(
      {
        path: '/page/mainPage/pages/entry/main',
        params: {
          page_type: 'wxPay',
          wxPayParams: {
            ..._params,
            ENV: 'H5',
            location: ensureUrlDecoded(location),
            failedUrl: failedUrl && ensureUrlDecoded(failedUrl),
            successUrl: successUrl && ensureUrlDecoded(successUrl),
          },
        },
      },
      config,
    )
  }
  //#endregion

  //#region 路由
  /**
   * @description 路由到任意小程序页面
   * @param path 小程序完整路径 / 开头
   * @param params 页面路由参数
   * @param config 路由方法配置，决定以何种路由方法跳转
   */
  routeTo(
    path: string,
    params: RouterOption & Record<string, string>,
    config: RouteConfig = {},
  ) {
    this.goTo(
      {
        path,
        params,
      },
      config,
    )
  }

  /**
   * @description 路由到小程序首页
   */
  routeToMain() {
    this.goTo(
      {
        path: '/page/mainPage/pages/allHouseList/main',
      },
      { isTab: true },
    )
  }

  /**
   * @description 路由到小程序个人中心
   */
  routeToMine() {
    this.goTo(
      {
        path: '/page/mainPage/pages/my/main',
      },
      { isTab: true },
    )
  }

  /**
   * @description 路由到小程序项目列表页
   * @param{PageProjectOption} params 页面参数
   */
  routeToProjectList(params?: PageProjectOption) {
    this.goTo(
      {
        path: '/page/mainPage/pages/projectList/main',
        params: {
          yd_attribute: params?.attribute || YD_ATTRIBUTE.sale,
        },
      },
      { isTab: true },
    )
  }

  /**
   * @description 路由到小程序项目详情
   * @param{RouterOption & PageProjectDetailOption} params 页面参数
   * @param{RouteConfig} config 路由配置
   */
  routeToProjectDetail(
    params: RouterOption & PageProjectDetailOption,
    config?: RouteConfig,
  ) {
    this.goTo(
      {
        path: '/subpackages/independent/project/main/index',
        params: {
          ...params,
          yk_project_id: params.id,
          yd_attribute: params.attribute || YD_ATTRIBUTE.sale,
        },
      },
      config,
    )
  }

  /**
   * @description 路由到另一个h5，一般情况下，建议直接location.href跳过去
   * @param{RouterOption & {url: string}} params 页面参数
   * @param{RouteConfig} config 路由配置
   */
  routeToH5(params: RouterOption & PageH5Option, config?: RouteConfig) {
    this.goTo(
      {
        path: '/page/mainPage/pages/h5/index',
        params: {
          ...params,
          url: ensureUrlDecoded(params.url),
        },
      },
      config,
    )
  }

  /**
   * @description 路由到洽谈室
   * @param{RouterOption & {url: string}} params 页面参数
   * @param{RouteConfig} config 路由配置
   */
  routeToChat(params: RouterOption & PageChatOption, config?: RouteConfig) {
    this.goTo(
      {
        path: '/subpackages/im/chat/index',
        params: {
          ...params,
          isUserEnd: '1',
        },
      },
      config,
    )
  }
  //#endregion

  //#region 分享
  /**
   * @description 更新分享参数，⚠️⚠️⚠️注意此方法不能直接分享，还需要引导用户右上角分享
   * @param{SharePayload} params 分享参数
   */
  updateShare(params: SharePayload) {
    const {
      url,
      imageUrl,
      params: _params,
      title,
      path,
      authConfig,
      trackCustomParams,
    } = params
    this.postMessage({
      type: 'share',
      payload: {
        url: encodeURIComponent(url),
        image_url: imageUrl,
        title,
        path,
        params: _params,
        track_custom_params: trackCustomParams,
        tc_id: this.tcId,
        auth_config:
          authConfig &&
          toUrlString({
            auth_list: authConfig.authList,
            hide_cancel: Number(authConfig.hideCancel),
          }),
      },
    })
  }
  //#endregion

  //#region 授权
  /**
   * @description 获取小程序用户信息
   * @param{Omit<AuthUserInfo, 'type'>} params 授权参数
   * @param{RouteConfig} config 路由配置
   * @return void 成功回跳后ticket更新
   */
  getUserInfo(
    params: Omit<AuthUserInfo, 'type'>,
    config: RouteConfig = { redirect: false },
  ) {
    const { callbackUrl, trackCustomParams, ...option } = params

    this.doAuth(
      {
        authList: [
          {
            type: AuthType.GET_USER_INFO,
            ...option,
          },
        ],
        trackCustomParams,
        callbackUrl,
      },
      config,
    )
  }

  /**
   * @description 获取小程序手机号
   * @param{Omit<AuthPhone, 'type'>} params 授权参数
   * @param{RouteConfig} config 路由配置
   * @return void 成功回跳后ticket更新
   */
  getPhoneNumber(
    params: Omit<AuthPhone, 'type'>,
    config: RouteConfig = { redirect: false },
  ) {
    const { callbackUrl, trackCustomParams, ...option } = params

    this.doAuth({
      authList: [
        {
          type: AuthType.GET_PHONE_NUMBER,
          ...option,
        },
      ],
      trackCustomParams,
      callbackUrl,
    })
  }

  /**
   * @description 获取小程序定位
   * @param{Omit<AuthLocation, 'type'>} params 授权参数
   * @param{RouteConfig} config 路由配置
   * @return void 成功回跳后ticket更新
   */
  getLocation(
    params: Omit<AuthLocation, 'type'>,
    config: RouteConfig = { redirect: false },
  ) {
    const { callbackUrl, trackCustomParams, ...option } = params

    this.doAuth({
      authList: [
        {
          type: AuthType.GET_LOCATION,
          ...option,
        },
      ],
      trackCustomParams,
      callbackUrl,
    })
  }

  /**
   * @description 要求用户订阅消息
   * @param{Omit<RequestSubscribeMessage, 'type'>} params 授权参数,必须提供模板消息id,最多3条
   * @param{RouteConfig} config 路由配置
   * @return void 成功回跳后ticket更新
   */
  requestSubscribeMessage(
    params: Omit<RequestSubscribeMessage, 'type'>,
    config: RouteConfig = { redirect: false },
  ) {
    const { callbackUrl, trackCustomParams, ...option } = params
    this.doAuth({
      authList: [
        {
          type: AuthType.GET_NEWS_SUBSCRIBE,
          ...option,
        },
      ],
      trackCustomParams,
      callbackUrl,
    })
  }

  /**
   * @description 组合授权
   * @param{MultiAuth} params 授权参数列表，同单个授权参数,已满足的权限将直接跳过
   * @param{RouteConfig} config 路由配置
   * @return void 成功回跳后ticket更新
   */
  multiAuth(params: MultiAuth, config: RouteConfig = { redirect: false }) {
    this.doAuth(params, config)
  }

  /**
   * @description 底层授权方法
   */
  protected doAuth(
    option: {
      authList: AuthItem[]
      callbackUrl: string
      trackCustomParams?: TTrackCustomParams
    },
    config: RouteConfig = { redirect: false },
  ) {
    this.goTo(
      {
        path: '/subpackages/independent/bind_user_msg/h5_ability/index',
        params: {
          // 转为snake_case
          auth_list: option.authList.map((it) => ({
            ...it,
            required: Boolean(it.required),
          })),
          callback_url: ensureUrlDecoded(option.callbackUrl),
          track_custom_params: option.trackCustomParams,
        },
      },
      config,
    )
  }

  //#endregion
}

export const aistore = new AistoreToolKit()
