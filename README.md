# NetStatus

提供基础而全面的网络状态信息


## 技术栈

- **前端框架**：Next.js 15
- **编程语言**：JavaScript
- **部署方式**：无服务部署（Serverless）

## 项目功能
初始化时展示各个组件，需要请求API获取数据的组件，显示 请求\重试 按钮，点击后请求数据，数据返回后展示，如果请求失败，则显示错误信息，点击重试按钮后重新请求数据。并在组件旁边显示加载状态

1. **设备信息获取**
   - **设备类型与型号**：分析设备信息
   - **屏幕分辨率**：获取设备分辨率
   - **电池状态**：取当前电池电量和充电状态。
   - **传感器数据**：获取加速度计和陀螺仪数据。

2. **网络信息**

通过多个API获取IP相关信息，统一整理后展示，如果有多个API返回信息，则分别展示

格式化返回信息，只展示需要的字段：
示例：
```
ip: 1.162.168.220
info: 中国 台湾 桃园市 中华电信

ip: 171.95.220.50
info: 中国 四川 南充 电信
```

- 下面的API可以获取IP 
   - 1. https://uapis.cn/api/myip.php
       - 只需要ip、country、region、city、isp，其他字段忽略
       - 返回示例
```
{
    "code": 200,
    "ip": "171.95.220.50",
    "country": "中国",
    "region": "四川",
    "city": "南充",
    "asn": "AS4134",
    "isp": "电信",
    "latitude": "",
    "longitude": "",
    "LLC": "Chinanet"
}
``` 

 - 2. https://api.ip.sb/ip
       - 返回示例
```
1.162.168.220
```
 
 - 3. https://api.52vmy.cn/api/query/itad
       - 只需要ip、address、home，其他字段忽略
       - 返回示例
```
{
  "code": 200,
  "msg": "成功",
  "data": {
    "ip": "1.162.168.220",
    "address": "台湾省桃园市 中华电信",
    "home": "中国 台湾 桃园市"
  }
}
```
 - 4. https://www.cloudflare.com/cdn-cgi/trace
       - 只需要ip，其他字段忽略
       - 返回示例
```
fl=410f523
h=www.cloudflare.com
ip=140.245.50.184
ts=1729566914.975
visit_scheme=https
uag=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36
colo=SIN
sliver=none
http=http/2
loc=SG
tls=TLSv1.3
sni=plaintext
warp=off
gateway=off
rbi=off
kex=X25519Kyber768Draft00
```

- 如果上面API获取到的IP相同，则展示，如果不同，则将返回的不同的IP请求下面的API
 - 1. https://api.52vmy.cn/api/query/itad?ip=IP地址
       - 只需要ip、address、home，其他字段忽略
       - 返回示例
```
{
    "code": 200,
    "msg": "成功",
    "data": {
        "ip": "0.0.0.0",
        "address": "IANA 保留地址",
        "home": "保留地址 保留地址"
    }
}
```

1. **网络访问情况**
   - 访问GitHub、Cloudflare、Google、Youtube、OpenAI、Claude、bilibili、腾讯、阿里、Linux.do
   - 每个网站显示为logo，旁边展示访问返回数据
   - 分别使用本地和服务器访问，返回ping延迟 和 状态码
   - 初始化时不请求，用户点击网站对应logo后请求该网站，并展示返回数据

2. **定位对比**
   - 获取GPS定位，返回经纬度和定位地址
   - IP信息使用上面网络信息获取的IP，返回IP地址、经纬度和定位地址
   - 对比结果



