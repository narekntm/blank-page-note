var bgPage = chrome.extension.getBackgroundPage();

window.onload = function () { console.log(bgPage);
	if (bgPage.loggedIn) {
		document.getElementById("content").innerHTML = "Logged in";
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
