# luci-app-emulatorjs

OpenWrt luci2 模块 - EmulatorJS 网页游戏模拟器

## 说明

这是一个完整的 OpenWrt 软件包，包含了 EmulatorJS 模拟器、所有核心文件、以及内置游戏。

## 安装方式

### 方式 1：手动安装（推荐）

```bash
# 1. 复制到路由器
cd luci-app-emulatorjs
scp -r htdocs/* root@192.168.1.1:/www/
scp -r usr/* root@192.168.1.1:/usr/

# 2. 重启 rpcd 服务
ssh root@192.168.1.1
/etc/init.d/rpcd restart
```

### 方式 2：构建 IPK 包（高级用户）

在 OpenWrt 构建根目录中：

```bash
# 1. 将此目录放入 feeds/luci/applications/
# 2. 选择此包
make menuconfig
# 3. 构建
make package/luci-app-emulatorjs/compile V=s
```

## 访问方式

1. 登录路由器 LuCI 界面
2. 在「服务」菜单中找到「游戏模拟器」
3. 点击即可进入模拟器

或直接访问：
```
http://192.168.1.1/luci-static/emulatorjs/index.html
```
