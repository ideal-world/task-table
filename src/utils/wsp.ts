export class WebsocketP {
  protected ws!: WebSocket
  protected injectReqIdFun!: ((data: any, reqId: string) => any)
  protected extractReqIdFun!: ((data: any) => string | undefined)
  protected onMessageFun!: ((data: any) => void)
  protected reqPromises: Map<string, [(value: any) => void, (reason?: any) => void, number]> = new Map()

  protected constructor() {
  }

  static async init(wsAddr: string, injectReqIdFun:((data: any, reqId: string) => any), extractReqIdFun: ((data: any) => string | undefined), onMessageFun: ((data: any) => void)): Promise<WebsocketP> {
    const ws = new WebsocketP()
    await ws.doInit(wsAddr, injectReqIdFun, extractReqIdFun, onMessageFun)
    return ws
  }

  protected doInit(wsAddr: string, injectReqIdFun:((data: any, reqId: string) => any), extractReqIdFun: ((data: any) => string | undefined), onMessageFun: ((data: any) => void)): Promise<void> {
    this.ws = new WebSocket(wsAddr)
    this.injectReqIdFun = injectReqIdFun
    this.extractReqIdFun = extractReqIdFun
    this.onMessageFun = onMessageFun

    this.ws.onclose = function () {
      // eslint-disable-next-line no-console
      console.log('ws %s closed', wsAddr)
    }

    this.ws.onerror = function (e) {
      // eslint-disable-next-line no-console
      console.log('ws %s error', wsAddr, e)
    }

    this.ws.addEventListener('message', this.onMessage.bind(this))
    return new Promise<void>((initResolve, _) => {
      this.ws.onopen = function () {
        initResolve()
      }
    })
  }

  send(data: any) {
    this.ws.send(data)
  }

  async req<T>(data: any, timeout: number = 5000): Promise<T> {
    const reqId = Date.now().toString() + (Math.floor(Math.random() * (9 * 10 ** 9)) + (10 ** 9)).toString()
    this.injectReqIdFun(data, reqId)
    this.ws.send(JSON.stringify(data))

    return new Promise<T>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        reject(new Error(`websocket: ${reqId} timeout`))
      }, timeout)
      this.reqPromises.set(reqId, [resolve, reject, timer])
    })
  }

  protected onMessage(me: MessageEvent) {
    const resp = JSON.parse(me.data)
    const reqId = this.extractReqIdFun(resp)
    if (reqId) {
      const promise = this.reqPromises.get(reqId)
      if (promise) {
        this.reqPromises.delete(reqId)
        window.clearTimeout(promise[2])
        promise[0](resp)
      }
      else {
        this.onMessageFun(resp)
      }
    }
    else {
      this.onMessageFun(resp)
    }
  }

  close() {
    this.ws.removeEventListener('message', this.onMessage)
    this.reqPromises.forEach((value, _) => {
      window.clearTimeout(value[2])
    })
  }
}

export class DefaultWebSocketP extends WebsocketP {
  private constructor() {
    super()
  }

  static async initDefault(wsAddr: string, onMessageFun: ((data: any) => void)): Promise<DefaultWebSocketP> {
    const ws = new DefaultWebSocketP()
    await ws.doInitDefault(wsAddr, onMessageFun)
    return ws
  }

  private doInitDefault(wsAddr: string, onMessageFun: ((data: any) => void)): Promise<void> {
    this.injectReqIdFun = (data: any, reqId: string) => {
      data.msg_id = reqId
      return data
    }
    this.extractReqIdFun = (data: any) => {
      return data?.msg_id
    }
    return this.doInit(wsAddr, this.injectReqIdFun, this.extractReqIdFun, onMessageFun)
  }

  async reqOk<T>(kind: string, body: any, params: any, from_avatar: string = 'default', timeout: number = 5000): Promise<T> {
    const resp = await this.req<DefaultWsResp<T>>({
      msg: {
        params,
        body,
      },
      event: kind,
      from_avatar,
      to_avatars: [
        from_avatar,
      ],
      ignore_self: false,
    }, timeout)
    if (resp.msg.code.startsWith('200'))
      return resp.msg.data as T
    else
      throw new Error(resp.msg.message)
  }
}

export interface DefaultWsResp<T> {
  msg: {
    code: string
    message?: string
    data?: T
  }
  event: string
}
