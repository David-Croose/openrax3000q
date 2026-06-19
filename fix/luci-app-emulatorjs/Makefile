include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-emulatorjs
PKG_VERSION:=1.0
PKG_RELEASE:=1

LUCI_TITLE:=LuCI Support for EmulatorJS
LUCI_DESCRIPTION:=A game emulator running on web browser
LUCI_DEPENDS:=
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
# Note: CGI scripts in root/www/cgi-bin/ must be chmod 755
# luci.mk preserves source file permissions when packaging
