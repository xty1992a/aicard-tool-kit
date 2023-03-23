/**
 * 支持的授权类型
 * */
export enum AuthType {
  GET_PHONE_NUMBER = 'getPhoneNumber', // 手机号
  GET_USER_INFO = 'getUserInfo', // 用户信息
  GET_NEWS_SUBSCRIBE = 'getNewsSubscribe', // 订阅模版消息
  GET_LOCATION = 'getLocation', // 地理位置
  ERROR = 'error', // 类型不存在
}

type Many<T> = T | T[]
/**
 * 基础授权对象
 * */
export interface AuthItem {
  /** 授权类型 */
  type: AuthType,
  /** 是否强制授权(置为true则不可跳过) */
  required?: boolean
  /** 可能存在的载荷，如模板id */
  payload?: Record<string, Many<string | number>>
}

/** 上报事件自定义参数 */
export type TTrackCustomParams = {
  /** 常规情况建议填充 对应业务组 APP_ID, 需要保证唯一 */
  custom_params_id: string
  /** 自定义字段, 建议使用 JSON 字符串 */
  custom_params_value: string
}

export type CommonPayload = {
  /** 回调链接 */
  callbackUrl: string
  /** 事件上报自定义参数, 这参数会设置到云店服务端事件 l 字段内的 ext 字段, 目前仅支持 50320001 */
  trackCustomParams?: TTrackCustomParams
}

export type AuthPhone = CommonPayload & AuthItem & {
  type: AuthType.GET_PHONE_NUMBER,
  payload?: {
    /** 留电前，混入到entry_params的参数（此字段为云店内部字段） */
    entry_params: Record<string, string>
  }
}

export type AuthUserInfo = CommonPayload & AuthItem & {
  type: AuthType.GET_USER_INFO
}

export type AuthLocation = CommonPayload & AuthItem & {
  type: AuthType.GET_LOCATION
}


export interface SubscribeMessagePayload {
  /**
   * 模板消息id，最多3条
   * */
  msg_ids: string[]
  /** 上报的消息类型,1:新房上架，2:活动直播提醒 */
  report_type: 1 | 2
}

/**
 * 模板消息订阅参数
 * payload.msg_ids必传
 * */
export type RequestSubscribeMessage = CommonPayload & AuthItem & {
  type: AuthType.GET_NEWS_SUBSCRIBE,
  callbackUrl: string
  payload: SubscribeMessagePayload
}

export type MultiAuth = CommonPayload &  {
  authList: Pick<AuthItem, 'type' | 'required' | 'payload'>[]
}

/**
 * 分享参数
 * */
export interface SharePayload {
  /** 落地h5链接 */
  url: string

  /** 分享标题 */
  title?: string,

  /** 分享背景 */
  imageUrl?: string,

  /** 小程序参数 */
  params?: Record<string, any>

  /** 事件上报自定义参数, 这两个参数会展开到云店客户端事件 l 字段内, 目前仅支持 1002 */
  trackCustomParams?: TTrackCustomParams

  /** 预授权参数，用户会先进入授权页完成授权后才进入url */
  authConfig?: {
    hideCancel?: boolean
    authList: AuthItem[]
  }

  /** 小程序路径，一般不填，用于指定落地非h5的分享 */
  path?: string;
}

/**
 * 支付页参数
 * */
export interface PaymentParams {
  /** 回调链接 */
  callbackUrl: string
  /** 支付参数，透传给微信 */
  miniPayParams: {
    /** 随机字符串，长度为32个字符以下 */
    nonceStr: string
    /** 统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=*** */
    package: string
    /** 签名，具体签名方案参见 [小程序支付接口文档](https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=7_7&index=3) */
    paySign: string
    /** 时间戳，从 1970 年 1 月 1 日 00:00:00 至今的秒数，即当前的时间 */
    timeStamp: string
    /** 签名算法 */
    signType?: 'MD5' | 'HMAC-SHA256'
  }
  /** 成功页，不传跳callbackUrl */
  successUrl?: string
  /** 失败页，不传跳callbackUrl */
  failedUrl?: string
  /** 回跳参数 */
  params?: Record<string, string>
}
/**
 * 小程序路由对象
 * */
export interface RouteOption {
  /** 小程序页面路径 */
  path: string,
  /** 小程序页面参数 */
  params?: Record<string, any>
}
/**
 * 小程序路由配置对象
 * */
export interface RouteConfig {
  /** 是否使用redirect */
  redirect?: boolean
  /** 该页面是否是tabbar页面 */
  isTab?: boolean
}

/**
 * 路由方法标准参数，决定回跳页面
 * 如当前在h5/baidu.com，跳转小程序页面时，指定了navigateBackUrl为h5/qq.com。
 * 则从小程序返回（手势/左上角按钮）时，将会重载为h5/qq.com
 * */
export interface RouterOption {
  navigateBackUrl?: string
}

/**
 * 云店项目经营属性
 * */
export enum YD_ATTRIBUTE {
  sale = 'sale',
  rent = 'rent'
}

export interface PageProjectOption {
  attribute?: YD_ATTRIBUTE
}

export interface PageProjectDetailOption {
  attribute?: YD_ATTRIBUTE
  id: string
}
export interface PageH5Option {
  url: string
}

export interface PageChatOption {
  seller_id: string
  [p: string]: string
}

export interface Metadata{
  title: string
  desc?: string
  [p: string]: string
}
