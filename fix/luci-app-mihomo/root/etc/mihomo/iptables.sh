#!/bin/sh
# Mihomo iptables transparent proxy rules

MIHOMO_REDIR_PORT=7892
MIHOMO_TPROXY_PORT=7893
MIHOMO_MARK=0x162
MIHOMO_TABLE=100

start_rules() {
    # create chain
    iptables -t nat -N MIHOMO 2>/dev/null
    iptables -t mangle -N MIHOMO 2>/dev/null

    # bypass reserved/local addresses
    for addr in 0.0.0.0/8 10.0.0.0/8 100.64.0.0/10 127.0.0.0/8 169.254.0.0/16 172.16.0.0/12 192.0.0.0/24 192.0.2.0/24 192.88.99.0/24 192.168.0.0/16 198.51.100.0/24 203.0.113.0/24 224.0.0.0/4 240.0.0.0/4; do
        iptables -t nat -A MIHOMO -d $addr -j RETURN 2>/dev/null
        iptables -t mangle -A MIHOMO -d $addr -j RETURN 2>/dev/null
    done

    # bypass mihomo ports
    iptables -t nat -A MIHOMO -p tcp -m multiport --dports 7890,7891,7892,7893,9090,1053 -j RETURN 2>/dev/null

    # redir tcp
    iptables -t nat -A MIHOMO -p tcp -j REDIRECT --to-ports $MIHOMO_REDIR_PORT 2>/dev/null

    # apply to PREROUTING (LAN clients only)
    iptables -t nat -C PREROUTING -p tcp -j MIHOMO 2>/dev/null ||         iptables -t nat -A PREROUTING -p tcp -j MIHOMO 2>/dev/null

    # tproxy for udp if module available (LAN clients)
    if lsmod | grep -q xt_TPROXY || modprobe xt_TPROXY 2>/dev/null; then
        iptables -t mangle -A MIHOMO -p udp -m multiport --dports 7890,7891,7892,7893,9090,1053 -j RETURN 2>/dev/null
        iptables -t mangle -A MIHOMO -p udp -j TPROXY --on-ip 127.0.0.1 --on-port $MIHOMO_TPROXY_PORT --tproxy-mark $MIHOMO_MARK 2>/dev/null

        iptables -t mangle -C PREROUTING -p udp -j MIHOMO 2>/dev/null ||             iptables -t mangle -A PREROUTING -p udp -j MIHOMO 2>/dev/null

        ip rule add fwmark $MIHOMO_MARK table $MIHOMO_TABLE 2>/dev/null
        ip route add local default dev lo table $MIHOMO_TABLE 2>/dev/null
    fi

    # hijack dns to mihomo (LAN clients only, NOT OUTPUT)
    iptables -t nat -C PREROUTING -p udp --dport 53 -j REDIRECT --to-ports 1053 2>/dev/null ||         iptables -t nat -A PREROUTING -p udp --dport 53 -j REDIRECT --to-ports 1053 2>/dev/null
    iptables -t nat -C PREROUTING -p tcp --dport 53 -j REDIRECT --to-ports 1053 2>/dev/null ||         iptables -t nat -A PREROUTING -p tcp --dport 53 -j REDIRECT --to-ports 1053 2>/dev/null
}

stop_rules() {
    # remove PREROUTING references
    iptables -t nat -D PREROUTING -p tcp -j MIHOMO 2>/dev/null
    iptables -t nat -D PREROUTING -p udp --dport 53 -j REDIRECT --to-ports 1053 2>/dev/null
    iptables -t nat -D PREROUTING -p tcp --dport 53 -j REDIRECT --to-ports 1053 2>/dev/null

    iptables -t mangle -D PREROUTING -p udp -j MIHOMO 2>/dev/null

    # flush and delete chain
    iptables -t nat -F MIHOMO 2>/dev/null
    iptables -t nat -X MIHOMO 2>/dev/null
    iptables -t mangle -F MIHOMO 2>/dev/null
    iptables -t mangle -X MIHOMO 2>/dev/null

    ip rule del fwmark $MIHOMO_MARK table $MIHOMO_TABLE 2>/dev/null
    ip route del local default dev lo table $MIHOMO_TABLE 2>/dev/null
}

case "$1" in
    start)
        stop_rules
        start_rules
        ;;
    stop)
        stop_rules
        ;;
    restart)
        stop_rules
        start_rules
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
        ;;
esac
