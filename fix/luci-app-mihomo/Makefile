# This is free software, licensed under the Apache License, Version 2.0

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-mihomo
PKG_LICENSE:=Apache-2.0

LUCI_TITLE:=LuCI Support for Mihomo Proxy
LUCI_DEPENDS:=+luci-base +iptables +iptables-mod-tproxy +ipset +kmod-ipt-tproxy +kmod-tun
LUCI_PKGARCH:=all

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
