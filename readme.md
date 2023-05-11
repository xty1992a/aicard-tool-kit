### 简介
这是一个用于与明源云客/AI云店小程序进行交互的h5工具集。  
基于微信web版的sdk，封装了一些方法，在与小程序交互的过程中，可以借助小程序原生能力，得到诸如手机号、用户信息经纬度等信息。  
此外，还提供了一些方法，用于跳转一些常用小程序页面的方法。  

### 安装
```bash
npm i @aistore/aicard-tool-kit
```

### 使用
```typescript
import { aistore, AuthItem, AuthType } from "@aistore/aicard-tool-kit";

const tapPhone = () => {
  aistore.getPhoneNumber({
    callbackUrl: location.href,
    required: false,
    // 本动作触发的埋点补充参数
    trackCustomParams: {
      custom_params_id: 'h5应用的唯一标识（如5044）',
      // 扩展参数，jsonstring
      custom_params_value: JSON.stringify({
        xxx: '',
      })
    }
  });
};

```
详细请见[demo](https://git.myscrm.cn/2c-frontend/aistore-tool-sdk-h5)

扫码体验：
![](https://confluence.myscrm.cn/download/thumbnails/57036948/image2022-12-22_10-7-49.png?version=1&modificationDate=1671674869000&api=v2)
![](https://confluence.myscrm.cn/download/thumbnails/57036948/image2022-12-22_10-7-59.png?version=1&modificationDate=1671674879000&api=v2)
