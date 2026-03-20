include $(TOPDIR)/rules.mk

PKG_NAME:=sakurafrp
PKG_VERSION:=3.1.7
PKG_RELEASE:=1
PKG_LICENSE:=AGPL-3.0-only

include $(INCLUDE_DIR)/package.mk

define Package/sakurafrp
  SECTION:=net
  CATEGORY:=Network
  TITLE:=SakuraFRP NAT tunnel
  SUBMENU:=VPN
endef

define Package/sakurafrp/description
	Sakurafrp is a FRP tool makes NAT inner transaction.
endef

define Build/Prepare
	$(CP) ./files/* $(PKG_BUILD_DIR)
endef

define Build/Compile
endef

define Package/sakurafrp/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/natfrp.init $(1)/etc/init.d/natfrp
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/natfrp.config $(1)/etc/config/natfrp
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/natfrp-frpc $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/natfrp-service $(1)/usr/bin
endef

$(eval $(call BuildPackage,sakurafrp))
