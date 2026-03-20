#!/bin/bash

cp fix/220-fix-build-bug.patch                              feeds/packages/net/xtables-addons/patches
cp fix/221-disable-xtables-LUA-for-avoiding-build-bug.patch feeds/packages/net/xtables-addons/patches
cp fix/0002-fix-build-bug.patch                             feeds/packages/libs/libpfring/patches

mkdir -p feeds/packages/utils/gl-mifi-mcu/patches
cp fix/001-fix-build-bug.patch feeds/packages/utils/gl-mifi-mcu/patches

rm -rf package/feeds/luci/luci-app-sakurafrp
rm -rf feeds/luci/applications/luci-app-sakurafrp
cp -r fix/sakurafrp/luci2/ feeds/luci/applications/luci-app-sakurafrp

rm -rf package/feeds/packages/sakurafrp/
rm -rf feeds/packages/net/sakurafrp
cp -r fix/sakurafrp/sakurafrp/ feeds/packages/net/sakurafrp
