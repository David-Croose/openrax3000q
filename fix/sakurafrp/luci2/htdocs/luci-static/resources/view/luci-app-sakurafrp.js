"use strict";
"require view";
"require form";

return view.extend({
	render: function () {
		var m, s;

		m = new form.Map("natfrp");
		s = m.section(form.NamedSection, "inst1", "sakura", _("Sakura Configuration"));

		s.option(form.Flag, "enable", _("Enable"));
		s.option(form.Value, "token", _("Token"), _("See in https://www.natfrp.com/user/"));
		s.option(form.Value, "node", _("Node"), _("The Tunnel ID"));

		return m.render();
	},
});
