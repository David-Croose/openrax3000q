"use strict";
"require view";
"require form";
"require rpc";
"require uci";

var callGetStatus = rpc.declare({
    object: 'luci-app-mihomo',
    method: 'getStatus',
    expect: {}
});

var callSetNode = rpc.declare({
    object: 'luci-app-mihomo',
    method: 'setNode',
    params: ['name'],
    expect: {}
});

var callUpdateSubscription = rpc.declare({
    object: 'luci-app-mihomo',
    method: 'updateSubscription',
    params: ['subscribe_url']
});

function formatBytes(bytes) {
    bytes = parseInt(bytes) || 0;
    if (bytes === 0) return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

return view.extend({
    load: function() {
        return Promise.all([
            callGetStatus()
        ]).then(function(results) {
            return results[0];
        }).catch(function() {
            return {
                proxy_node: 'Unknown',
                online: false,
                upload: '0',
                download: '0',
                total: '0',
                expire: '0',
                all_nodes: [],
                info_lines: []
            };
        });
    },

    render: function(data) {
        var m, s, o;

        m = new form.Map('mihomo', _('Mihomo Proxy'), _('Transparent proxy based on mihomo (Clash Meta).'));
        s = m.section(form.NamedSection, 'main', 'mihomo');
        s.anonymous = true;

        o = s.option(form.Flag, 'enabled', _('Enable Mihomo'), _('Start mihomo proxy and iptables rules on boot.'));
        o.rmempty = false;

        o = s.option(form.Value, 'subscribe_url', _('Subscription URL'), _('Clash subscription link for updating proxy nodes.'));
        o.datatype = 'string';
        o.placeholder = 'https://example.com/subscribe?token=xxx';

        o = s.option(form.Button, '_update_sub', _('Update Subscription'));
        o.inputtitle = _('Update Now');
        o.inputstyle = 'action';
        o.depends('enabled', '1');
        o.onclick = function(ev, section_id) {
            var self = this;
            var urlOpt = self.section.getOption('subscribe_url');
            var url = urlOpt ? urlOpt.formvalue(section_id) : '';
            if (!url || url === '') {
                alert(_('Please enter a subscription URL first'));
                return Promise.reject(new Error('No URL'));
            }

            return callUpdateSubscription(url).then(function(res) {
                if (res && res.result === 'ok') {
                    return callGetStatus().then(function(newData) {
                        var nodeOpt = self.section.getOption('selected_node');
                        if (nodeOpt) {
                            var nodeElem = nodeOpt.getUIElement(section_id);
                            if (nodeElem && nodeElem.node) {
                                var selectEl = nodeElem.node.querySelector('select');
                                if (selectEl) {
                                    selectEl.innerHTML = '';
                                    if (newData.all_nodes && newData.all_nodes.length) {
                                        newData.all_nodes.forEach(function(node) {
                                            var opt = document.createElement('option');
                                            opt.value = node;
                                            opt.textContent = node;
                                            selectEl.appendChild(opt);
                                        });
                                    }
                                    var currentVal = newData.proxy_node || '';
                                    if (currentVal && (!newData.all_nodes || newData.all_nodes.indexOf(currentVal) === -1)) {
                                        var opt = document.createElement('option');
                                        opt.value = currentVal;
                                        opt.textContent = currentVal;
                                        selectEl.appendChild(opt);
                                    }
                                    selectEl.value = currentVal || '';
                                    uci.set('mihomo', section_id, 'selected_node', currentVal);
                                }
                            }
                        }
                        alert(_('Subscription updated successfully'));
                    }).catch(function(err) {
                        alert(_('Subscription updated, but failed to refresh node list') + ': ' + (err.message || String(err)));
                    });
                } else {
                    var msg = (res && res.message) ? res.message : JSON.stringify(res);
                    alert(_('Update failed') + ': ' + msg);
                }
            }).catch(function(err) {
                alert(_('Update failed') + ': ' + (err.message || String(err)));
            });
        };

        o = s.option(form.ListValue, 'selected_node', _('Current Node'));
        var nodeSet = {};
        if (data.all_nodes && data.all_nodes.length) {
            data.all_nodes.forEach(function(node) {
                o.value(node, node);
                nodeSet[node] = true;
            });
        }
        var currentVal = uci.get('mihomo', 'main', 'selected_node') || data.proxy_node || '';
        if (currentVal && !nodeSet[currentVal]) {
            o.value(currentVal, currentVal);
        }
        if (!currentVal || !data.all_nodes || !data.all_nodes.length) {
            o.value('', _('Unknown'));
        }
        o.cfgvalue = function(section_id) {
            var saved = uci.get('mihomo', section_id, 'selected_node');
            return saved || data.proxy_node || '';
        };
        o.write = function(section_id, value) {
            uci.set('mihomo', section_id, 'selected_node', value);
        };
        o.onchange = function(ev, section_id, value) {
            if (value && value !== data.proxy_node) {
                callSetNode(value).then(function() {
                    var msg = ev.target.parentNode.querySelector('.node-switch-msg');
                    if (!msg) {
                        msg = document.createElement('span');
                        msg.className = 'node-switch-msg';
                        msg.style.color = 'green';
                        msg.style.marginLeft = '10px';
                        ev.target.parentNode.appendChild(msg);
                    }
                    msg.textContent = '\u2713 ' + _('Switched');
                    setTimeout(function() {
                        if (msg) msg.textContent = '';
                    }, 3000);
                }).catch(function(err) {
                    console.error('[mihomo] setNode failed:', err);
                });
            }
        };

        o = s.option(form.Value, '_expire', _('Expire Time'));
        o.readonly = true;
        o.cfgvalue = function() {
            if (data.expire && data.expire !== '0') {
                return new Date(parseInt(data.expire) * 1000).toLocaleString();
            }
            return _('Unknown');
        };

        o = s.option(form.Value, '_traffic', _('Traffic'));
        o.readonly = true;
        o.cfgvalue = function() {
            var used = (parseInt(data.upload || 0)) + (parseInt(data.download || 0));
            var total = parseInt(data.total || 0);
            var usedStr = formatBytes(used);
            var totalStr = total ? formatBytes(total) : _('Unknown');
            return usedStr + ' / ' + totalStr;
        };

        o = s.option(form.ListValue, 'mode', _('Proxy Mode'), _('Global forces all traffic through proxy; Rule uses rule-based routing.'));
        o.value('Rule', _('Rule'));
        o.value('Global', _('Global'));
        o.value('Direct', _('Direct'));
        o.rmempty = false;

        o = s.option(form.ListValue, 'log_level', _('Log Level'));
        o.value('info', _('Info'));
        o.value('debug', _('Debug'));
        o.value('warning', _('Warning'));
        o.value('error', _('Error'));
        o.value('silent', _('Silent'));
        o.rmempty = false;

        o = s.option(form.Flag, 'ipv6', _('IPv6'), _('Enable IPv6 proxy support.'));
        o.rmempty = false;

        o = s.option(form.Flag, 'allow_lan', _('Allow LAN'), _('Allow other devices in the LAN to use this proxy.'));
        o.rmempty = false;

        o = s.option(form.Value, 'mixed_port', _('Mixed Port'), _('HTTP/SOCKS mixed proxy port (default 7890).'));
        o.datatype = 'port';
        o.placeholder = '7890';

        o = s.option(form.Value, 'redir_port', _('Redir Port'), _('Transparent redirect port (default 7892).'));
        o.datatype = 'port';
        o.placeholder = '7892';

        o = s.option(form.Value, 'tproxy_port', _('TProxy Port'), _('TProxy port (default 7893).'));
        o.datatype = 'port';
        o.placeholder = '7893';

        return m.render();
    }
});
