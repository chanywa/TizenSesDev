var SVC_BASE_URL = "https://github.sec.samsung.net/pages/chanywa/SES-Management/";
var LOG_BASE_URL = "";
var CONFIG_URL = SVC_BASE_URL + "config/config.json";
var CONFIG = {};

function init_page(base_path=null, resolve=null) {
	new Promise(function(resolve, reject) {
		fetch(CONFIG_URL).then(function(response) {
			return response.json()
		}).then(function(json_data) {
			CONFIG = json_data
			LOG_BASE_URL = CONFIG.log_base_url
			resolve()
		})
	}).then(function() {
		if (resolve != null) resolve()
	})
	show_menu(base_path)
}

function show_menu(base_path) {
	if (base_path == null) base_path = ''
	document.getElementById('menu').innerHTML = 
	"CONFIG \
	[ <a href=\"" + base_path + "jira-watcher.html\">JIRA Watcher</a> \
	| <a href=\"" + base_path + "sam-config.html\">SAM Config</a> \
	| <a href=\"" + base_path + "github.html\">GitHub Settings</a> \
	]<br>\
	STATUS \
	[ <a href=\"" + base_path + "main.html\">Main</a> \
	| <a href=\"" + base_path + "ahub.html\">AnalysisHub</a> \
	( <a href=\"" + base_path + "ahub-report.html\">Report</a> ) \
	| <a href=\"" + base_path + "sam.html\">SAM</a> \
	| <a href=\"" + base_path + "warnings.html\">Warning Messages</a> \
	| <a href=\"" + base_path + "api.html\">API Status</a> \
	| <a href=\"" + base_path + "agent.html\">Agent Status</a> \
	| <a href=\"" + base_path + "jira.html\">JIRA Status</a> \
	| <a href=\"" + base_path + "feature.html\">Features</a> \
	| <a href=\"" + base_path + "acr.html\">ACRs</a> \
	| <a href=\"" + base_path + "defect.html\">Defects</a> \
	]";
	//| <a href=\"" + base_path + "testhub.html\">Testhub Status</a> \

	var fileref = document.createElement('link')
	fileref.setAttribute('rel', 'stylesheet')
	fileref.setAttribute('type', 'text/css')
	fileref.setAttribute('href', 'loading.css')
	document.getElementsByTagName('head')[0].appendChild(fileref)
}

function load_file(url, callback) {
	new Promise(function(resolve, reject) {
		fetch(url, {cache:"no-cache"}).then(function(response) {
			if (response.ok) return response.text()
			else return ""
		}).then(function(json_data) {
			callback(json_data)
			resolve()
		})
	})
}

function load_json(url, callback) {
	if (url.startsWith("http://") || url.startsWith("https://")) {
		new Promise(function(resolve, reject) {
			fetch(url, {cache:"no-cache"}).then(function(response) {
				if (response.ok) return response.json()
				else return "{}"
			}).then(function(json_data) {
				callback(json_data)
				resolve()
			})
		})
	}
}

function set_cookie(name, value, exp) {
	var date = new Date();
	date.setTime(date.getTime() + exp*24*60*60*1000);
	document.cookie = name + "=" + value +";expires=" + date;
}

function get_cookie(name) {
	var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
	return value? value[2] : null;
}

function delete_cookie(name) {
	document.cookie = name + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
}

function draw_version_selection_menu(version) {
	txt = "<select id=\"version\" onchange=\"change_version(this.value)\">"
	for (i = 0; i < Object.keys(CONFIG.releases).length; i++) {
		release = Object.values(CONFIG.releases)[i]
		txt += "<option value=\"" + release.version + "\""
		if (version == release.version) txt += " selected"
		txt += ">SES " + release.version + "</option>"
	}
	txt += "</select>"
	document.getElementById('version').innerHTML = txt
}

function find_release_by_branch(branch) {
	for (r of Object.values(CONFIG.releases)) {
		if (r.branch == branch)
			return r
	}
	return null
}

function find_group_by_git_name(git_name) {
	for (group of Object.values(CONFIG.groups)) {
		for (git of group.gits) {
			if (git == git_name) 
				return group
		}
	}
	return null
}

function get_config_release(version) {
	for (r of Object.values(CONFIG.releases)) {
		if (r.version == version)
			return r
	}
	return null
}

function get_config_git_names(version) {
	for (r of Object.values(CONFIG.releases)) {
		if (r.version == version)
			return r.gits
	}
	return null
}

function get_config_groups(version) {
	var groups = []
	release_gits = get_config_release(version).gits
	for (group of CONFIG.groups) {
		found = false
		var i = group.gits.length
		var g = clone_object(group)
		while (i--) {
			if (release_gits.includes(g.gits[i])) found = true
			else g.gits.splice(i, 1)
		}
		if (found) groups.push(g)
	}
	return groups
}

function get_config_branch(version) {
	r = get_config_release(version)
	return r.branch
}

function is_empty(str) {
	return (typeof str == 'undefined' || str == null || str == "")
}

function clone_object(obj) {
	return JSON.parse(JSON.stringify(obj))
}

function show_loading_progress() {
	document.getElementById('body').innerHTML +=
		'<div class="loading-container"><div class="loading"></div><div id="loading-text">loading</div></div>'
}

function get_params() {
	var params = {}
	window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { params[key] = value });
	return params
}

function html_entities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}