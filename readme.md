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
    required: false
  });
};
```
详细请见[demo](.)
> 施工中
