"use strict";
"require view";

return view.extend({
    render: function () {
        // 创建页面容器
        var container = E("div", {});
        
        // 添加 iframe 嵌入模拟器
        var iframe = E("iframe", {
            "src": "/luci-static/emulatorjs/index.html",
            "style": "width: 100%; height: 95vh; border: none; border-radius: 4px;",
            "allowfullscreen": "true"
        });
        container.appendChild(iframe);
        
        return container;
    },
});
