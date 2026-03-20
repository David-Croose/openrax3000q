## 怎样编译

OS: `Ubuntu 22.04.5 LTS`

```bash
# 安装依赖
sudo add-apt-repository ppa:npalix/coccinelle
sudo apt update
sudo apt install build-essential clang flex g++ gawk gcc-multilib gettext \
  git libncurses5-dev libssl-dev python3-distutils rsync unzip zlib1g-dev \
  coccinelle

# 代码克隆
git clone https://github.com/David-Croose/openrax3000q
cd openrax3000q

# 下载和安装openwrt、本仓库自有代码
./scripts/feeds update -a
./prepare.sh
./scripts/feeds update -a -i
./scripts/feeds install -a
cp .config_rax3000q .config

# 配置（可选）
make menuconfig

# 下载代码
wget <本仓库的release的dl.tar.bz2>
tar -xf /path/to/dl.tar.bz2 -C .
make -j16 download

# 编译
make -j$(nproc)
```

## 怎样升级

```
1. 网线插板子LAN口，电脑设定固定IP：192.168.1.x
2. 顶针顶住RESET键开机等待大约10秒（可以开着ping 192.168.1.1看通了就可以放开了）
3. 浏览器进入192.168.1.1上传固件，升级完成板子重启就完成了（记得电脑设回DHCP）
```
