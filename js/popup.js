var bgPage = chrome.extension.getBackgroundPage();

window.onload = function () {
	if (bgPage.loggedIn) {
		bgPage.client.getAccountInfo(function(error, accountInfo) {
			document.getElementById("content").innerHTML = 'Hello, <b>' + accountInfo.name + '</b>!';
		});

		document.getElementById("dbLoginLogoutBtn").innerHTML = "Log Out";
	} else {
		document.getElementById("content").innerHTML = "Not logged in";
		document.getElementById("dbLoginLogoutBtn").innerHTML = "Login with Dropbox";
	}

	document.getElementById("dbLoginLogoutBtn").onclick = function () {
		if (bgPage.loggedIn) {
			bgPage.signoutBtnPress();

			window.close();
		} else {
			bgPage.authBtnPress();
		}
	};
};
